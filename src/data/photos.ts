import type { Photo, FilterDef } from "~/components/PhotoGrid.astro";

export const photographySection = {
  marker: "04 · through the lens",
  title: "Photography.",
  desc:
    "Hand-curated. Some have appeared in Adobe launch blogs " +
    "(Project Indigo, Adobe Adaptive Profile). " +
    "Click any photo for full resolution.",
};

export const filters: FilterDef[] = [
  { id: "all", label: "All" },
  { id: "kitesurf", label: "Kitesurf" },
  { id: "landscapes", label: "Landscapes" },
  { id: "portraits", label: "Portraits" },
  { id: "lucy", label: "Lucy" },
];

/**
 * Photo set for v1 launch. Pulled from existing /images/gallery/ + /images/.
 *
 * To be expanded to 20–40 hand-curated photos by Lars (DESIGN.md §5).
 * Width/height should be filled in for each photo before launch — they
 * power the lightbox dimensions and prevent layout shift.
 *
 * Theme assignment is best-effort and can be re-tagged after curation.
 */
export const photos: Photo[] = [
  {
    src: "/images/gallery/kite_sunset.jpg",
    alt: "Kite at sunset",
    theme: "kitesurf",
  },
  {
    src: "/images/gallery/waves_narrow.jpg",
    alt: "Waves on the North Shore",
    theme: "landscapes",
  },
  {
    src: "/images/gallery/lars_lucy3_square.jpg",
    alt: "Lars and Lucy",
    theme: "lucy",
  },
  {
    src: "/images/gallery/kitesurfing_square.jpg",
    alt: "Kitesurfing",
    theme: "kitesurf",
  },
  {
    src: "/images/lars_lucy.jpg",
    alt: "Lars and Lucy",
    theme: "lucy",
  },
  {
    src: "/images/gallery/waves.jpg",
    alt: "Waves",
    theme: "landscapes",
  },
  {
    src: "/images/lars_lucy2.jpg",
    alt: "Lars and Lucy at the beach",
    theme: "lucy",
  },
  {
    src: "/images/gallery/kitesurfing.jpeg",
    alt: "Kitesurfing on the water",
    theme: "kitesurf",
  },
  {
    src: "/images/lars_pali.jpg",
    alt: "Pali lookout, Hawaii",
    theme: "portraits",
  },
];

export const galleryFooterHtml =
  `<a href="https://www.flickr.com/photos/larsjebe/" class="link">More on Flickr →</a>` +
  ` &nbsp; · &nbsp; ` +
  `<a href="https://www.instagram.com/larsjebe/" class="link">Instagram @larsjebe →</a>`;
