import type { PortraitFrame } from "~/components/HeroPortrait.astro";

export const hero = {
  // <em> renders italicized in muted color (see .hero h1.tagline em).
  // Line 1 = role, line 2 = domain specialization. Mirrors the two-line
  // rhythm of the previous tagline but recasts as "what I am · what I focus on".
  taglineHtml: `Research Engineer<br /><em>Visual Generative AI</em>`,

  // Lead, broken into two paragraphs. Para 1 front-loads the skill claim —
  // what Lars does. Para 2 carries the Adobe/Phota Labs biographical anchors
  // and the product-first close.
  leadParagraphsHtml: [
    `I work at the seam between GenAI research and shipped product. ` +
    `I own the <strong>data and vision pipelines, agentic workflows, and inference infrastructure</strong> ` +
    `that turn lab-grade techniques into something that real users love.`,
    `Four years on Marc Levoy's computational photography team at Adobe, ` +
    `shipping <a class="link" href="https://apps.apple.com/us/app/project-indigo/id6742591546">an iOS app</a> ` +
    `and <a class="link" href="#shipped">multiple Lightroom features</a> used by tens of millions. ` +
    `Now at <a class="link" href="https://www.photalabs.com/">Phota Labs</a>, working ` +
    `on <a class="link" href="https://www.photalabs.com/blog/identity-preservation">personalizing ` +
    `generative photography to <em>you</em></a>. ` +
    `I think product-first, and build the tools I'd want to use myself.`,
  ],

  primaryCta: { href: "#shipped", label: "See shipped work" },
  secondaryCta: { href: "/cv-larsjebe-2026.pdf", label: "Download CV" },

  // Square portrait frames — pre-cropped 1:1 images served from R2 via
  // siteAssetUrl (path stem under site/me/square/). Synced by
  // scripts/photos/sync-site-assets.ts; rendered by HeroPortrait.astro.
  frames: [
    {
      path: "me/square/DSC_0899",
      alt: "Lars in a wetsuit after a kite session, hills behind",
      caption: "POST-SESSION",
    },
    {
      path: "me/square/A7409780",
      alt: "Lars kitesurfing in breaking surf",
      caption: "KITE · WAVES",
    },
    {
      path: "me/square/lars_lucy3",
      alt: "Lars and Lucy the husky on the beach",
      caption: "LUCY · SIBERIAN HUSKY",
    },
    {
      path: "me/square/DSC_1049",
      alt: "Lars at night in front of bokeh city lights",
      caption: "NIGHT · CITY LIGHTS",
    },
    {
      path: "me/square/A7400151",
      alt: "Lars kitesurfing across the face of a green wave",
      caption: "KITE · WAVE FACE",
    },
    {
      path: "me/square/DSC_1063",
      alt: "Lars crouched nose-to-nose with Lucy the husky in a sunlit park",
      caption: "LUCY · NOSE TO NOSE",
    },
    {
      path: "me/square/kitesurfing",
      alt: "Lars boosting a kitesurf jump with a board grab, mountains behind",
      caption: "KITE · AIRTIME",
    },
  ] satisfies PortraitFrame[],
};
