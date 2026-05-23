// Sync photo derivatives in the R2 `assets` bucket.
//
// Reads full-size HDR/SDR JPEG sources, produces sized derivatives via the
// pipeline (UltraHDR JPEG for HDR, WebP for SDR thumbs), uploads back. Output
// keys mirror source basenames so source ↔ derivative pairing is stable.
//
// Idempotent: HEADs each output key first and skips if present. Pass --force
// to re-process and overwrite.
//
// Run: tsx scripts/photos/sync.ts [--force]
//
// Env (loaded from .env.local at repo root):
//   R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_S3_ENDPOINT

import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import type { Readable } from "node:stream";
import { resizeSdr, resizeUltraHdrJpeg } from "./pipeline.ts";

process.loadEnvFile(".env.local");

const env = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`missing ${k} in .env.local`);
  return v;
};

const BUCKET = env("R2_BUCKET");
const s3 = new S3Client({
  region: "auto",
  endpoint: env("R2_S3_ENDPOINT"),
  credentials: {
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  },
});

// Hot assets — public, long browser cache, immutable. Filenames are stable
// (preserved from Lightroom export), so to push an update either rename the
// source or run sync with --force and purge the Cloudflare cache.
const CACHE_CONTROL = "public, max-age=2592000, immutable";

// ─── derivative plans ──────────────────────────────────────────────────────

interface HdrPlan {
  srcPrefix: string;
  outPrefix: string;
  maxEdge: number;
}

interface SdrPlan {
  srcPrefix: string;
  outPrefix: string;
  maxEdge: number;
  format: "webp" | "avif" | "jpeg";
}

const HDR_SRC = "portfolio_export/hdr_jpg_full/";
// SDR derivatives are decoded from the SDR primary of the same UltraHDR JPEGs
// — sharp ignores the gain map (MPF2 segment), so reading hdr_jpg_full/ as an
// SDR source is correct and means one upload per photo, not two.
const SDR_SRC = HDR_SRC;

// Sentinel: resizeSdr uses fit:"inside" + withoutEnlargement, so a maxEdge
// larger than any source long edge becomes a no-op — output keeps source dims.
const SOURCE_SIZE = 100_000;

const HDR_PLANS: HdrPlan[] = [
  { srcPrefix: HDR_SRC, outPrefix: "portfolio_export/hdr_jpg_1k/",  maxEdge: 1000 },
  { srcPrefix: HDR_SRC, outPrefix: "portfolio_export/hdr_jpg_540/", maxEdge: 540 },
  { srcPrefix: HDR_SRC, outPrefix: "portfolio_export/hdr_jpg_270/", maxEdge: 270 },
];

const SDR_PLANS: SdrPlan[] = [
  { srcPrefix: SDR_SRC, outPrefix: "portfolio_export/sdr_webp_full/", maxEdge: SOURCE_SIZE, format: "webp" },
  { srcPrefix: SDR_SRC, outPrefix: "portfolio_export/sdr_webp_1k/",   maxEdge: 1000,        format: "webp" },
  { srcPrefix: SDR_SRC, outPrefix: "portfolio_export/sdr_webp_540/",  maxEdge: 540,         format: "webp" },
  { srcPrefix: SDR_SRC, outPrefix: "portfolio_export/sdr_webp_270/",  maxEdge: 270,         format: "webp" },
];

const FORMAT_MIME: Record<SdrPlan["format"], string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
};

const FORMAT_EXT: Record<SdrPlan["format"], string> = {
  webp: ".webp",
  avif: ".avif",
  jpeg: ".jpg",
};

// ─── R2 helpers ────────────────────────────────────────────────────────────

async function listJpegKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const r = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    for (const o of r.Contents ?? []) {
      if (o.Key && /\.jpe?g$/i.test(o.Key)) keys.push(o.Key);
    }
    token = r.NextContinuationToken;
  } while (token);
  return keys;
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (e) {
    const status = (e as { $metadata?: { httpStatusCode?: number } }).$metadata
      ?.httpStatusCode;
    if (status === 404 || (e as Error).name === "NotFound") return false;
    throw e;
  }
}

