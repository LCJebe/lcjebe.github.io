// Canonical R2 URL builder. Centralized so prefix/host changes happen in
// exactly one place — every consumer (PhotoGrid, builder, scripts) imports
// from here.

import type { Format, Size } from "~/data/schema";

/** Cloudflare R2 custom domain serving the `assets` bucket. */
export const R2_PUBLIC_BASE = "https://assets.larsjebe.com";

const EXTENSION: Record<Format, string> = {
  sdr_webp: "webp",
  hdr_jpg: "jpg",
};

/**
 * Build a public URL for a photo derivative.
 *
 * @example
 *   photoUrl("IMG_5007", "sdr_webp", "540")
 *   // → "https://assets.larsjebe.com/portfolio_export/sdr_webp_540/IMG_5007.webp"
 */
export function photoUrl(id: string, format: Format, size: Size): string {
  const ext = EXTENSION[format];
  const prefix = `${format}_${size}`;
  // encodeURI (not encodeURIComponent) so spaces in legacy filenames like
  // "merged (2)" become %20 without mangling allowed punctuation. The bucket
  // accepts both encoded and raw, but encoded plays nicer with HTML attrs.
  return `${R2_PUBLIC_BASE}/portfolio_export/${prefix}/${encodeURI(id)}.${ext}`;
}
