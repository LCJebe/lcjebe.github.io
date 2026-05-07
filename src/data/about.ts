import type { ContactRow } from "~/components/ContactList.astro";

export const aboutSection = {
  marker: "07 · ABOUT & CONTACT",
  title: "Bio.",
};

/**
 * Bio paragraphs as raw HTML strings to allow inline <span class="smallcaps">
 * for institution names. The first paragraph automatically gets a drop-cap
 * via the .about p:first-child::first-letter rule.
 *
 * Style note: this is About-as-context, not About-as-CV-recap. The hero +
 * sidebar already list affiliations; this section adds the through-line.
 */
export const bioParagraphsHtml: string[] = [
  `Grew up in Germany. Studied EE at <span class="smallcaps">RWTH Aachen</span> ` +
    `and <span class="smallcaps">Stanford</span> because I wanted to know how ` +
    `cameras actually work — and ended up on Marc Levoy's computational ` +
    `photography team at <span class="smallcaps">Adobe</span>, which is roughly ` +
    `the answer to that question. Now at <span class="smallcaps">Phota Labs</span>: ` +
    `same instinct, larger toolkit.`,

  `Outside the engineering: classical piano since I was a kid, photography ` +
    `that actually leaves the house, kitesurfing when the wind cooperates, ` +
    `and Lucy — Siberian husky, much louder than I am. I write the way I'd ` +
    `talk; I'd rather be specific than slick.`,

  `Open to conversations about <em>AI engineering for creative tools, ` +
    `computational photography, generative visual systems, and image-quality ` +
    `work that ships.</em> If any of those overlap with what you're building, ` +
    `please get in touch.`,
];

export const contactRows: ContactRow[] = [
  {
    key: "Email",
    value: "lars.jebe@gmail.com",
    href: "mailto:lars.jebe@gmail.com",
  },
  {
    key: "GitHub",
    value: "@LCJebe",
    href: "https://github.com/LCJebe",
  },
  {
    key: "Scholar",
    value: "Google Scholar",
    href: "https://scholar.google.com/citations?user=LN7Fd_QAAAAJ",
  },
  {
    key: "Flickr",
    value: "@larsjebe",
    href: "https://www.flickr.com/photos/larsjebe/",
  },
  {
    key: "Instagram",
    value: "@larsjebe",
    href: "https://www.instagram.com/larsjebe/",
  },
  {
    key: "LinkedIn",
    value: "/in/larsjebe",
    href: "https://www.linkedin.com/in/larsjebe/",
  },
  {
    key: "CV",
    value: "cv-2026.pdf",
    href: "/cv.pdf",
    download: true,
  },
];
