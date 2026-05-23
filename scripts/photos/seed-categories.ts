// Seed portfolio.json's photo_categories from photos.json's ai_categories.
//
// Conservative by default: only sets memberships for photos where the
// builder hasn't already assigned anything. Pass --force to overwrite all
// photo_categories (use after a fresh categorize run).
//
// Run: tsx scripts/photos/seed-categories.ts [--force]

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  PhotosFileSchema,
  PortfolioSchema,
} from "../../src/data/schema.ts";

const PHOTOS_PATH = "src/data/photos.json";
const PORTFOLIO_PATH = "src/data/portfolio.json";

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  const tmp = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
  await rename(tmp, path);
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");

  const photos = PhotosFileSchema.parse(
    JSON.parse(await readFile(PHOTOS_PATH, "utf8")),
  );
  const portfolio = PortfolioSchema.parse(
    JSON.parse(await readFile(PORTFOLIO_PATH, "utf8")),
  );

  const vocab = new Set(portfolio.categories.map((c) => c.id));
  const next = { ...portfolio.photo_categories };
  let seeded = 0;
  let skipped = 0;
  let untouched = 0;

  for (const photo of photos.photos) {
    const existing = next[photo.id] ?? [];
    if (!force && existing.length > 0) {
      skipped++;
      continue;
    }
    // Take only the FIRST AI category (the strongest match by Gemini's
    // ordering). The data model supports multi-membership, but seeding
    // single-membership keeps the portfolio readable; the user can add
    // more memberships later via the chip + button.
    const seedable = photo.ai_categories.find((c) => vocab.has(c));
    if (!seedable) {
      if (force) next[photo.id] = [];
      untouched++;
      continue;
    }
    next[photo.id] = [seedable];
    seeded++;
  }

  await atomicWriteJson(PORTFOLIO_PATH, {
    ...portfolio,
    photo_categories: next,
  });

  console.log(
    `Seeded ${seeded} photos. Skipped ${skipped} (already had categories). ` +
      `${untouched} had no AI categories matching the vocab.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
