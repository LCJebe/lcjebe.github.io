# MIGRATION.md — Astro implementation plan

Companion to [DESIGN.md](DESIGN.md) (the strategic brief) and [_design_reference/](./_design_reference/) (the visual source of truth from Claude Design).

## Context

The current site is a single-page HTML5UP "Stellar" template with a separate `projects.html`, jQuery + 5 jQuery plugins, ~52 MB of uncompressed images on GitHub. Claude Design produced a clean dark-first reference at [_design_reference/index.html](_design_reference/index.html) with a token-driven CSS system at [_design_reference/tokens.css](_design_reference/tokens.css) that we like and want to keep faithfully.

**Goal:** rebuild the live site in **Astro**, faithfully realizing the design reference, with proper image optimization, modern CSS, vanilla JS, and a clean component architecture that's easy to extend as Lars adds photos, blog posts, and shipped-product content over time.

**Non-goals:** redesigning beyond what's in `_design_reference/`. Adding a CMS. Adding a blog yet (planned later). Self-hosting video (YouTube embed via lite-youtube is sufficient).

---

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Astro 5+** with TypeScript (strict) | Zero-JS by default; islands for the few interactive bits; built-in `<Image>` for AVIF/WebP optimization |
| CSS | **Hand-written, port `tokens.css` wholesale** | Tokens are already excellent; no need for Tailwind/CSS-in-JS |
| Fonts | Google Fonts via CSS `@import` initially; **self-hosted variable fonts (Fraunces, Inter Tight, JetBrains Mono)** before launch | Avoid render-blocking external request; subset to Latin |
| Images | Astro `<Image>` with `astro:assets` | Auto AVIF/WebP, responsive `srcset`, lazy-load |
| JS | **Vanilla, in `<script>` islands** | Theme toggle, hero caption rotator, photo filter, lightbox |
| Lightbox | **PhotoSwipe v5** (~30 KB) | Touch + keyboard nav; only loads when gallery interacted |
| YouTube | **lite-youtube-embed** (~3 KB) | Click-to-play, no third-party iframe until interaction |
| Hosting | **GitHub Pages** initially (matches current); evaluate **Cloudflare Pages** later | Free, no migration friction; Cloudflare gives image transforms if we ever need them |
| Analytics | none in v1 | Privacy / simplicity |

---

## Directory structure

```
/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   └── fonts/                          # self-hosted fonts (added before launch)
├── src/
│   ├── styles/
│   │   ├── tokens.css                  # ported from _design_reference/tokens.css
│   │   └── globals.css                 # resets + utility classes
│   ├── layouts/
│   │   └── BaseLayout.astro            # <html>, head, sidebar+main grid, theme attr
│   ├── components/
│   │   ├── Sidebar.astro               # portrait, name, role, chips, nav, socials, theme toggle
│   │   ├── Hero.astro                  # eyebrow, tagline, lead, CTAs, carousel mount
│   │   ├── HeroCarousel.astro          # 3 frames, captions, reduced-motion respect
│   │   ├── SectionHeader.astro         # numbered eyebrow + h2
│   │   ├── ShippedCard.astro           # the pinned 1:1 split card
│   │   ├── WorkRow.astro               # 88px thumb + meta + note + links (Shipped + Pubs)
│   │   ├── PhotoGrid.astro             # masonry container
│   │   ├── PhotoFilter.astro           # filter chips
│   │   ├── PhotoCard.astro             # single image + lightbox hookup
│   │   ├── PianoCard.astro             # lite-youtube wrapper
│   │   ├── ArtCard.astro
│   │   ├── ContactList.astro
│   │   ├── Chip.astro                  # credential pill with dot
│   │   ├── Button.astro                # primary/ghost variants
│   │   ├── ThemeToggle.astro           # data-theme writer
│   │   └── icons/                      # inline SVG sprites
│   ├── data/
│   │   ├── shipped.ts                  # array of shipped products
│   │   ├── publications.ts             # array of papers
│   │   ├── photos.ts                   # array {src, alt, theme, dims}
│   │   ├── about.ts                    # paragraphs + contacts
│   │   └── nav.ts                      # section list with counts
│   ├── assets/
│   │   ├── work/                       # shipped + publication thumbnails
│   │   ├── photos/                     # curated gallery (after Lars curates)
│   │   ├── portrait/                   # lars_pali.jpg etc.
│   │   ├── art/
│   │   └── piano/                      # poster frames for lite-youtube
│   ├── scripts/
│   │   ├── theme.ts                    # init + toggle
│   │   ├── hero-carousel.ts            # frame rotation + caption
│   │   ├── photo-filter.ts             # masonry filter
│   │   └── lightbox.ts                 # PhotoSwipe init
│   └── pages/
│       └── index.astro                 # single-page site, all sections inline
└── ...
```

