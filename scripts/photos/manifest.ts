// Generate src/data/photos.json from R2.
//
// Lists portfolio_export/hdr_jpg_270/ (small derivatives, ~50 KB each),
// downloads each in turn, reads sharp metadata for orientation-corrected
// dimensions, and writes a sorted manifest. Idempotent: preserves any
// existing `ai_categories` / `ai_suggested_categories` from prior runs so
// the Gemini categorize script's output isn't clobbered when new photos
// are added.
//
// Run: tsx scripts/photos/manifest.ts

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { mkdir, rename, writeFile, readFile } from "node:fs/promises";
import { dirname, basename } from "node:path";
import type { Readable } from "node:stream";
import sharp from "sharp";
import { PhotosFileSchema, type Photo, type PhotosFile } from "../../src/data/schema.ts";

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

// Probe the 270 derivative — small, fast, already orientation-baked-in by
// sync.ts (.rotate() applied before resize). Its dims are aspect-correct;
// PhotoSwipe and the masonry both treat width/height as a ratio.
const PROBE_PREFIX = "portfolio_export/hdr_jpg_270/";
const HDR_FULL_PREFIX = "portfolio_export/hdr_jpg_full/";
const MANIFEST_PATH = "src/data/photos.json";

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

async function downloadBuffer(key: string): Promise<Buffer> {
  const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const stream = r.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function loadPriorManifest(): Promise<Map<string, Photo>> {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    const parsed = PhotosFileSchema.parse(JSON.parse(raw));
    return new Map(parsed.photos.map((p) => [p.id, p]));
  } catch {
    return new Map();
  }
}

function stripExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(0, dot) : name;
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  const tmp = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
  await rename(tmp, path);
}

async function main(): Promise<void> {
  const probeKeys = await listJpegKeys(PROBE_PREFIX);
  console.log(`Found ${probeKeys.length} probes in ${PROBE_PREFIX}`);

  const prior = await loadPriorManifest();
  const photos: Photo[] = [];

  for (const probeKey of probeKeys) {
    const probeName = basename(probeKey);
    const id = stripExt(probeName);
    // The full-size source is the canonical filename — the .jpg the user
    // uploaded from Lightroom, regardless of what the derivative is named.
    const filename = `${id}.jpg`;
    const sourceKey = `${HDR_FULL_PREFIX}${filename}`;

    const buf = await downloadBuffer(probeKey);
    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height) {
      console.error(`  FAIL  ${id}  (no dims)`);
      continue;
    }

    const priorEntry = prior.get(id);
    photos.push({
      id,
      filename,
      width: meta.width,
      height: meta.height,
      ai_categories: priorEntry?.ai_categories ?? [],
      ai_suggested_categories: priorEntry?.ai_suggested_categories ?? [],
    });

    const cached = priorEntry ? " (preserved AI)" : "";
    console.log(`  read  ${id}  ${meta.width}x${meta.height}${cached}`);
    // Suppress unused-var warning for sourceKey when no consumer uses it yet.
    void sourceKey;
  }

  photos.sort((a, b) => a.id.localeCompare(b.id));
  const manifest: PhotosFile = { version: 1, photos };
  await atomicWriteJson(MANIFEST_PATH, manifest);

  console.log(`\nWrote ${photos.length} photos to ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
