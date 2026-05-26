// One-shot generator for the HDR-bright amber dot used by the PhotoGrid's
// HDR-ON badge. Outputs an alpha-channel AVIF at public/hdr-dot.avif with
// BT.2020 primaries + PQ (SMPTE 2084) transfer. On HDR displays Chrome /
// Safari render it brighter than SDR diffuse white; on SDR displays it
// clamps to a normal amber.
//
// Why this exists: pure CSS HDR colors (color(rec2100-pq ...)) are
// inconsistently honored by browsers for non-media elements. An <img> /
// background-image of an HDR-tagged AVIF goes through the same HDR
// rendering path as photos — much more reliable.
//
// Pipeline: pre-encode HDR-range values in PQ space into a 16-bit RGBA
// buffer → write as 16-bit PNG (sharp) → encode with avifenc using
// `--cicp 9/16/9` (BT.2020 / SMPTE2084 / BT.2020nc) so decoders treat the
// stored values as PQ HDR. `--ignore-icc` keeps avifenc from reinterpreting
// our raw PQ values through any sRGB ICC profile sharp might attach.
//
// Run with: `tsx scripts/build-hdr-dot.ts`. Re-run only if you want to
// tweak the dot's color/size/intensity.

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = "public/hdr-dot.avif";
const SIZE = 32; // tight bounds so the solid disk dominates the rendered tile
const DOT_R = 15; // disk fills ~94% of the box; 1px anti-aliased edge

// Amber peak brightness in display-referred linear, where 1.0 = 10000 cd/m².
// SDR diffuse white sits at 0.01 (100 cd/m²). Setting red to 0.08 puts the
// dot's red channel at ~800 cd/m² — solidly above SDR white, but well below
// peak so it doesn't trigger aggressive ABL on most HDR panels.
//
// Channel ratios match the site's design accent oklch(0.80 0.10 70) when
// converted through Oklab → linear sRGB (≈ 1.0 / 0.55 / 0.22). Same hue
// the rest of the site uses — just pushed into HDR overrange.
const PEAK = 0.08;
const AMBER_R = PEAK * 1.0;
const AMBER_G = PEAK * 0.55;
const AMBER_B = PEAK * 0.22;

// PQ EOTF inverse — encode display-referred linear (in [0,1]) to PQ code [0,1].
function linearToPQ(L: number): number {
  if (L <= 0) return 0;
  const m1 = 0.1593017578125;
  const m2 = 78.84375;
  const c1 = 0.8359375;
  const c2 = 18.8515625;
  const c3 = 18.6875;
  const Y = Math.pow(Math.min(L, 1), m1);
  return Math.pow((c1 + c2 * Y) / (1 + c3 * Y), m2);
}

const buf = new Uint16Array(SIZE * SIZE * 4);

// Pre-encode the solid amber color in PQ once. Inside the disk every pixel
// is full-brightness amber; the edge picks up sub-pixel coverage via alpha.
const pqR = Math.round(linearToPQ(AMBER_R) * 65535);
const pqG = Math.round(linearToPQ(AMBER_G) * 65535);
const pqB = Math.round(linearToPQ(AMBER_B) * 65535);

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - SIZE / 2 + 0.5;
    const dy = y - SIZE / 2 + 0.5;
    const r = Math.sqrt(dx * dx + dy * dy);

    // Linear coverage falloff across a 1px transition zone gives a clean
    // anti-aliased edge without the disk feeling soft.
    let coverage: number;
    if (r <= DOT_R - 0.5) coverage = 1;
    else if (r >= DOT_R + 0.5) coverage = 0;
    else coverage = 0.5 - (r - DOT_R);

    const idx = (y * SIZE + x) * 4;
    buf[idx + 0] = pqR;
    buf[idx + 1] = pqG;
    buf[idx + 2] = pqB;
    buf[idx + 3] = Math.round(coverage * 65535);
  }
}

const tmp = mkdtempSync(join(tmpdir(), "hdr-dot-"));
const rawPath = join(tmp, "raw.bin");
const pngPath = join(tmp, "raw16.png");

// Write raw bytes to disk and convert to a 16-bit RGBA PNG via ffmpeg.
// sharp's raw-input API silently downsamples to 8-bit (no `depth` option),
// which truncates our PQ-encoded high bytes and corrupts the color. ffmpeg
// preserves all 16 bits per channel on the way into PNG. avifenc reads the
// 16-bit PNG and packs it into 10-bit YUV without further loss.
writeFileSync(rawPath, Buffer.from(buf.buffer));
const ffmpeg = spawnSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-f", "rawvideo",
    "-pix_fmt", "rgba64le",
    "-s", `${SIZE}x${SIZE}`,
    "-i", rawPath,
    pngPath,
  ],
  { stdio: ["ignore", "ignore", "inherit"] },
);
if (ffmpeg.status !== 0) {
  throw new Error(`ffmpeg exited ${ffmpeg.status}`);
}

// --cicp 9/16/9 = BT.2020 primaries / SMPTE 2084 (PQ) transfer / BT.2020nc
//   matrix coefficients. This is the HDR10 signaling that tells decoders
//   "interpret the stored values as PQ-encoded BT.2020 — render in HDR if
//   the display supports it, tone-map to SDR otherwise".
// -d 10 = 10-bit output (HDR requires ≥10).
// -y 444 = YUV 4:4:4 (no chroma subsampling — better for tiny solid colors).
// -q 95 / --qalpha 100 = visually lossless color, fully lossless alpha.
// --ignore-icc = don't apply any sRGB ICC profile sharp may have written
//   into the PNG. Our pixel values are already pre-encoded in PQ space;
//   any conversion would double-process them.
const args = [
  "-d", "10",
  "-y", "444",
  "-q", "95",
  "--qalpha", "100",
  "--cicp", "9/16/9",
  "--ignore-icc",
  pngPath,
  OUT,
];

const result = spawnSync("avifenc", args, { stdio: "inherit" });
if (result.status !== 0) {
  throw new Error(`avifenc exited ${result.status}`);
}
console.log(`wrote ${OUT}`);
