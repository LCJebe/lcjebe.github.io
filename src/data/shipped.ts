import type { MetaPart, PressItem, WorkLink } from "~/components/WorkRow.astro";

export interface ShippedRow {
  thumbSrc: string;
  thumbAlt: string;
  titleHtml: string;
  meta: MetaPart[];
  note?: string;
  links?: WorkLink[];
  press?: PressItem[];
  /** Visually highlight this row (subtle accent tint + left border).
   *  Used for the pinned current-role entry. */
  highlight?: boolean;
}

export const shippedSection = {
  marker: "02 · Real users",
  title: "Shipped products",
};

export const shippedRows: ShippedRow[] = [
  {
    thumbSrc: "/images/phota-blog.webp",
    thumbAlt: "Phota Labs",
    titleHtml: "Generative AI for photography",
    meta: [
      { kind: "smallcaps", text: "Phota Labs · 2025 — present" },
      { kind: "plain", text: "founding engineer" },
    ],
    note:
      "Building an identity-preserving generative photography product. I own " +
      "the production stack — inference + serving infrastructure, " +
      "computer-vision and data pipelines, and the API surface that turn the " +
      "team's research into a shipped product. The launch post covers what's " +
      "live now.",
    links: [
      { href: "https://www.photalabs.com/", label: "Phota Labs", external: true },
      {
        href: "https://www.photalabs.com/blog/the-new-photo-experience-starts-here",
        label: "Launch post",
        external: true,
      },
    ],
    highlight: true,
  },
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
        label: "Adobe Blog",
        external: true,
      },
      {
        href: "https://apps.apple.com/us/app/project-indigo/id6742591546",
        label: "App Store",
        external: true,
      },
    ],
    press: [
      {
        href: "https://www.theverge.com/tech/694014/adobe-project-indigo-camera-app-hands-on-hdr",
        venue: "The Verge",
        title: "Adobe's Project Indigo app is making me rethink phone photography",
        external: true,
      },
      {
        href: "https://petapixel.com/2025/06/19/adobes-new-computational-iphone-camera-app-looks-incredible/",
        venue: "PetaPixel",
        title: "Adobe's New Computational iPhone Camera App Looks Incredible",
        external: true,
      },
      {
        href: "https://www.dpreview.com/news/4142720910/adobe-quietly-made-a-super-powered-camera-app-for-iphone",
        venue: "DPReview",
        title: "Adobe quietly made a super-powered camera app for iPhone",
        external: true,
      },
      {
        href: "https://www.dpreview.com/articles/6501476506/gear-of-the-year-dale-s-choice-adobe-project-indigo",
        venue: "DPReview",
        title: "Gear of the Year — Adobe Project Indigo",
        external: true,
      },
      {
        href: "https://appleinsider.com/articles/25/06/21/adobes-project-indigo-app-will-help-you-take-better-photos-on-your-iphone",
        venue: "AppleInsider",
        title: "Adobe's 'Project Indigo' app will help you take better photos on your iPhone",
        external: true,
      },
      {
        href: "https://www.tomsguide.com/phones/iphones/ive-been-testing-adobes-project-indigo-camera-app-and-i-might-ditch-the-iphones-camera-app-for-good",
        venue: "Tom's Guide",
        title: "I've been testing Adobe's Project Indigo camera app — and I might ditch the iPhone's camera app for good",
        external: true,
      },
      {
        href: "https://www.popsci.com/diy/project-indigo-iphone-app/",
        venue: "Popular Science",
        title: "Adobe launched a pro-level camera app for your iPhone",
        external: true,
      },
      {
        href: "https://sixcolors.com/post/2025/08/a-better-camera-app-reflections-on-adobes-project-indigo/",
        venue: "Six Colors",
        title: "A better camera app? Reflections on Adobe's Project Indigo",
        external: true,
      },
      {
        href: "https://fstoppers.com/artificial-intelligence/adobe-quietly-releases-superior-free-camera-app-iphones-704826",
        venue: "Fstoppers",
        title: "Adobe Quietly Releases a Superior Free Camera App for iPhones",
        external: true,
      },
      {
        href: "https://www.bgr.com/tech/adobes-free-project-indigo-app-turns-the-iphone-into-an-ai-powered-dslr-camera/",
        venue: "BGR",
        title: "Adobe's Free Project Indigo App Turns The iPhone Into An AI-Powered DSLR Camera",
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
        label: "Adobe Blog",
        external: true,
      },
    ],
    press: [
      {
        href: "https://petapixel.com/2024/10/14/adobes-new-adaptive-profile-uses-ai-to-non-destructively-improve-photos-in-one-click/",
        venue: "PetaPixel",
        title: "Adobe's New Adaptive Profile Uses AI to Non-Destructively Improve Photos in One Click",
        external: true,
      },
      {
        href: "https://gregbenzphotography.com/lightroom-acr/acr-17-ai-adobe-adaptive-profiles-non-destructive-denoise-generative-expand/",
        venue: "Greg Benz Photography",
        title: "New in Adobe Camera RAW 17: 'Adobe Adaptive' profiles, non-destructive Denoise, and generative expand",
        external: true,
      },
      {
        href: "https://fstoppers.com/lightroom/adaptive-profiles-lightroom-look-latest-update-693009",
        venue: "Fstoppers",
        title: "Adaptive Profiles in Lightroom: A Look at the Latest Update",
        external: true,
      },
      {
        href: "https://photoshopcafe.com/adaptive-profiles-in-adobe-camera-raw-perfect-starting-place-for-photos/",
        venue: "PhotoshopCAFE",
        title: "Adaptive Profiles in Adobe Camera RAW — perfect starting place for photos",
        external: true,
      },
      {
        href: "https://www.dpreview.com/news/8858249253/adobe-max-lightroom-photoshop-2024-quick-actions-ai-acr-adaptive-profile",
        venue: "DPReview",
        title: "Generative AI is arriving full force in Lightroom and Photoshop",
        external: true,
      },
    ],
  },
  {
    thumbSrc: "/images/reflection-teaser.jpg",
    thumbAlt: "Adobe Reflection Removal result",
    titleHtml: "Reflection Removal — Camera Raw, Lightroom, Photoshop",
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
        label: "Adobe Blog",
        external: true,
      },
    ],
    press: [
      {
        href: "https://www.theverge.com/2024/12/12/24319849/adobe-lightroom-camera-raw-reflection-removal",
        venue: "The Verge",
        title: "Adobe now has a tool to get rid of ugly window reflections in photos",
        external: true,
      },
      {
        href: "https://www.engadget.com/cameras/adobes-new-photoshop-tool-can-clean-away-window-reflections-235855968.html",
        venue: "Engadget",
        title: "Adobe's new Photoshop tool can clean away window reflections",
        external: true,
      },
      {
        href: "https://petapixel.com/2024/12/12/adobes-new-reflection-removal-tool-aims-to-save-your-travel-photos/",
        venue: "PetaPixel",
        title: "Adobe's New Reflection Removal Tool Aims to Save Your Travel Photos",
        external: true,
      },
      {
        href: "https://www.dpreview.com/news/6455767240/adobe-camera-raw-reflection-removal-ai",
        venue: "DPReview",
        title: "Adobe Camera Raw can now remove photo-ruining reflections – without generative AI",
        external: true,
      },
      {
        href: "https://www.digitalcameraworld.com/tech/software/goodbye-polarizing-filters-new-adobe-editing-tool-will-remove-pesky-reflections-from-photos",
        venue: "Digital Camera World",
        title: "Goodbye polarizing filters? New Adobe photo editing tool removes pesky reflections",
        external: true,
      },
      {
        href: "https://www.creativebloq.com/photography/photo-editing-software/i-saw-the-magical-reflection-removal-tool-teased-at-adobe-max-and-its-now-reached-photoshop",
        venue: "Creative Bloq",
        title: "I saw the magical Reflection Removal tool teased at Adobe Max – and it's now reached Photoshop",
        external: true,
      },
      {
        href: "https://fstoppers.com/news/adobe-announces-reflection-removal-feature-687393",
        venue: "Fstoppers",
        title: "Adobe Announces Reflection Removal Feature",
        external: true,
      },
      {
        href: "https://www.techradar.com/computing/software/11-new-ai-projects-announced-at-adobe-max-2023-heres-what-they-are",
        venue: "TechRadar",
        title: "11 new AI projects announced at Adobe MAX 2023 (MAX Sneaks 2023)",
        external: true,
      },
    ],
  },
];
