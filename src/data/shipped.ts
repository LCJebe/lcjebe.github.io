import type { MetaPart, WorkLink } from "~/components/WorkRow.astro";

export interface ShippedRow {
  thumbSrc: string;
  thumbAlt: string;
  titleHtml: string;
  meta: MetaPart[];
  note?: string;
  links?: WorkLink[];
}

export const shippedSection = {
  marker: "02 · SHIPPED",
  title: "Real users",
  desc:
    "Production AI features I contributed to, with what I specifically owned " +
    "called out. Research-grade engineering — but the deliverable is the " +
    "product, not the paper.",
};

export const pinnedShipped = {
  imageSrc: "/images/phota-blog.webp",
  imageAlt: "Phota Labs",
  label: "Phota Labs · 2025 — present\nfounding technical staff",
  title: "Generative AI for photography",
  description:
    "Building an identity-preserving generative photography product. I own " +
    "the production stack outside the core model — inference + serving " +
    "infrastructure, computer-vision and data pipelines, and the API " +
    "surface that turn the team's research into a shipped product. The " +
    "launch post covers what's live now.",
  links: [
    { href: "https://www.photalabs.com/", label: "Phota Labs", external: true },
    {
      href: "https://www.photalabs.com/blog/the-new-photo-experience-starts-here",
      label: "Launch post",
      external: true,
    },
  ] satisfies WorkLink[],
};

export const shippedRows: ShippedRow[] = [
  {
    thumbSrc: "/images/indigo2.png",
    thumbAlt: "Project Indigo",
    titleHtml: "Project Indigo — Computational Photography Camera App",
    meta: [
      { kind: "smallcaps", text: "Adobe Research · Jun 2025" },
      { kind: "plain", text: "core developer" },
    ],
    note:
      "Multi-frame computational photography pipeline producing SLR-like raw and JPEG " +
      "output on iPhone, from Adobe's Nextcam team. Core developer " +
      "on the team.",
    links: [
      {
        href: "https://research.adobe.com/articles/indigo/indigo.html",
        label: "Adobe Research blog",
        external: true,
      },
      {
        href: "https://apps.apple.com/us/app/project-indigo/id6742591546",
        label: "App Store",
        external: true,
      },
    ],
  },
  {
    thumbSrc: "/images/adobe_adaptive.webp",
    thumbAlt: "Adobe Adaptive Profile result",
    titleHtml: "Adobe Adaptive Profile — Camera Raw and Lightroom",
    meta: [
      { kind: "smallcaps", text: "Adobe · Oct 2024" },
      { kind: "plain", text: "co-author · training-data pipeline" },
    ],
    note:
      "A learned, scene-adaptive raw-rendering profile shipped in Camera Raw " +
      "and Lightroom. I'm a co-author of the launch blog and built the " +
      "training-data pipeline that shaped the model's architecture. " +
      "Contributed to the productionization that took the technique from " +
      "research prototype to shipped feature.",
    links: [
      {
        href: "https://blog.adobe.com/en/publish/2024/10/14/the-adobe-adaptive-profile",
        label: "Adobe blog post",
        external: true,
      },
    ],
  },
  {
    thumbSrc: "/images/reflection-teaser.jpg",
    thumbAlt: "Adobe Reflection Removal result",
    titleHtml: "Reflection Removal — Camera Raw and Lightroom",
    meta: [
      { kind: "smallcaps", text: "Adobe · Dec 2024" },
      { kind: "plain", text: "contributor · hybrid-synthetic training-data pipeline" },
    ],
    note:
      "A one-click AI feature that removes reflections from photographs " +
      "taken through plate-glass windows in Camera Raw and Lightroom. Scaled the real " +
      "photo source training dataset from ~3k to >100k assets. Acknowledged " +
      "contributor in the launch blog.",
    links: [
      {
        href: "https://blog.adobe.com/en/publish/2024/12/12/removing-window-reflections-adobe-camera-raw",
        label: "Adobe blog post",
        external: true,
      },
    ],
  },
];