**Single-page site** for v1. The current `projects.html` separate page can return later as `/projects` if Lars wants the long-tail list (RWTH papers, AR in OR, CS148, etc.) — out of scope for v1.

---

## Components — what each owns

| Component | Responsibility | Notes |
|---|---|---|
| `BaseLayout` | Document shell, font loading, sidebar+main grid, `<body data-theme>` | `data-theme` initialized inline in `<head>` to avoid FOUC |
| `Sidebar` | Persistent identity column on desktop, header on mobile | Uses `nav.ts` for links; consumes `ThemeToggle` |
| `Hero` | Eyebrow, tagline, lead paragraph, CTAs | Pulls strings from `about.ts` |
| `HeroCarousel` | 3 absolutely-positioned `<picture>`s + caption rotator | Respects `prefers-reduced-motion`; dwells 8s, total cycle 24s |
| `SectionHeader` | `<header>` with section number + eyebrow + `<h2>` + optional kicker line | Used for sections 01–07 |
| `ShippedCard` | The "pinned" Adobe Adaptive Profile-style card | 1:1 grid; collapses on mobile |
| `WorkRow` | Generic dense row used for both Shipped and Publications | Props: `thumb`, `title`, `meta[]`, `note`, `links[]` |
| `PhotoGrid` + `PhotoCard` + `PhotoFilter` | Masonry grid, filterable | CSS `column-count`; PhotoSwipe on click |
| `PianoCard` | lite-youtube wrapper + caption | Custom poster from `assets/piano/` |
| `Chip` | Credential pill with accent dot | Used in sidebar (3 chips, no CVPR/SIGGRAPH per DESIGN.md §3) |

---

## Content — copy + data

Pulled from `_design_reference/index.html` where Claude Design produced strong drafts; placeholders flagged where Lars will fill in later.

### Tagline + sidebar role

- **Tagline (hero h1):** "AI engineer building *creative tools.*" (italic on "creative tools.")
- **Sidebar role line:** "AI engineer. Building creative tools."
- **Sidebar credential chips (3):** `PHOTA LABS` · `EX-ADOBE · LEVOY` · `STANFORD EE`

> ⚠ DESIGN.md §3 forbids CVPR/SIGGRAPH chips in the hero/sidebar. Publications surface in their own section only.

### Hero eyebrow

`Currently · Phota Labs · 2026` (with pulse dot)

### Hero lead paragraph

> Four years on Marc Levoy's computational photography team at Adobe, shipping the **Adobe Adaptive Profile** in Camera Raw to millions of photographers. Now at Phota Labs on generative AI for visual content. The work is engineering — making AI features run reliably, on real users' devices, at scale.

### CTAs

- Primary: **"Download CV →"** → `/cv.pdf` (replace placeholder; **Lars to provide updated CV**, current `assets/CV_Lars_Jebe_Nov2023.pdf` is from 2023 per DESIGN.md §8)
- Ghost: **"See shipped work"** → `#shipped`

### Section 01 — Now / How I work

> The seam between research and product is where I'm most useful — and where most of my work lives.
>
> I'm currently at **Phota Labs** working on generative AI for visual content — the kind of model work that has to survive a real user pressing a button and getting back a result they want to keep.
>
> I take features from a paper-grade prototype to something that runs on a real device, every time, without surprising anyone. Sometimes the engineering rises to a publication; more often it just ships. I prefer to ship.

(Last paragraph styled in `--fg-faint` per design reference.)

### Section 02 — Shipped

