// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { builderSavePlugin } from './scripts/builder/savePlugin.ts';
import { fileURLToPath } from 'node:url';
import { readdir, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

// Strip leaked dev-tool artifacts from the production build. Dev-only pages
// (/builder, /mockups/*) short-circuit via `if (import.meta.env.PROD) return
// 404` in their frontmatter, so no HTML lands in dist/. But Astro/Vite still
// bundles their JS/CSS chunks (e.g. Builder.<hash>.js, work-rows.<hash>.css)
// because the pages' imports are evaluated. They end up orphaned — referenced
// by nothing in dist/ — but `grep -rq "builder" dist/` would still flag them.
//
// Pass 1: delete files whose name matches a dev-tool token.
// Pass 2: read every remaining _astro/ file; delete any whose content
// references a dev-tool token AND is not referenced by any HTML page in dist.
const DEV_TOOL_TOKEN = /builder|mockup|work-rows/i;
const stripBuilderInProd = {
  name: 'strip-dev-tools-in-prod',
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
        if (DEV_TOOL_TOKEN.test(f)) await remove(f);
        else surviving.push(f);
      }

      // Pass 2 — orphan detection.
      const htmlFiles = await collectHtml(distDir);
      const htmlText = (await Promise.all(htmlFiles.map((p) => readFile(p, 'utf8')))).join('\n');
      for (const f of surviving) {
        const content = await readFile(join(astroDir, f), 'utf8');
        if (!DEV_TOOL_TOKEN.test(content)) continue;
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
      filter: (page) => !page.includes('/builder') && !page.includes('/mockups'),
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
