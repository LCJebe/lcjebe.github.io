// URL builders for non-portfolio site assets on R2.
//
// Layout: site/<purpose>/<name>_<size>.webp (see scripts/photos/sync-site-assets.ts).
// `path` here is the "<purpose>/<name>" piece — e.g. "sidebar/lars_pali".

import { R2_PUBLIC_BASE } from "./photoUrl";

export type SiteAssetSize = "270" | "540" | "1k" | "2k";

/** Pixel width each size label maps to — used for `<srcset>` width descriptors. */
const SIZE_W: Record<SiteAssetSize, number> = {
  "270": 270,
  "540": 540,
  "1k": 1000,
  "2k": 2000,
};

export function siteAssetUrl(path: string, size: SiteAssetSize): string {
  return `${R2_PUBLIC_BASE}/site/${path}_${size}.webp`;
}

/**
 * Build a `srcset` string with width descriptors:
 *   `url 270w, url 540w, url 1000w`
 * Pair with a `sizes` attribute to let the browser pick.
 */
export function siteAssetSrcset(
  path: string,
  sizes: SiteAssetSize[],
): string {
  return sizes
    .map((s) => `${siteAssetUrl(path, s)} ${SIZE_W[s]}w`)
    .join(", ");
}

/**
 * Default size sets per tier.
 * - "thumb": no 2k (sidebar portrait, shipped/publication thumbs)
 * - "large": adds 2k (hero, artwork)
 */
export const THUMB_SIZES: SiteAssetSize[] = ["270", "540", "1k"];
export const LARGE_SIZES: SiteAssetSize[] = ["270", "540", "1k", "2k"];
