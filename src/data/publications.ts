import type { MetaPart, WorkLink } from "~/components/WorkRow.astro";

export interface PublicationRow {
  /** R2 site-asset path, e.g. "publications/diffusionrig". Resolved via siteAssetUrl. */
  thumbPath: string;
  thumbAlt: string;
  titleHtml: string;
  meta: MetaPart[];
  note?: string;
  links: WorkLink[];
}

export const publicationsSection = {
  marker: "03 · Peer-reviewed",
  title: "Publications",
};

export const publications: PublicationRow[] = [
  {
    thumbPath: "publications/diffusionrig",
    thumbAlt: "DiffusionRig teaser",
    titleHtml:
      "DiffusionRig — Learning Personalized Priors for Facial Appearance Editing",
    meta: [
      { kind: "smallcaps", text: "CVPR 2023" },
      { kind: "plain", text: "Z. Ding, C. Zhang, Z. Xia, <strong>L. Jebe</strong>, Z. Tu, X. Zhang" },
      { kind: "smallcaps", text: "Cited by 118" },
    ],
    note: "Adobe. I co-mentored and contributed.",
    links: [
      { href: "https://diffusionrig.github.io/", label: "Project", external: true },
      { href: "https://arxiv.org/abs/2304.06711", label: "arXiv", external: true },
    ],
  },
  {
    thumbPath: "publications/neural_photo_finishing",
    thumbAlt: "Neural Photo-Finishing teaser",
    titleHtml: "Neural Photo-Finishing",
    meta: [
      { kind: "smallcaps", text: "SIGGRAPH Asia 2022" },
      {
        kind: "plain",
        text: "E. Tseng, Y. Zhang, <strong>L. Jebe</strong>, C. Zhang, Z. Xia, Y. Fan, F. Heide, J. Chen",
      },
      { kind: "smallcaps", text: "Cited by 24" },
    ],
    note:
      "Adobe. I developed and trained the style transfer network, and " +
      "contributed to the differentiable rendering pipeline development.",
    links: [
      {
        href: "https://light.princeton.edu/publication/neural-photo-finishing/",
        label: "Project",
        external: true,
      },
      {
        href: "https://light.cs.princeton.edu/wp-content/uploads/2022/11/Neural_Photo-Finishing.pdf",
        label: "Paper",
        external: true,
      },
    ],
  },
  {
    thumbPath: "publications/nlr",
    thumbAlt: "Neural Lumigraph Rendering teaser",
    titleHtml:
      `Neural Lumigraph Rendering ` +
      `<span class="smallcaps" style="color:var(--accent); font-weight:500;">— best paper candidate</span>`,
    meta: [
      { kind: "smallcaps", text: "CVPR 2021" },
      {
        kind: "plain",
        text: "P. Kellnhofer, <strong>L. Jebe</strong>, A. Jones, R. Spicer, K. Pulli, G. Wetzstein",
      },
      { kind: "smallcaps", text: "Cited by 177" },
    ],
    note:
      "Raxium. I designed, built, and calibrated the multi-camera " +
      "video rig and prototyped the 3D video reconstruction algorithms it " +
      "feeds.",
    links: [
      {
        href: "http://www.computationalimaging.org/publications/nlr/",
        label: "Project",
        external: true,
      },
      { href: "https://arxiv.org/abs/2103.11571", label: "arXiv", external: true },
    ],
  },
];

/**
 * Earlier publications — undergrad papers, surfaced behind a
 * "see earlier" expand to keep the headline list tight.
 */
export const earlierPublications: PublicationRow[] = [
  {
    thumbPath: "publications/rwth_2",
    thumbAlt: "Inverter voltage distortion calibration",
    titleHtml:
      "Online Phase Current and Voltage Offset Calibration using Inverter Voltage Distortion",
    meta: [
      { kind: "smallcaps", text: "IEEE PEDS 2017" },
      { kind: "plain", text: "M. Schubert, <strong>L. Jebe</strong>, M. Gossen, R. W. De Doncker" },
    ],
    links: [
      {
        href: "https://ieeexplore.ieee.org/abstract/document/8289267",
        label: "IEEE Xplore",
        external: true,
      },
    ],
  },
  {
    thumbPath: "publications/rwth_1",
    thumbAlt: "Gate driver phase voltage measurement",
    titleHtml:
      "Gate Driver Integrated Instantaneous Phase Voltage Measurement in PWM Voltage Source Inverters",
    meta: [
      { kind: "smallcaps", text: "IEEE INTELEC 2016" },
      { kind: "plain", text: "M. Schubert, <strong>L. Jebe</strong>, R. W. De Doncker" },
    ],
    links: [
      {
        href: "https://ieeexplore.ieee.org/abstract/document/7749120",
        label: "IEEE Xplore",
        external: true,
      },
    ],
  },
];
