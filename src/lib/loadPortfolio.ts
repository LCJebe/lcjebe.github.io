// Build-time loader. Joins photos.json (machine-generated catalog) with
// portfolio.json (hand-edited layout) and returns the shape PhotoGrid wants:
// a flat list of photos in display order plus the filter chip definitions.
//
// Astro evaluates this at static build time. A schema-mismatch in either JSON
// throws here and fails the build loudly — exactly what we want.

import photosRaw from "~/data/photos.json";
import portfolioRaw from "~/data/portfolio.json";
import {
  PhotosFileSchema,
  PortfolioSchema,
  type Render,
  type Size,
} from "~/data/schema";
import { photoUrl } from "~/lib/photoUrl";
import type { Photo as GridPhoto, FilterDef } from "~/components/PhotoGrid.astro";

export interface PortfolioView {
  photos: GridPhoto[];
  filters: FilterDef[];
  /** Resolved per-category display order, keyed by category id. Built by
   *  consulting portfolio.category_orders first, then falling back to the
   *  global `order` filtered to that category's members. The site uses this
   *  to repack the masonry per-category without affecting the "All" view. */
  categoryOrders: Record<string, string[]>;
  render: Render;
}

// Long-edge pixel count for each derivative size. The manifest probes the
// 270 derivative, so stored width/height are always ≤270px — fine as an
// aspect ratio, but PhotoSwipe reads data-pswp-width/height as the literal
// natural pixel size and would render the lightbox at that tiny resolution.
// Scaling the 270-baseline dimensions up to the chosen lightbox size gives
// PhotoSwipe the correct natural size, so the image fills the viewport.
const SIZE_LONG_EDGE: Record<Size, number> = {
  "270": 270,
  "540": 540,
  "1k": 1024,
  // "full" exports preserve the original camera resolution. We don't have
  // it in the manifest, so use a generous constant ≥ practical viewport
  // sizes — PhotoSwipe then fits to viewport rather than rendering at the
  // (tiny) probe-derived natural size.
  full: 8000,
};

export function loadPortfolio(): PortfolioView {
  const photosFile = PhotosFileSchema.parse(photosRaw);
  const portfolio = PortfolioSchema.parse(portfolioRaw);
  const byId = new Map(photosFile.photos.map((p) => [p.id, p]));

  const photos: GridPhoto[] = [];
  for (const id of portfolio.order) {
    const meta = byId.get(id);
    if (!meta) {
      // A photo in `order` that isn't in photos.json is a stale reference —
      // probably means R2 doesn't have it (or hasn't been re-manifested).
      // Skip with a warning rather than crashing the build.
      console.warn(`[loadPortfolio] order references unknown id "${id}" — skipping`);
      continue;
    }
    // Scale the manifest's 270-baseline dimensions up to the lightbox size
    // so PhotoSwipe's "natural" sizing matches the file actually served.
    const probeLongEdge = Math.max(meta.width, meta.height, 1);
    const scale =
      SIZE_LONG_EDGE[portfolio.render.lightbox_size] / probeLongEdge;
    photos.push({
      id,
      src: photoUrl(id, portfolio.render.tile_format, portfolio.render.tile_size),
      fullSrc: photoUrl(id, portfolio.render.lightbox_format, portfolio.render.lightbox_size),
      alt: id,
      categories: portfolio.photo_categories[id] ?? [],
      width: Math.round(meta.width * scale),
      height: Math.round(meta.height * scale),
    });
  }

  const filters: FilterDef[] = [
    { id: "all", label: "All" },
    ...portfolio.categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  // Resolve each category's display order. Explicit entries in
  // `category_orders` win, but we still defensively prune ids that aren't in
  // the global `order` (stale) and append any in-category members that the
  // user hasn't yet placed (e.g. just toggled into the category). Categories
  // without an explicit entry fall back to filtering the global `order`.
  const presentIds = new Set(photos.map((p) => p.id));
  const categoryOrders: Record<string, string[]> = {};
  for (const cat of portfolio.categories) {
    const inCat = portfolio.order.filter(
      (id) =>
        presentIds.has(id) &&
        (portfolio.photo_categories[id] ?? []).includes(cat.id),
    );
    const explicit = portfolio.category_orders[cat.id];
    if (!explicit) {
      categoryOrders[cat.id] = inCat;
      continue;
    }
    const inCatSet = new Set(inCat);
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const id of explicit) {
      if (inCatSet.has(id) && !seen.has(id)) {
        ordered.push(id);
        seen.add(id);
      }
    }
    for (const id of inCat) {
      if (!seen.has(id)) ordered.push(id);
    }
    categoryOrders[cat.id] = ordered;
  }

  return { photos, filters, categoryOrders, render: portfolio.render };
}