**Pinned card:**
- Label: `ADOBE CAMERA RAW · OCT 2024`
- Title: **Adobe Adaptive Profile**
- Description (placeholder, **Lars to refine**): *AI-powered raw profile that adapts color and tone rendering to scene content. Available in Camera Raw, Lightroom, and Lightroom Classic. Used by millions of photographers.*
- What I did (placeholder, **Lars to refine**): *Core engineering on the model pipeline that ships on consumer devices.*
- Links:
  - Adobe blog post → https://blog.adobe.com/en/publish/2024/10/14/the-adobe-adaptive-profile
  - "Try in Camera Raw" → (link target TBD — Adobe product page)
- Thumbnail: **placeholder** — currently `NeuralPhotoFinishing.jpg`. Lars to provide a Camera Raw UI screenshot or before/after comparison shot.

**Work list rows (3+):**

1. **Phota Labs — generative AI for visual content** (placeholder)
   - Meta: `PHOTA LABS · 2025–PRESENT · GENERATIVE AI`
   - Note: *Building generative AI features for creative tools. (Specific products + co-authored blog posts to follow.)*
   - Links: **Lars to provide** Phota Labs blog post URLs and product page
   - Thumbnail: **Lars to provide**

2. **Adobe Camera Raw — additional features** (placeholder)
   - Meta: `ADOBE · 2021–2025 · COMPUTATIONAL PHOTOGRAPHY`
   - Note: *Multiple shipped features in Camera Raw beyond Adaptive Profile. (Detail TBD.)*
   - Links: **Lars to enumerate** — Adobe blog posts, product pages, release notes referencing his work
   - Thumbnail: **Lars to provide** (or use existing `NeuralPhotoFinishing.jpg` until then)

3. **Raxium — microLED compute platform**
   - Meta: `RAXIUM · ACQUIRED BY GOOGLE 2022`
   - Note: *Compute team work on microLED display technology. Raxium was acquired by Google.*
   - Links:
     - The Verge article → https://www.theverge.com/2022/5/4/23057579/google-acquires-raxium-microled-ar-vr-displays
   - Thumbnail: `ar2_square.jpg` (existing)

> Section can grow as Lars provides more content. Data lives in `src/data/shipped.ts` so adding a new entry is a single object literal.

### Section 03 — Selected publications

Framing line above block: *"Co-author at top venues, while shipping product."*

1. **DiffusionRig: Learning Personalized Priors for Facial Appearance Editing**
   - Authors: Z. Ding, C. Zhang, Z. Xia, **L. Jebe**, Z. Tu, X. Zhang
   - Meta: `CVPR 2023`
   - Links: project page → https://diffusionrig.github.io/ · arXiv → https://arxiv.org/abs/2304.06711
   - Thumbnail: `diffusionrig_teaser.jpg` (existing)

2. **Neural Photo-Finishing**
   - Authors: E. Tseng, Y. Zhang, **L. Jebe**, C. Zhang, Z. Xia, Y. Fan, F. Heide, J. Chen
   - Meta: `SIGGRAPH ASIA 2022`
   - Links: project page → https://light.princeton.edu/publication/neural-photo-finishing/ · paper → https://light.cs.princeton.edu/wp-content/uploads/2022/11/Neural_Photo-Finishing.pdf
   - Thumbnail: `NeuralPhotoFinishing.jpg` (existing) — note: also used in Shipped pinned card. May need to swap one to avoid duplication. Suggested fix: pinned card gets a new Camera Raw screenshot once Lars provides it.

3. **Neural Lumigraph Rendering** *— best paper candidate*
   - Authors: P. Kellnhofer, **L. Jebe**, A. Jones, R. Spicer, K. Pulli, G. Wetzstein
   - Meta: `CVPR 2021 · BEST PAPER CANDIDATE`
   - Links: project page → http://www.computationalimaging.org/publications/nlr/ · arXiv → https://arxiv.org/abs/2103.11571 · dataset → https://drive.google.com/file/d/1BBpIfrqwZNYmG1TiFljlCnwsmL2OUxNT/view?usp=sharing
   - Thumbnail: `nlr_square.jpg` (existing)

### Section 04 — Photography

