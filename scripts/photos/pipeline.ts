// Photo pipeline building blocks.
//
// Three exported functions:
//   - resizeUltraHdrJpeg   resize an ISO 21496-1 Ultra HDR JPEG, gain map intact
//   - resizeSdr            resize to AVIF/WebP/JPEG (no HDR — for grid thumbs / lightbox medium)
//   - readPhotoMetadata    pull IPTC keywords (→ filter tags), dimensions, alt/caption
//
// System requirements (NOT npm packages):
//   - exiftool         brew install exiftool
//   - ultrahdr_app     brew install libultrahdr
// npm dependency:
//   - sharp            npm install --save-dev sharp

import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileP = promisify(execFile);

// ─── types ─────────────────────────────────────────────────────────────────

export interface PhotoMetadata {
  width: number;
  height: number;
  /** IPTC keywords (or XMP dc:subject) — use as filter tags. */
  keywords: string[];
  /** IPTC headline / XMP title — short, alt-text-suitable. */
  title?: string;
  /** IPTC caption / XMP description — longer prose. */
  caption?: string;
  /** True if the source contains an ISO 21496-1 gain map. */
  hasGainMap: boolean;
}

export interface SdrResizeOptions {
  /** Long-edge size in pixels. Aspect ratio is preserved. */
  maxEdge: number;
  /** Output codec. AVIF (smallest), WebP (faster encode, broad tooling), JPEG (universal fallback). */
  format: "avif" | "webp" | "jpeg";
  /** Quality [1-100]. Defaults: AVIF 60, WebP 80, JPEG 85. */
  quality?: number;
}

// ─── HDR resize ────────────────────────────────────────────────────────────

/**
 * Resize an Ultra HDR JPEG (ISO 21496-1) preserving the gain map.
 *
 * Flow: extract embedded gain map + XMP-hdrgm parameters, resize the SDR
 * primary and the gain map to identical target dimensions with sharp, repack
 * with libultrahdr's encoder. Output renders HDR in modern Chrome / Safari /
 * Edge on capable displays; degrades to SDR everywhere else.
 *
 * Throws if the source is not an Ultra HDR JPEG (no MPImage2 gain map).
 */
