/**
 * Site-wide identity used by Sidebar + meta tags.
 * Edit values here; structure matches the prop shapes of <Sidebar />.
 */

export const site = {
  // Browser tab + first line of every Google result. Lead with the name
  // (highest-intent search) then the positioning line.
  title: "Lars Jebe — Research Engineer · Visual Generative AI & Computational Photography",
  description:
    "Research engineer at Phota Labs (ex-Adobe / Marc Levoy's team). " +
    "Computational photography, generative AI, image quality. " +
    "Stanford EE. Co-author at CVPR, SIGGRAPH Asia.",
  url: "https://larsjebe.com",
};

export const sidebar = {
  name: "Hi, I'm Lars",
  role: {
    lines: [
      "Research Engineer",
      "Data, Infra, Inference",
      "Visual GenAI",
      "Computational Photography",
      "Product-first instinct",
    ],
  },
  // Per DESIGN.md §3: company affiliations only — no CVPR/SIGGRAPH chips here.
  chips: [
    { label: "PHOTA LABS", withDot: true, href: "https://photalabs.com", external: true },
    { label: "ADOBE", href: "https://www.adobe.com", external: true },
    { label: "STANFORD EE", href: "https://ee.stanford.edu/", external: true },
  ],
  navItems: [
    { href: "#now", label: "How I work", num: "01" },
    { href: "#shipped", label: "Shipped products", num: "02" },
    { href: "#publications", label: "Research", num: "03" },
    { href: "#photography", label: "Photography", num: "04" },
    { href: "#piano", label: "Piano", num: "05" },
    { href: "#artwork", label: "Paint + Craft", num: "06" },
    { href: "#about", label: "Bio", num: "07" },
  ],
  socials: [
    { href: "mailto:lars.jebe@gmail.com", label: "Email" },
    { href: "https://scholar.google.com/citations?user=LN7Fd_QAAAAJ", label: "Scholar", external: true },
    { href: "https://www.flickr.com/photos/larsjebe/", label: "Flickr", external: true },
    { href: "https://www.linkedin.com/in/larsjebe/", label: "LinkedIn", external: true },
  ],
} as const;