- **Filter chips:** `All · Kitesurf · Landscapes · Portraits · Lucy`
- **Caption above grid:** *"Mostly water, mountains, and Lucy."*
- **Images for v1 launch:** existing 9 (kite_sunset, waves, waves_narrow, kitesurfing, kitesurfing_square, lars_lucy3, lars_lucy3_square, plus 2 more from `images/gallery/`).
- **Target post-launch:** 20–40 hand-curated photos. **Lars curating later.** `src/data/photos.ts` makes additions trivial.
- **Footer links:** "More on Flickr →" → https://www.flickr.com/photos/larsjebe/ · "Instagram @larsjebe →" → https://www.instagram.com/larsjebe/

### Section 05 — Piano

- **Caption above:** *"Classical, recorded."*
- **Featured video:** Schubert · Impromptu Op. 90 No. 3 → https://www.youtube.com/watch?v=upXb8zjPaz8 (lite-youtube embed)
- **Title quote:** *"…the kind of practice that's its own reward."*
- **More on YouTube link:** Lars's YouTube channel URL (**Lars to provide** — currently no channel link in repo, only individual video embeds)
- **Second video** (currently embedded in `index.html`): https://www.youtube.com/watch?v=WqjmNg-FRLI — **decision: keep one prominent on landing, link to channel/playlist for the rest.** Per DESIGN.md §5 "one cleanly embedded video."

### Section 06 — Artwork

- **Caption above:** *"A taste signal, not the main course."*
- **Image:** `art/art.jpg` (existing)
- **Title:** "Untitled, mixed digital"
- **Description (placeholder, Lars may want to refine):** *Mixed digital piece, 2023.*
- **Link:** "See more →" — **Lars to provide** target (Behance, Are.na, Instagram, or remove if no public archive)

### Section 07 — About & Contact

**Bio paragraphs:**

> Born in Germany, schooled at **RWTH Aachen** (BS, EE/IT) and **Stanford** (MS, EE). Four years at **Adobe** on Marc Levoy's computational photography team, mostly on what shipped in Camera Raw. Currently at **Phota Labs** on generative AI for visual content. Before that, the compute team at **Raxium** (acquired by Google).
>
> Outside the engineering: classical piano since I was a kid, photography that actually leaves the house, and Lucy — Siberian husky, much louder than I am. I write the way I'd talk; I'd rather be specific than slick.
>
> Open to conversations about *AI engineering for creative tools, computational photography, generative visual systems, and image-quality work that ships.* If any of those overlap with what you're building, please get in touch.

**Contact list:**

| Key | Value |
|---|---|
| Email | `lars.jebe@gmail.com` (mailto link; consider light obfuscation against scrapers — render via JS or use `[at]`/`[dot]` substitution) |
| GitHub | https://github.com/LCJebe |
| Google Scholar | https://scholar.google.com/citations?user=LN7Fd_QAAAAJ |
| Flickr | https://www.flickr.com/photos/larsjebe/ |
| Instagram | https://www.instagram.com/larsjebe/ |
| LinkedIn | https://www.linkedin.com/in/larsjebe/ |
| CV | `/cv.pdf` (**Lars to provide updated PDF**) |

### Footer

`© 2026 Lars Jebe` · `Built in Astro · Hosted on GitHub Pages` (or "Cloudflare Pages" if we migrate)

---

## Implementation phases

### Phase 1 — Skeleton (≈1–2 hr)

1. `npm create astro@latest` → minimal template, TypeScript strict, no integrations.
2. Configure `astro.config.mjs`: `output: 'static'`, `site: 'https://lcjebe.github.io'`, `base: '/'`.
3. Port `_design_reference/tokens.css` → `src/styles/tokens.css` verbatim.
4. Author `src/styles/globals.css`: resets, typography classes (`.display`, `.h1–h4`, `.lead`, `.smallcaps`, `.mono`, `.hairline`, `.chip`, `.link`, `.btn`, `.stack`, `.tabular`, `.muted`, `.faint`) — all already drafted in design reference.
5. `BaseLayout.astro`:
   - Inline `<script>` in `<head>` reads `localStorage.theme` or `prefers-color-scheme` and sets `document.documentElement.dataset.theme` before paint (no FOUC).
   - 360px sidebar + 1fr main grid; collapses to single column at `(max-width: 960px)`.
6. **Verify:** `npm run dev` shows a styled empty page in dark mode by default with manual theme toggle working.

