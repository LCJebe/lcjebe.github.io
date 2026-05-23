// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { builderSavePlugin } from './scripts/builder/savePlugin.ts';
import { fileURLToPath } from 'node:url';
import { readdir, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

// Strip leaked builder artifacts from the production build. The /builder page
// short-circuits via `if (import.meta.env.PROD) return 404` in its frontmatter,
// so no HTML lands in dist/builder/. But Astro/Vite still bundles JS chunks
// (Builder.<hash>.js) and CSS chunks (index.<hash>.css containing builder.css)
// because the page's imports are evaluated. They end up orphaned — referenced
// by nothing in dist/ — but `grep -rq "builder" dist/` would still flag them.
//
// Pass 1: delete files whose name contains "builder".
// Pass 2: read every remaining _astro/ file; delete any whose content
// references "builder" AND is not referenced by any HTML page in dist.
const stripBuilderInProd = {
  name: 'strip-builder-in-prod',
  hooks: {
    'astro:build:done': async (/** @type {{dir: URL}} */ { dir }) => {
      const distDir = fileURLToPath(dir);
      const astroDir = join(distDir, '_astro');
      let files;
      try {
        files = await readdir(astroDir);
      } catch {
        return; // no _astro/ on a no-op build
      }

      const remove = async (/** @type {string} */ name) => {
        await unlink(join(astroDir, name));
        console.log(`[strip-builder-in-prod] removed _astro/${name}`);
      };

      // Pass 1 — name match.
      const surviving = [];
      for (const f of files) {
        if (/builder/i.test(f)) await remove(f);
        else surviving.push(f);
      }

      // Pass 2 — orphan detection.
      const htmlFiles = await collectHtml(distDir);
      const htmlText = (await Promise.all(htmlFiles.map((p) => readFile(p, 'utf8')))).join('\n');
      for (const f of surviving) {
        const content = await readFile(join(astroDir, f), 'utf8');
        if (!/builder/i.test(content)) continue;
        const referenced = htmlText.includes(f);
        if (!referenced) await remove(f);
      }
    },
  },
};

async function collectHtml(/** @type {string} */ root) {
  /** @type {string[]} */
  const out = [];
  const walk = async (/** @type {string} */ dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
    }
  };
  await walk(root);
  return out;
}

export default defineConfig({
  site: 'https://larsjebe.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/builder'),
    }),
    react(),
    stripBuilderInProd,
  ],
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  vite: {
    css: {
      transformer: 'lightningcss',
    },
    build: {
      cssMinify: 'lightningcss',
    },
    plugins: [builderSavePlugin()],
    server: {
      watch: {
        // The builder's autosave writes to src/data/portfolio.json. Vite's
        // default HMR on that file change triggers a full page reload (JSON
        // imports aren't HMR-accepted), which jumps the editor's scroll
        // position back to the top. The builder reads the file via fetch(),
        // not import, so ignoring it from the watcher is safe.
        ignored: ['**/src/data/portfolio.json'],
      },
    },
  },
});
