/**
 * Site-wide identity used by Sidebar + meta tags.
 * Edit values here; structure matches the prop shapes of <Sidebar />.
 */

export const site = {
  // Browser tab + first line of every Google result. Lead with the name
  // (highest-intent search) then the positioning line.
  title: "Lars Jebe — AI engineer building creative tools",
  description:
    "AI engineer at Phota Labs (ex-Adobe / Marc Levoy's team). " +
    "Computational photography, generative AI, image quality. " +
    "Stanford EE. Co-author at CVPR, SIGGRAPH Asia.",
  url: "https://larsjebe.com",
};

export const sidebar = {
  name: "Hi, I'm Lars.",
  role: {
    line1: "AI engineer.",
    line2: "Building creative tools.",
    line3: "Product-first instinct.",
  },
  portrait: {
    src: "/images/lars_pali.jpg",
    alt: "Portrait of Lars Jebe in the Hawaiian mountains",
  },
  // Per DESIGN.md §3: company affiliations only — no CVPR/SIGGRAPH chips here.
  chips: [
    { label: "PHOTA LABS", withDot: true },
    { label: "ADOBE · LEVOY" },
    { label: "STANFORD EE" },
  ],
  navItems: [
    { href: "#now", label: "Now", num: "01" },
    { href: "#shipped", label: "Shipped products", num: "02" },
    { href: "#publications", label: "Publications", num: "03" },
    { href: "#photography", label: "Photography", num: "04" },
    { href: "#piano", label: "Piano", num: "05" },
    { href: "#artwork", label: "Artwork", num: "06" },
    { href: "#about", label: "About & contact", num: "07" },
  ],
  socials: [
    { href: "mailto:lars.jebe@gmail.com", label: "Email" },
    { href: "https://github.com/LCJebe", label: "GitHub", external: true },
    { href: "https://scholar.google.com/citations?user=LN7Fd_QAAAAJ", label: "Scholar", external: true },
    { href: "https://www.flickr.com/photos/larsjebe/", label: "Flickr", external: true },
    { href: "https://www.linkedin.com/in/larsjebe/", label: "LinkedIn", external: true },
  ],
} as const;