### Phase 2 — Components (≈3–4 hr)

Build atomically, bottom-up, each with a static example in a temp dev page:

1. `Chip`, `Button`, `SectionHeader`, `Sidebar` (with placeholder nav).
2. `HeroCarousel` (3 hardcoded images, 8s rotation, caption rotator, `prefers-reduced-motion: reduce` short-circuit).
3. `Hero` (composes the above + CTAs).
4. `WorkRow` (the dense row used for Shipped + Pubs).
5. `ShippedCard` (the pinned 1:1 card).
6. `PhotoGrid` + `PhotoFilter` + `PhotoCard` (masonry via CSS `column-count`; client-side filter via `data-theme`-ish data attribute toggling `display`).
7. `PianoCard` (lite-youtube wrapper).
8. `ArtCard`, `ContactList`.

### Phase 3 — Content + page assembly (≈2 hr)

1. Create `src/data/*.ts` files with the content above.
2. Move existing usable images from `images/` and `_design_reference/images/` → `src/assets/`. Pre-process gallery photos to max 2400 px on long edge before placing in `src/assets/photos/`.
3. Assemble `src/pages/index.astro` consuming the data files and components in IA order from DESIGN.md §5.
4. Wire anchor navigation (sidebar links → section IDs).

### Phase 4 — Interactions (≈1–2 hr)

1. Theme toggle (`src/scripts/theme.ts`).
2. Hero carousel script.
3. Photo filter script.
4. PhotoSwipe lightbox bound to `.masonry-item` (only loaded on first interaction).
5. lite-youtube-embed wired to PianoCard.

### Phase 5 — Polish + a11y + perf (≈2 hr)

1. **Accessibility:**
   - All `<img>` have meaningful `alt`.
   - Filter buttons use `aria-pressed`.
   - Theme toggle uses `aria-label` and announces state change.
   - Focus states verified everywhere (the `:focus-visible` rule in tokens.css covers most).
   - Skip-to-content link in sidebar.
   - Verify keyboard navigation for lightbox.
2. **Performance:**
   - Run Lighthouse: target ≥95 on all four metrics, mobile.
   - Confirm Astro `<Image>` produces AVIF + WebP fallbacks; sizes match container.
   - Confirm fonts subset to Latin; switch to self-hosted variable fonts if Google Fonts adds noticeable LCP.
   - Confirm hero LCP < 2.0 s on throttled 3G (DESIGN.md §9 budget).
3. **Cross-browser:** Safari (macOS + iOS), Chrome, Firefox.
4. **Cross-page coherence check:** any subpages added (e.g., `/projects`) must inherit `BaseLayout` and use the same components — DESIGN.md §9 is non-negotiable.

### Phase 6 — Deploy (≈1 hr) + custom domain (≈1 hr at registrar)

**Decisions locked:**

- Hosting: **GitHub Pages**, deployed via GitHub Actions running the Astro build. Easy to migrate later if we ever need Cloudflare Pages for image transforms or edge functions.
- Custom domain: **larsjebe.com**. Repo stays at `lcjebe.github.io` so the `<username>.github.io` repo convention is preserved (which is what makes the apex repo serve from `/`).

**Step-by-step:**

