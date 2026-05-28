import type { PortraitFrame } from "~/components/HeroPortrait.astro";

export const hero = {
  // <em> renders italicized in muted color (see .hero h1.tagline em).
  // Line 1 = role, line 2 = domain specialization. Mirrors the two-line
  // rhythm of the previous tagline but recasts as "what I am · what I focus on".
  taglineHtml: `Research Engineer<br /><em>Generative Vision</em>`,

  // Lead paragraph. Front-loads the skill claim — what Lars does — before
  // the Adobe/Phota Labs biographical anchors. The previous lead opened with
  // "Four years on Marc Levoy's team..."; that's still here, just no longer
  // the first thing a skimmer reads.
  leadHtml:
    `I work at the seam between GenAI research and shipped product. ` +
    `I own the <strong>data and vision pipelines, and inference infrastructure</strong> ` +
    `that turn lab-grade techniques into something that real users love. ` +
    `Four years on Marc Levoy's computational photography team at Adobe, ` +
    `shipping <a class="link" href="https://apps.apple.com/us/app/project-indigo/id6742591546">an iOS app</a> ` +
    `and <a class="link" href="#shipped">multiple Lightroom features</a> used by tens of millions. ` +
    `Now at <a class="link" href="https://www.photalabs.com/">Phota Labs</a>, working ` +
    `on <a class="link" href="https://www.photalabs.com/blog/identity-preservation">personalizing ` +
    `generative photography to <em>you</em></a>. ` +
    `I think product-first — and build the tools I'd want to use myself.`,

  primaryCta: { href: "#shipped", label: "See shipped work" },
  secondaryCta: { href: "/cv-larsjebe-2026.pdf", label: "Download CV" },

  // Square portrait frames — served directly from /public/images/me/ until
  // they're processed into the R2 pipeline. `position` tunes the 1:1 crop
  // (CSS object-position) to keep the subject in frame.
  frames: [
    {
      src: "/images/me/DSC_0899.jpg",
      alt: "Lars in a wetsuit after a kite session, hills behind",
      caption: "POST-SESSION",
      position: "60% 30%",
    },
    {
      src: "/images/me/A7409780.jpg",
      alt: "Lars kitesurfing in breaking surf",
      caption: "KITE · WAVES",
      position: "center",
    },
    {
      src: "/images/me/lars_lucy3.jpg",
      alt: "Lars and Lucy the husky on the beach",
      caption: "LUCY · SIBERIAN HUSKY",
      position: "center 35%",
    },
    {
      src: "/images/me/DSC_1049.jpg",
      alt: "Lars at night in front of bokeh city lights",
      caption: "NIGHT · CITY LIGHTS",
      position: "center 30%",
    },
  ] satisfies PortraitFrame[],
};
