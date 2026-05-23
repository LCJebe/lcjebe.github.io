// Generate a standalone HTML page that shows every photo with its AI
// categories and suggestions. Throwaway tool — useful for spot-checking
// Gemini's output before relying on it in the builder.
//
// Run: tsx scripts/photos/review.ts
//      open tmp/photos-review.html

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PhotosFileSchema } from "../../src/data/schema.ts";

const PUBLIC_BASE = "https://assets.larsjebe.com";
const OUT = "tmp/photos-review.html";

async function main(): Promise<void> {
  const manifest = PhotosFileSchema.parse(
    JSON.parse(await readFile("src/data/photos.json", "utf8")),
  );

  const cards = manifest.photos
    .map((p) => {
      const url = `${PUBLIC_BASE}/portfolio_export/sdr_webp_540/${encodeURI(p.id)}.webp`;
      const cats = p.ai_categories
        .map((c) => `<span class="cat">${c}</span>`)
        .join("");
      const sug = p.ai_suggested_categories
        .map((c) => `<span class="sug">+${c}</span>`)
        .join("");
      const empty = p.ai_categories.length === 0 ? `<span class="empty">no fit</span>` : "";
      return `<figure>
  <img src="${url}" alt="${p.id}" loading="lazy">
  <figcaption>
    <code>${p.id}</code>
    <div class="tags">${cats}${empty}${sug}</div>
  </figcaption>
</figure>`;
    })
    .join("\n");

  const html = `<!doctype html>
<meta charset="utf-8">
<title>Photo categorization review (${manifest.photos.length})</title>
<style>
  :root { color-scheme: dark; --bg: #111; --fg: #eee; --mute: #888; }
  body { background: var(--bg); color: var(--fg); font: 14px/1.4 system-ui, sans-serif; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 16px; font-weight: 500; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  figure { margin: 0; }
  img { width: 100%; height: auto; display: block; border-radius: 4px; }
  figcaption { padding: 8px 0; }
  code { color: var(--mute); font-size: 12px; }
  .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .cat { background: #2a4a3a; color: #aef; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
  .sug { background: #3a2a4a; color: #fae; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
  .empty { color: var(--mute); font-style: italic; padding: 2px 8px; font-size: 12px; }
</style>
<h1>Photo categorization — ${manifest.photos.length} photos</h1>
<div class="grid">
${cards}
</div>
`;

  await mkdir("tmp", { recursive: true });
  await writeFile(OUT, html);
  console.log(`Wrote ${OUT}  (open it: open ${OUT})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
