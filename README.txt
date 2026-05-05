Lars Jebe — personal website
============================

Source for https://lcjebe.github.io (and, once DNS is configured,
https://larsjebe.com).

Stack
-----
- Astro 5 (static output) — src/pages, src/layouts, src/components
- Hand-written modern CSS (CSS custom properties, OKLCH, lightningcss)
- Vanilla JS islands — theme toggle, hero caption rotator, photo filter
- PhotoSwipe for the gallery lightbox; lite-youtube-embed for the piano
- @astrojs/sitemap for SEO

Local development
-----------------
  npm install
  npm run dev      # http://localhost:4321
  npm run build    # static output to dist/
  npm run preview  # preview the production build
  npm run check    # Astro + TypeScript type check

Project structure
-----------------
  src/
    layouts/BaseLayout.astro     — page shell, theme bootstrap, fonts
    components/                  — all UI components
    data/                        — typed content (shipped, publications, photos, etc.)
    styles/                      — tokens.css, globals.css, components.css
    pages/index.astro            — single-page site composition
  public/
    images/                      — gallery + thumbnail assets (resized)
    cv.pdf                       — CV
    robots.txt
    google*.html                 — Search Console verification
  _design_reference/             — Claude Design output (reference; not deployed)
  _legacy/                       — previous HTML5UP "Stellar" site (kept for backup)

Strategic + visual references
-----------------------------
- DESIGN.md      — strategic brief; engineer-not-researcher framing
- MIGRATION.md   — implementation plan + custom-domain SEO migration notes

Deploy
------
GitHub Actions builds + deploys to GitHub Pages on every push to main
(see .github/workflows/deploy.yml). Once GitHub Pages settings are
switched to "Source: GitHub Actions", pushes will deploy automatically.

Custom domain (larsjebe.com) — see MIGRATION.md §"Phase 6" for the full
DNS + Search Console "Change of Address" procedure.

Credits
-------
- Design exploration: Claude Design (Anthropic), April 2026
- Implementation: written by hand (Astro, CSS, vanilla JS)
- PhotoSwipe — github.com/dimsemenov/PhotoSwipe (MIT)
- lite-youtube-embed — github.com/paulirish/lite-youtube-embed (Apache-2.0)
- Fonts: Fraunces, Inter Tight, JetBrains Mono (all OFL via Google Fonts)
