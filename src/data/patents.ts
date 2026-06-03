/**
 * Granted US patents, surfaced as a small credential under the
 * peer-review row at the bottom of the Research section.
 */

export type PatentEntry = {
  number: string;
  title: string;
  href: string;
};

export const patents: { entries: PatentEntry[] } = {
  entries: [
    {
      number: "US 12,518,440",
      title: "Neural photofinisher digital content stylization",
      href: "https://patents.google.com/patent/US12518440",
    },
    {
      number: "US 11,922,562",
      title: "Methods and systems for rendering view-dependent images using 2D images",
      href: "https://patents.google.com/patent/US11922562",
    },
  ],
};
