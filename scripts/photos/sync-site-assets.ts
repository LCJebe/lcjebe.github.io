// Sync site (non-portfolio) assets to the R2 `assets` bucket.
//
// Reads local source files in public/images/ and produces:
//   - originals at   site/originals/<purpose>/<name>.<ext>
//   - WebP derivs at site/<purpose>/<name>_<size>.webp  (size ∈ 270|540|1k|2k)
//
// 2k is only produced for `tier:"large"` (hero + artwork).
//
// Idempotent: HEADs each output key first and skips if present. --force to
// re-process and overwrite. resizeSdr uses fit:"inside" + withoutEnlargement,
// so sizes larger than the source long edge collapse to a no-op (output keeps
// source dimensions) — safe for already-small inputs.
//
// Run: tsx scripts/photos/sync-site-assets.ts [--force]

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resizeSdr } from "./pipeline.ts";

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

const CACHE_CONTROL = "public, max-age=2592000, immutable";

// ─── manifest ──────────────────────────────────────────────────────────────

type Tier = "thumb" | "large";

interface Asset {
  /** Shared path stem: src = `public/images/<path>.<ext>`,
   *  derivative key = `site/<path>_<size>.webp`,
   *  original key   = `site/originals/<path>.<ext>`. */
  path: string;
  /** Source extension (must include the dot). */
  ext: ".jpg" | ".jpeg" | ".png" | ".webp";
  /** "thumb" → 270/540/1k; "large" → also 2k. */
  tier: Tier;
}

// Local layout under public/images/ mirrors the R2 layout exactly, so the
// `path` field doubles as both the on-disk path stem and the R2 destination.
// Hero + artwork get a 2k derivative (full-bleed displays); everything else
// stops at 1k (small thumbs).
const ASSETS: Asset[] = [
  // sidebar
  { path: "sidebar/lars_pali", ext: ".jpg", tier: "thumb" },

  // hero carousel
  { path: "hero/kite_sunset",  ext: ".jpg", tier: "large" },
  { path: "hero/waves_narrow", ext: ".jpg", tier: "large" },
  { path: "hero/lars_lucy3",   ext: ".jpg", tier: "large" },

  // shipped products
  { path: "shipped/phota",      ext: ".webp", tier: "thumb" },
  { path: "shipped/indigo",     ext: ".png",  tier: "thumb" },
  { path: "shipped/adaptive",   ext: ".webp", tier: "thumb" },
  { path: "shipped/reflection", ext: ".jpg",  tier: "thumb" },

  // publications
  { path: "publications/diffusionrig",           ext: ".jpg", tier: "thumb" },
  { path: "publications/neural_photo_finishing", ext: ".jpg", tier: "thumb" },
  { path: "publications/nlr",                    ext: ".jpg", tier: "thumb" },
  { path: "publications/rwth_1",                 ext: ".jpg", tier: "thumb" },
  { path: "publications/rwth_2",                 ext: ".jpg", tier: "thumb" },

  // artwork — single pieces
  { path: "artwork/painting_sunrise", ext: ".jpg", tier: "large" },
  { path: "artwork/third_movement",   ext: ".jpg", tier: "large" },

  // artwork — venice collage
  { path: "artwork/venice_1", ext: ".jpg", tier: "large" },
  { path: "artwork/venice_2", ext: ".jpg", tier: "large" },
  { path: "artwork/venice_3", ext: ".jpg", tier: "large" },

  // artwork — woodworking (8 photos)
  ...Array.from({ length: 8 }, (_, i): Asset => ({
    path: `artwork/woodworking/${i + 1}`,
    ext: ".jpg",
    tier: "large",
  })),
];

const localSrc = (a: Asset): string => `public/images/${a.path}${a.ext}`;

const THUMB_SIZES: { label: string; maxEdge: number }[] = [
  { label: "270", maxEdge: 270 },
  { label: "540", maxEdge: 540 },
  { label: "1k",  maxEdge: 1000 },
];
const LARGE_EXTRA: { label: string; maxEdge: number }[] = [
  { label: "2k", maxEdge: 2000 },
];

const ORIGINAL_MIME: Record<Asset["ext"], string> = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
};

// ─── R2 helpers ────────────────────────────────────────────────────────────

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

interface Stats {
  uploaded: number;
  skipped: number;
  failures: { key: string; err: string }[];
}

const stats: Stats = { uploaded: 0, skipped: 0, failures: [] };

async function syncOriginal(asset: Asset, force: boolean): Promise<void> {
  const key = `site/originals/${asset.path}${asset.ext}`;

  if (!force && (await objectExists(key))) {
    console.log(`  skip   ${key}`);
    stats.skipped++;
    return;
  }
  try {
    await uploadObject(key, localSrc(asset), ORIGINAL_MIME[asset.ext]);
    console.log(`  upload ${key}`);
    stats.uploaded++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL   ${key}  (${msg})`);
    stats.failures.push({ key, err: msg });
  }
}

async function syncDerivative(
  asset: Asset,
  size: { label: string; maxEdge: number },
  force: boolean,
): Promise<void> {
  const key = `site/${asset.path}_${size.label}.webp`;

  if (!force && (await objectExists(key))) {
    console.log(`  skip   ${key}`);
    stats.skipped++;
    return;
  }

  const work = await mkdtemp(join(tmpdir(), "site-asset-"));
  try {
    const out = join(work, `out_${size.label}.webp`);
    await resizeSdr(localSrc(asset), out, {
      maxEdge: size.maxEdge,
      format: "webp",
      quality: 80,
    });
    await uploadObject(key, out, "image/webp");
    console.log(`  upload ${key}`);
    stats.uploaded++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL   ${key}  (${msg})`);
    stats.failures.push({ key, err: msg });
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const force = process.argv.includes("--force");

  console.log(`Originals (${ASSETS.length})`);
  for (const a of ASSETS) await syncOriginal(a, force);

  const sizesFor = (t: Tier) => (t === "large" ? [...THUMB_SIZES, ...LARGE_EXTRA] : THUMB_SIZES);

  for (const a of ASSETS) {
    console.log(`Derivatives ${a.path} (${a.tier})`);
    for (const s of sizesFor(a.tier)) await syncDerivative(a, s, force);
  }

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
