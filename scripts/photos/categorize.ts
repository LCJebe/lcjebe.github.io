// Use Gemini Flash to categorize each photo against a controlled vocab.
// Writes ai_categories + ai_suggested_categories back into photos.json.
//
// Auth: Application Default Credentials. Run once interactively:
//   gcloud auth application-default login
// The Vertex AI client picks them up automatically. No API key needed.
//
// Required in .env.local (gitignored — keep these out of source control):
//   GOOGLE_CLOUD_PROJECT
//   GOOGLE_CLOUD_LOCATION   (e.g. "global" or "us-central1")
//   GEMINI_MODEL            (e.g. "gemini-3-flash")
//   GEMINI_API_VERSION      (e.g. "v1") — optional; defaults to "v1"
//
// Run: tsx scripts/photos/categorize.ts [--force] [--limit N]
//   --force   re-categorize every photo, even ones that already have AI tags
//   --limit N process only the first N photos (handy for smoke-testing)

import { GoogleGenAI, type Content } from "@google/genai";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Readable } from "node:stream";
import {
  PhotosFileSchema,
  type Photo,
  type PhotosFile,
} from "../../src/data/schema.ts";

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

const ai = new GoogleGenAI({
  vertexai: true,
  project: env("GOOGLE_CLOUD_PROJECT"),
  location: env("GOOGLE_CLOUD_LOCATION"),
  apiVersion: process.env.GEMINI_API_VERSION ?? "v1",
});

const MODEL = env("GEMINI_MODEL");
const MANIFEST_PATH = "src/data/photos.json";
const VOCAB_PATH = "src/data/categories.seed.json";
const PROBE_PREFIX = "portfolio_export/sdr_webp_540/";
const BATCH_SIZE = 10;

// ─── helpers ───────────────────────────────────────────────────────────────

async function downloadBuffer(key: string): Promise<Buffer> {
  const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const stream = r.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  const tmp = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
  await rename(tmp, path);
}

// Response schema mirrors what we want back. Strict — no extra fields.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    photos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          categories: { type: "array", items: { type: "string" } },
          suggested_new_categories: { type: "array", items: { type: "string" } },
        },
        required: ["id", "categories", "suggested_new_categories"],
      },
    },
  },
  required: ["photos"],
} as const;

interface BatchResult {
  id: string;
  categories: string[];
  suggested_new_categories: string[];
}

async function categorizeBatch(
  photos: Photo[],
  vocab: string[],
): Promise<BatchResult[]> {
  // Download all batch images in parallel.
  const images = await Promise.all(
    photos.map((p) => downloadBuffer(`${PROBE_PREFIX}${p.id}.webp`)),
  );

  const promptHeader =
    `You are categorizing photos for a personal photography portfolio.\n\n` +
    `Assign at most 3 categories to each photo from this controlled vocab:\n` +
    `${vocab.map((v) => `- ${v}`).join("\n")}\n\n` +
    `Rules:\n` +
    `- Only emit categories that are exactly in the vocab above.\n` +
    `- If a photo fits the vocab, leave suggested_new_categories empty.\n` +
    `- If a photo does NOT fit any vocab term well, leave categories empty ` +
    `and propose 1–3 short terms in suggested_new_categories.\n` +
    `- A photo can have zero categories — don't force it.\n\n` +
    `I'm sending ${photos.length} photos. Return one entry per photo, in the ` +
    `same order, with id matching exactly what I label below.\n`;

  const parts: Content["parts"] = [{ text: promptHeader }];
  photos.forEach((p, i) => {
    parts.push({ text: `\nPhoto ${i + 1}, id="${p.id}":` });
    parts.push({
      inlineData: {
        data: images[i].toString("base64"),
        mimeType: "image/webp",
      },
    });
  });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned no text");

  const parsed = JSON.parse(text) as { photos: BatchResult[] };
  if (!Array.isArray(parsed.photos)) {
    throw new Error("Gemini response missing photos array");
  }
  return parsed.photos;
}

function mergeIntoManifest(
  manifest: PhotosFile,
  results: BatchResult[],
  vocab: Set<string>,
): void {
  const byId = new Map(manifest.photos.map((p) => [p.id, p]));
  for (const r of results) {
    const photo = byId.get(r.id);
    if (!photo) {
      console.warn(`  ! Gemini returned unknown id "${r.id}" — skipping`);
      continue;
    }
    // Filter vocab categories to those actually in the vocab; the model
    // sometimes drifts despite the prompt.
    const valid = (r.categories ?? []).filter((c) => vocab.has(c));
    const drifted = (r.categories ?? []).filter((c) => !vocab.has(c));
    photo.ai_categories = valid;
    photo.ai_suggested_categories = [
      ...(r.suggested_new_categories ?? []),
      ...drifted, // out-of-vocab "categories" become suggestions
    ];
  }
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : Infinity;

  const manifest = PhotosFileSchema.parse(
    JSON.parse(await readFile(MANIFEST_PATH, "utf8")),
  );
  const vocab: string[] = JSON.parse(await readFile(VOCAB_PATH, "utf8"));
  const vocabSet = new Set(vocab);

  const candidates = manifest.photos.filter(
    (p) => force || p.ai_categories.length === 0,
  );
  const todo = candidates.slice(0, limit);
  console.log(
    `Categorize: ${todo.length} of ${manifest.photos.length} photos ` +
      `(${candidates.length} candidates, limit=${limit === Infinity ? "none" : limit})`,
  );
  if (todo.length === 0) {
    console.log("Nothing to do. Pass --force to re-categorize all.");
    return;
  }

  let processed = 0;
  let failed = 0;
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const ids = batch.map((p) => p.id);
    console.log(`\nBatch ${i / BATCH_SIZE + 1}: ${ids.join(", ")}`);
    try {
      const results = await categorizeBatch(batch, vocab);
      mergeIntoManifest(manifest, results, vocabSet);
      // Persist after each batch so a late failure doesn't lose earlier work.
      await atomicWriteJson(MANIFEST_PATH, manifest);
      for (const r of results) {
        const ok = r.categories.length > 0 ? r.categories.join(", ") : "(no fit)";
        const sug =
          r.suggested_new_categories.length > 0
            ? `  [+${r.suggested_new_categories.join(", ")}]`
            : "";
        console.log(`  ${r.id.padEnd(36)} → ${ok}${sug}`);
      }
      processed += batch.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  FAIL batch: ${msg}`);
      failed += batch.length;
    }
  }

  console.log(
    `\nDone. processed=${processed}  failed=${failed}  ` +
      `(${manifest.photos.length - processed - failed} untouched)`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