async function downloadObject(key: string, destPath: string): Promise<void> {
  const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const stream = r.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  await writeFile(destPath, Buffer.concat(chunks));
}

async function uploadObject(
  key: string,
  srcPath: string,
  contentType: string,
): Promise<void> {
  const body = await readFile(srcPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
  );
}

// ─── processing ────────────────────────────────────────────────────────────

function swapExt(name: string, newExt: string): string {
  const dot = name.lastIndexOf(".");
  return (dot >= 0 ? name.slice(0, dot) : name) + newExt;
}

interface Stats {
  uploaded: number;
  skipped: number;
  failures: { key: string; err: string }[];
}

const stats: Stats = { uploaded: 0, skipped: 0, failures: [] };

async function processOne(
  srcKey: string,
  dstKey: string,
  force: boolean,
  produce: (srcLocal: string, dstLocal: string) => Promise<void>,
  dstExt: string,
  contentType: string,
): Promise<void> {
  if (!force && (await objectExists(dstKey))) {
    console.log(`  skip   ${dstKey}`);
    stats.skipped++;
    return;
  }
  const work = await mkdtemp(join(tmpdir(), "r2-sync-"));
  try {
    const srcLocal = join(work, basename(srcKey));
    const dstLocal = join(work, `out${dstExt}`);
    await downloadObject(srcKey, srcLocal);
    await produce(srcLocal, dstLocal);
    await uploadObject(dstKey, dstLocal, contentType);
    console.log(`  upload ${dstKey}`);
    stats.uploaded++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL   ${dstKey}  (${msg})`);
    stats.failures.push({ key: srcKey, err: msg });
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

// Sources without a gain map are still served from the hdr_jpg_* slot — they
// just won't claim HDR headroom on capable displays. Treat the gain map as
// optional: try the UltraHDR pipeline first, fall back to a plain SDR JPEG
// resize when the source has no MPImage2.
async function resizeMaybeUltraHdrJpeg(
  src: string,
  dst: string,
  maxEdge: number,
): Promise<void> {
  try {
    await resizeUltraHdrJpeg(src, dst, maxEdge);
  } catch (e) {
    if (e instanceof Error && /no Ultra HDR gain map/.test(e.message)) {
      // Plain JPEG resize at parity quality with the UltraHDR primary (q=92).
      await resizeSdr(src, dst, { maxEdge, format: "jpeg", quality: 92 });
      return;
    }
    throw e;
  }
}

async function processHdr(plan: HdrPlan, force: boolean): Promise<void> {
  const keys = await listJpegKeys(plan.srcPrefix);
  console.log(`HDR ${plan.outPrefix}  (${keys.length} sources, ${plan.maxEdge}px)`);
  for (const srcKey of keys) {
    const dstKey = plan.outPrefix + basename(srcKey);
    await processOne(
      srcKey, dstKey, force,
      (s, d) => resizeMaybeUltraHdrJpeg(s, d, plan.maxEdge),
      ".jpg", "image/jpeg",
    );
  }
}

async function processSdr(plan: SdrPlan, force: boolean): Promise<void> {
  const keys = await listJpegKeys(plan.srcPrefix);
  const ext = FORMAT_EXT[plan.format];
  console.log(
    `SDR ${plan.outPrefix}  (${keys.length} sources, ${plan.maxEdge}px ${plan.format})`,
  );
  for (const srcKey of keys) {
    const dstKey = plan.outPrefix + swapExt(basename(srcKey), ext);
    await processOne(
      srcKey, dstKey, force,
      (s, d) => resizeSdr(s, d, { maxEdge: plan.maxEdge, format: plan.format }),
      ext, FORMAT_MIME[plan.format],
    );
  }
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  for (const p of HDR_PLANS) await processHdr(p, force);
  for (const p of SDR_PLANS) await processSdr(p, force);

  console.log(
    `\nDone. uploaded=${stats.uploaded}  skipped=${stats.skipped}  failed=${stats.failures.length}`,
  );
  if (stats.failures.length > 0) {
    console.log("\nFailures:");
    for (const f of stats.failures) console.log(`  ${f.key}\n    ${f.err}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
