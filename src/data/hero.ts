import type { Frame } from "~/components/HeroCarousel.astro";

export const hero = {
  // <em> renders italicized in muted color (see .hero h1.tagline em)
  taglineHtml: `AI engineer building<br /><em>creative tools</em>`,

  // Lead paragraph. Frames Adobe tenure by scope/scale rather than by any
  // single feature — Adaptive Profile, Indigo, and the rest are detailed
  // in Section 02 (Shipped).
  leadHtml:
    `Four years on Marc Levoy's computational photography team at Adobe, ` +
    `shipping <a class="link" href="https://apps.apple.com/us/app/project-indigo/id6742591546">an iOS app</a> and ` +
    `<a class="link" href="#shipped">multiple Adobe Lightroom features</a> used by tens of millions. ` +
    `Now at <a class="link" href="https://www.photalabs.com/">Phota Labs</a> working on <a class="link" href="https://www.photalabs.com/blog/identity-preservation">personalizing generative AI to <em>you</em></a>. ` +
    `I take research-grade techniques and make them survive contact with ` +
    `real users, on real devices, at scale. I think product-first -- ` +
    `and build the tools I'd want to use myself.`,

  primaryCta: { href: "#shipped", label: "See shipped work" },
  secondaryCta: { href: "/cv-larsjebe-2026.pdf", label: "Download CV" },

  // 21:9 carousel frames.
  //
  // Note on `position`: the carousel container is 21:9 with `background-size: cover`.
  // Source photos that are NOT 21:9 (square or portrait-ish) get center-cropped,
  // which often hides the subject. Tune `position` per frame to pick the slice
  // that frames the action best. Format: "horizontal vertical" (CSS background-position).
  // - "center 70%" biases the visible slice toward the LOWER portion of the source.
  // - "center 30%" biases toward the UPPER portion.
  // - default is "center" / "center 50%" (centered).
  //
  // Long term, providing pre-cropped 21:9 source images is the cleanest fix —
  // the position knob is a stop-gap.
  frames: [
    {
      // 2400×2400 source — square. Without a position bias, viewer sees mostly sky.
      src: "/images/gallery/kite_sunset.jpg",
      alt: "Kite at sunset over the ocean",
      caption: "KITE · SUNSET · O'AHU",
      position: "center 72%",
    },
    {
      // 2400×827 source — already ~21:9, default centering works.
      src: "/images/gallery/waves_narrow.jpg",
      alt: "Waves on the North Shore",
      caption: "WAVES · NORTH SHORE",
    },
    {
      // 2400×1595 source — landscape but taller than 21:9. Bias up to keep faces.
      src: "/images/gallery/lars_lucy3.jpg",
      alt: "Lars and Lucy on the beach",
      caption: "LUCY · SIBERIAN HUSKY",
      position: "center 30%",
    },
  ] satisfies Frame[],
};