export async function resizeUltraHdrJpeg(
  sourcePath: string,
  outputPath: string,
  maxEdge: number,
): Promise<void> {
  const work = await mkdtemp(join(tmpdir(), "uhdr-"));
  try {
    const gainmapSrc = join(work, "gainmap_src.jpg");
    const cfgPath = join(work, "metadata.cfg");
    const primaryDst = join(work, "primary.jpg");
    const gainmapDst = join(work, "gainmap.jpg");

    // 1. Extract embedded gain map (MPImage2) as a standalone JPEG.
    const gmBuf = await runExiftoolBinary(["-b", "-MPImage2", sourcePath]);
    if (gmBuf.length === 0) {
      throw new Error(`source has no Ultra HDR gain map: ${sourcePath}`);
    }
    await writeFile(gainmapSrc, gmBuf);

    // 2. Build libultrahdr metadata config from the gain map's XMP-hdrgm tags.
    await writeFile(cfgPath, await buildGainMapConfig(gainmapSrc));

    // 3. Resize primary and gain map to identical target dimensions.
    //    fit:"fill" forces exact dims — required because libultrahdr expects
    //    the primary and gain map to match. We pre-compute dims preserving
    //    aspect, so no distortion.
    const { width, height } = await readOrientedDimensions(sourcePath);
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const dstW = Math.round(width * scale);
    const dstH = Math.round(height * scale);

    await sharp(sourcePath)
      .rotate()
      .resize({ width: dstW, height: dstH, fit: "fill" })
      .keepIccProfile()
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(primaryDst);

    await sharp(gainmapSrc)
      .resize({ width: dstW, height: dstH, fit: "fill" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(gainmapDst);

    // 4. Repack into a single Ultra HDR JPEG (libultrahdr encode scenario 4).
    await execFileP("ultrahdr_app", [
      "-m", "0",
      "-i", primaryDst,
      "-g", gainmapDst,
      "-f", cfgPath,
      "-z", outputPath,
    ]);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

// ─── SDR derivatives ───────────────────────────────────────────────────────

/**
 * Resize to a non-HDR derivative (AVIF or JPEG). Use for grid thumbnails and
 * the lightbox's initial medium-res frame. ICC profile is preserved so wide-
 * gamut sources stay wide-gamut.
 */
export async function resizeSdr(
  sourcePath: string,
  outputPath: string,
  options: SdrResizeOptions,
): Promise<void> {
  const { maxEdge, format, quality } = options;
  const pipeline = sharp(sourcePath)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .keepIccProfile();

  if (format === "avif") {
    await pipeline.avif({ quality: quality ?? 60, effort: 6 }).toFile(outputPath);
  } else if (format === "webp") {
    await pipeline.webp({ quality: quality ?? 80, effort: 6 }).toFile(outputPath);
  } else {
    await pipeline.jpeg({ quality: quality ?? 85, mozjpeg: true }).toFile(outputPath);
  }
}

// ─── metadata read ─────────────────────────────────────────────────────────

/**
 * Read photo metadata for the manifest: dimensions (orientation-corrected),
 * IPTC keywords (the canonical place Lightroom writes filter tags), and
 * title/caption for alt text.
 */
export async function readPhotoMetadata(sourcePath: string): Promise<PhotoMetadata> {
  const tags = (await runExiftoolJson([
    "-j", "-G1",
    "-IPTC:Keywords",
    "-IPTC:ObjectName",
    "-IPTC:Caption-Abstract",
    "-XMP-dc:Subject",
    "-XMP-dc:Title",
    "-XMP-dc:Description",
    "-MPF0:NumberOfImages",
    sourcePath,
  ]))[0] ?? {};

  const { width, height } = await readOrientedDimensions(sourcePath);

  // Keywords: prefer IPTC, fall back to XMP dc:subject. Dedupe + trim.
  const keywords = Array.from(new Set(
    [...toArray(tags["IPTC:Keywords"]), ...toArray(tags["XMP-dc:Subject"])]
      .map((k) => k.trim())
      .filter(Boolean),
  ));

  // hasGainMap: a non-HDR JPEG has 0 or 1 MPF images; an Ultra HDR JPEG has 2+.
  const hasGainMap = Number(tags["MPF0:NumberOfImages"] ?? 0) >= 2;

  return {
    width,
    height,
    keywords,
    title: pickStr(tags["IPTC:ObjectName"], tags["XMP-dc:Title"]),
    caption: pickStr(tags["IPTC:Caption-Abstract"], tags["XMP-dc:Description"]),
    hasGainMap,
  };
}

// ─── internals ─────────────────────────────────────────────────────────────

async function buildGainMapConfig(gainmapPath: string): Promise<string> {
  const tags = (await runExiftoolJson([
    "-j", "-G1", "-XMP-hdrgm:all", gainmapPath,
  ]))[0] ?? {};

  // GainMapMin/Max and HDRCapacityMin/Max are stored in log2; libultrahdr's
  // cfg expects linear values (2^x). Gamma is stored linearly.
  const minBoost = log2ToLinearTriple(tags["XMP-hdrgm:GainMapMin"]);
  const maxBoost = log2ToLinearTriple(tags["XMP-hdrgm:GainMapMax"]);
  const gamma = tripleToString(asTriple(tags["XMP-hdrgm:Gamma"]));
  const offSdr = num(tags["XMP-hdrgm:OffsetSDR"] ?? 0);
  const offHdr = num(tags["XMP-hdrgm:OffsetHDR"] ?? 0);
  const capMin = Math.pow(2, Number(tags["XMP-hdrgm:HDRCapacityMin"] ?? 0)).toFixed(6);
  const capMax = Math.pow(2, Number(tags["XMP-hdrgm:HDRCapacityMax"] ?? 2)).toFixed(6);

  // useBaseColorSpace=1 says the gain map shares the SDR's color space.
  // True for Apple/Lightroom HDR exports; avoids needing a separate ICC on
  // the gain map JPEG (which sharp's resize wouldn't preserve anyway).
  return (
    `--maxContentBoost ${maxBoost}\n` +
    `--minContentBoost ${minBoost}\n` +
    `--gamma ${gamma}\n` +
    `--offsetSdr ${offSdr} ${offSdr} ${offSdr}\n` +
    `--offsetHdr ${offHdr} ${offHdr} ${offHdr}\n` +
    `--hdrCapacityMin ${capMin}\n` +
    `--hdrCapacityMax ${capMax}\n` +
    `--useBaseColorSpace 1.0\n`
  );
}

async function readOrientedDimensions(
  sourcePath: string,
): Promise<{ width: number; height: number }> {
  const meta = await sharp(sourcePath).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`could not read dimensions: ${sourcePath}`);
  }
  // Orientations 5-8 are 90/270 rotations: stored dims are swapped vs displayed.
  const swap = (meta.orientation ?? 1) >= 5;
  return swap
    ? { width: meta.height, height: meta.width }
    : { width: meta.width, height: meta.height };
}

function asTriple(v: unknown): [number, number, number] {
  if (Array.isArray(v) && v.length === 3) return [Number(v[0]), Number(v[1]), Number(v[2])];
  if (typeof v === "number") return [v, v, v];
  if (typeof v === "string") {
    const parts = v.split(",").map((x) => parseFloat(x.trim()));
    if (parts.length === 3) return [parts[0], parts[1], parts[2]];
    return [parts[0], parts[0], parts[0]];
  }
  return [0, 0, 0];
}

const tripleToString = (t: [number, number, number]) =>
  t.map((x) => x.toFixed(6)).join(" ");

const log2ToLinearTriple = (v: unknown) =>
  tripleToString(asTriple(v).map((x) => Math.pow(2, x)) as [number, number, number]);

const num = (v: unknown) => Number(v).toFixed(6);

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

function pickStr(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return undefined;
}

async function runExiftoolJson(args: string[]): Promise<Record<string, unknown>[]> {
  const { stdout } = await execFileP("exiftool", args);
  return stdout.trim() ? (JSON.parse(stdout) as Record<string, unknown>[]) : [];
}

async function runExiftoolBinary(args: string[]): Promise<Buffer> {
  const { stdout } = await execFileP("exiftool", args, {
    encoding: "buffer",
    maxBuffer: 100 * 1024 * 1024,
  });
  return stdout as Buffer;
}
