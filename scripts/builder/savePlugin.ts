// Vite plugin: dev-only save endpoint for the portfolio builder.
//
// Mounts a connect middleware at POST /__builder/save that validates the
// posted JSON against PortfolioSchema and writes src/data/portfolio.json
// atomically. Production builds never see this — `apply: "serve"` scopes
// the plugin to `astro dev` only.

import type { Connect, Plugin } from "vite";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PortfolioSchema } from "../../src/data/schema.ts";

const PORTFOLIO_PATH = "src/data/portfolio.json";

export function builderSavePlugin(): Plugin {
  return {
    name: "builder-save",
    apply: "serve",
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }
        try {
          const body = await readBody(req);
          const parsed = PortfolioSchema.parse(JSON.parse(body));
          await atomicWriteJson(PORTFOLIO_PATH, parsed);

          // astro.config.mjs tells Vite's file watcher to ignore
          // portfolio.json so the builder doesn't reload itself on every
          // autosave. The side effect: viewer pages also don't get notified.
          // Manually invalidate the cached import so the next SSR pass
          // re-reads from disk, then broadcast a custom HMR event for any
          // open viewer page to refresh.
          const absPath = resolve(PORTFOLIO_PATH);
          const cached = server.moduleGraph.getModulesByFile(absPath);
          if (cached) {
            for (const mod of cached) server.moduleGraph.invalidateModule(mod);
          }
          server.ws.send({ type: "custom", event: "portfolio:saved" });

          res.statusCode = 200;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(parsed));
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          res.statusCode = 400;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: message }));
        }
      };
      server.middlewares.use("/__builder/save", handler);
    },
  };
}

async function readBody(req: Connect.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  const tmp = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
  await rename(tmp, path);
}
