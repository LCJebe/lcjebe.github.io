import type { ContactRow } from "~/components/ContactList.astro";

export const aboutSection = {
  marker: "07 · About & contact",
  title: "Bio",
};

/**
 * Bio paragraphs as raw HTML strings to allow inline <span class="smallcaps">
 * for institution names.
 *
 * Style note: this is About-as-context, not About-as-CV-recap. The hero +
 * sidebar already list affiliations; this section adds the through-line.
 */
export const bioParagraphsHtml: string[] = [
  `I grew up in Germany, where I studied Electrical Engineering and Information ` +
  `Technology at <strong>RWTH Aachen</strong>. I then moved to California to study at ` +
  `<strong>Stanford</strong> with a focus on <strong>Computational Imaging and Neural Rendering</strong>.
   I've always been ` +
  `fascinated by building things, seeing how they work, and improving ` +
  `them. ` +
  `Following Stanford, I worked for a MicroLED startup that was acquired by Google. ` +
  `Then, I switched to ` +
  `Marc Levoy's <strong>computational photography</strong> team at ` +
  `<strong>Adobe</strong>. Now at <strong>Phota Labs</strong>, ` +
  `building personalized generative models and workflows, and shipping faster than ever!`,

  `Outside the engineering I've played <strong>classical piano</strong> ` +
  `since I was a kid, and I'm constantly chasing bigger waves and ` +
  `watching marine animals when <strong>kitesurfing</strong>. I like every ` +
  `aspect of nature, and ideally I can explore it with Lucy, the Siberian Husky.`,

  `Open to conversations about <em>AI engineering, including infrastructure, ` +
  `data + inference pipelines, computational photography, generative ` +
  `visual systems, and image-quality work.</em> If any of those overlap ` +
  `with what you're building, please get in touch.`,
];

export const contactRows: ContactRow[] = [
  {
    key: "Location",
    value: "San Francisco Bay Area",
    arrow: "",
  },
  {
    key: "Email",
    value: "lars.jebe@gmail.com",
    href: "mailto:lars.jebe@gmail.com",
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
    value: "cv-larsjebe-2026.pdf",
    href: "/cv-larsjebe-2026.pdf",
    download: true,
  },
];