1. Switch GitHub Pages source from `main` (current static HTML) to **GitHub Actions** deploying Astro build output. Repo Settings → Pages → Source = "GitHub Actions."
2. Add `.github/workflows/deploy.yml` using Astro's [standard GitHub Pages workflow](https://docs.astro.build/en/guides/deploy/github/). Set `astro.config.mjs` `site: 'https://larsjebe.com'`, `base: '/'`.
3. Set up custom domain **larsjebe.com**:
   - Buy `larsjebe.com` if not already owned (Namecheap, Cloudflare Registrar, or Porkbun — all fine; Cloudflare Registrar is at-cost with no markup).
   - At the registrar, configure DNS:
     - **Apex `larsjebe.com`**: four A records pointing to GitHub Pages IPs — `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. (Or AAAA records for IPv6 if available.)
     - **`www.larsjebe.com`**: CNAME → `lcjebe.github.io.`
   - In repo Settings → Pages → Custom domain, enter `larsjebe.com` and save. This creates a `CNAME` file at the repo root containing `larsjebe.com`. **Do not delete this file** — Astro needs to copy it into the build output, or place it in `public/CNAME` so it survives builds.
   - Wait for DNS propagation (usually <1 hr, up to 48 hr).
   - Once propagation completes, GitHub provisions a Let's Encrypt cert automatically. Then check **Enforce HTTPS** in the Pages settings.
4. Move existing `images/`, `assets/`, and old HTML files into a `_legacy/` folder (or delete) — **preserve `cs148_gallery.html` link integrity if anything still references it externally.**
5. Verify deployed site at <https://larsjebe.com> (and that <https://lcjebe.github.io> 301s correctly to it).
6. Update README.txt with new tech stack.

**SEO preservation when moving lcjebe.github.io → larsjebe.com:**

> ⚠ Lars currently ranks #1 on Google for "Lars Jebe" with `lcjebe.github.io`. We want to preserve that ranking through the domain change.

The good news: GitHub Pages **automatically issues 301 redirects** from `lcjebe.github.io` → the custom domain once the CNAME is set. 301s are the canonical "this URL has permanently moved" signal and Google treats them as full ranking-equity transfers (typically over a few weeks).

Action checklist to make the transition as smooth as possible:

1. **Add `<link rel="canonical" href="https://larsjebe.com/...">`** on every page (handle in `BaseLayout.astro`). Tells Google to consolidate signals on the new domain even before the 301s are crawled.
2. **Don't change the URL structure.** Keep the homepage at `/` and any subpages at the same paths they had before — don't rename `/projects` etc. mid-migration.
3. **Generate a `sitemap.xml`** (Astro has [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — one-line install). Submit it via Google Search Console for the new property.
4. **Set up Google Search Console for both properties:**
   - Verify `larsjebe.com` (DNS TXT record verification is easiest).
   - Keep `lcjebe.github.io` verified too — needed for the next step.
   - Use Search Console's [Change of Address tool](https://support.google.com/webmasters/answer/9370220) to formally tell Google "this site has moved." This is purpose-built for exactly this scenario and accelerates the index update.
5. **Update external profiles** that link to `lcjebe.github.io` (LinkedIn, Flickr, GitHub profile, Google Scholar, IG bio, CV PDF) to the new domain. Each updated backlink reinforces the move.
6. **Don't disable the GitHub Pages 301** for at least 6–12 months. Even after Google fully transitions, leave the redirect in place to catch old links from forums, papers, etc.
7. **Add a `robots.txt`** in `public/robots.txt` referencing the sitemap.

Expected timeline: most "Lars Jebe" search results should swap to `larsjebe.com` within 2–6 weeks of DNS cutover, full transition in 1–3 months. Ranking position itself should hold throughout if the redirects and canonical tags are in place.

---

## Things I need from Lars (placeholders to fill in)

Tracked here so it's easy to scan when content arrives:

- [ ] **Updated CV PDF** (current is Nov 2023). Will replace `/cv.pdf`.
- [ ] **Phota Labs content** — co-authored blog posts URLs, product/feature names, thumbnails.
- [ ] **Adobe Camera Raw additional features** — list of shipped features beyond Adaptive Profile, with public links where they exist.
- [ ] **Adobe Adaptive Profile thumbnail** — Camera Raw UI screenshot or before/after comparison image (currently using `NeuralPhotoFinishing.jpg` as placeholder, which conflicts with Publications usage).
- [ ] **Photo curation** — final 20–40 photos for the gallery, ideally pre-cropped or with crop hints, plus theme/filter assignment per photo.
- [ ] **YouTube channel/playlist URL** for "More on YouTube" link.
- [ ] **Artwork "See more" link** — Behance / Are.na / IG / nothing.
- [ ] **Decision: GitHub Pages or Cloudflare Pages?** GitHub Pages is the lower-friction default; Cloudflare gives image transforms if we ever need them.
- [ ] **Decision: keep `lars.jebe@gmail.com` plain or obfuscate?** Recommend mailto with optional JS obfuscation against scrapers.
- [ ] **Decision: custom domain?** (e.g., larsjebe.com) — affects DNS + Astro `site` config.

---

## Files to keep, migrate, or remove

| Current file | Action |
|---|---|
| `index.html` | Replace (Astro builds new one). Move to `_legacy/` initially, remove pre-launch. |
| `projects.html` | Defer to v2 `/projects` page. Move to `_legacy/`. |
| `elements.html`, `generic.html`, `cs148_gallery.html` | `_legacy/` then remove unless externally linked. |
| `assets/css/`, `assets/sass/`, `assets/js/`, `assets/webfonts/` | Remove. Replaced by Astro pipeline + tokens.css. |
| `assets/CV_Lars_Jebe_Nov2023.pdf` | Replace with updated CV → `public/cv.pdf`. |
| `assets/AR_in_the_OR.pptx`, `assets/AR_in_the_OR_poster.pdf`, `assets/The_Incandescent_Duet.pdf` | Move to `public/legacy/` if `/projects` v2 will reference them; otherwise remove. |
| `images/*.jpg` | Move usable thumbnails (`diffusionrig_teaser.jpg`, `NeuralPhotoFinishing.jpg`, `nlr_square.jpg`, `ar2_square.jpg`, `lars_pali.jpg`) → `src/assets/`. Drop unused (`pic01.jpg`–`pic06.jpg` — HTML5UP filler). |
| `images/gallery/*` | Photo curation → `src/assets/photos/`. Drop `_compressed.jpg` duplicates (Astro will optimize). |
| `images/art/*` | `art_compressed.jpg` → `src/assets/art/art.jpg`. |
| `_design_reference/` | Keep as reference until launch; remove from public output (gitignore or move outside repo). |
| `LICENSE.txt`, `README.txt` | Keep `LICENSE.txt`; rewrite `README.txt` to reflect new stack. |
| `google3748b23217553190.html` | Keep (Google Search Console verification — root-level required). Place in `public/`. |

---

## Verification plan

After Phase 5, before deploy:

1. **Local dev:** `npm run dev`, walk through every section, every link, every interactive piece.
2. **Local build:** `npm run build && npm run preview`, run Lighthouse mobile + desktop. Targets per DESIGN.md §9: ≥95 across the board, LCP < 2.0 s on 3G.
3. **Real device:** open preview tunnel (e.g., Cloudflare Tunnel or `npx serve` + ngrok) and test on actual iPhone — verify hamburger nav, masonry collapse, lightbox swipe.
4. **Theme:** verify dark default matches `prefers-color-scheme: dark`, light works, manual toggle persists across reload (`localStorage`).
5. **Reduced motion:** set OS reduce-motion, confirm hero carousel freezes on first frame.
6. **Print:** rough print stylesheet check (not a goal, but shouldn't be broken).
7. **All external links** open in new tab with `rel="noopener noreferrer"`.
8. **Alt text audit:** every `<img>` has meaningful, non-redundant alt.
9. **Cross-page coherence:** if a `/projects` page exists, confirm it shares `BaseLayout` exactly.

After deploy:

1. Hit `https://lcjebe.github.io` cold (different network, real Safari iOS), confirm load < 2 s and visual match.
2. Run https://pagespeed.web.dev against the deployed URL.
3. Tag in git: `v2.0-launch`.

---

## Critical file references

- [DESIGN.md](DESIGN.md) — strategic brief; engineer-not-researcher framing; non-negotiable constraints.
- [_design_reference/index.html](_design_reference/index.html) — visual source of truth, to be matched faithfully.
- [_design_reference/tokens.css](_design_reference/tokens.css) — design tokens to be ported wholesale to `src/styles/tokens.css`.
- [_design_reference/design-system.html](_design_reference/design-system.html) — component specimens / anti-pattern guardrails.
- Memory: `~/.claude/projects/-Users-jebe-src-lcjebe-github-io/memory/` — positioning + design-taste constraints saved as standing guidance.

---

## Quick estimate

- Phase 1: 1–2 hr
- Phase 2: 3–4 hr
- Phase 3: 2 hr
- Phase 4: 1–2 hr
- Phase 5: 2 hr
- Phase 6: 1 hr

**Total: ~10–13 focused hours**, assuming Lars is providing content asynchronously. v1 can ship with placeholders for the items in §"Things I need from Lars" and be progressively filled in without redesign.
