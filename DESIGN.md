# DESIGN.md — Personal website overhaul

This document is the design brief for a redesign of [lcjebe.github.io](https://lcjebe.github.io). It exists so a design tool (or anyone joining mid-stream) can produce work aligned with the strategy without re-deriving it from scratch.

> **Note on the existing repo:** The current site uses the HTML5UP "Stellar" template. **We are intentionally departing from its visual language** — do not treat the existing CSS/layout as a starting point or constraint. Use it only as a reference for what content already exists.

---

## 1. The brief in one paragraph

Lars Jebe is overhauling his personal website to support a 2026 job search positioning him as **top AI engineering talent in the creative space**. The site must communicate, simultaneously and in every element: **creative taste**, **deep personal warmth**, and **extraordinary technical achievement**. Most personal sites in this category convey one or two of these. The redesign succeeds only if it lands all three.

**Critical framing note:** Lars is **an AI engineer who ships, not a researcher.** ~95% of his career has been engineering — building production AI features. His 3 publications (all middle/co-author) are a *byproduct* of doing engineering at research-grade depth, not the headline of his career. Positioning him as a researcher with 3 papers makes him look weaker than he is. Positioning him as an engineer-who-ships, where the work occasionally rises to publishable research, is both more accurate and a much stronger pitch. The whole site should reflect this — see Section 3 for tagline implications and Section 5 for IA implications.

---

## 2. Who the person is (so design choices can land)

Lars's unfair combination is the heart of the brief:

- **Engineer who ships at research-grade depth.** ~4 years on **Marc Levoy's** computational photography team at **Adobe** (until ~May 2025). Contributed to the **Adobe Adaptive Profile** in Camera Raw (Oct 2024), used by millions. Before Adobe: Compute Team at **Raxium** (acquired by Google). Currently at **Phota Labs** on generative AI / visual content; co-author on company technical blog posts. The day-to-day work is engineering — making AI features run reliably and at scale on real users' devices.
- **Caliber proof — selected publications** (treat as evidence that his engineering is research-grade, not as the headline):
  - *DiffusionRig* — CVPR 2023
  - *Neural Photo-Finishing* — SIGGRAPH Asia 2022
  - *Neural Lumigraph Rendering* — CVPR 2021 (best paper candidate)
- **Education.** MS Electrical Engineering, Stanford. BS EE/IT, RWTH Aachen.
- **Creative output that is real, not decorative.**
  - Classical piano (recordings on YouTube)
  - Photography (Flickr / Instagram @larsjebe — kitesurfing, landscapes, portraits, his Siberian Husky Lucy)
  - Visual artwork
- **Personality default:** low-key, often underestimated. The site must compensate without becoming braggy. Specificity (named teams, named products, named affiliations) does the work that adjectives can't.

This combination — engineer shipping production AI for creative tools at a caliber that occasionally produces CVPR/SIGGRAPH publications, with multiple credible creative outputs of his own — is genuinely rare. Lead with it.

**Engineering-visibility problem to solve:** the bulk of Lars's strongest work is invisible to the public — internal Adobe engineering, proprietary Phota Labs work, things he never blogged. Compensate by leaning on credibility transfer (named teams / named products / named affiliations), specific shipped product names with thumbnails, a short "How I work" or "Now" paragraph in his voice, and (post-launch) 1–3 short blog posts to break the no-public-engineering-writing pattern.

---

## 3. Positioning statement

**"AI engineer building creative tools."** (working tagline — final wording TBD)

Sub-credentials to surface near the name: **company affiliations only** — *Phota Labs · ex-Adobe (Marc Levoy's team) · Stanford EE.*

**Do NOT put "CVPR · SIGGRAPH" in the hero credential chips.** Publications are caliber proof, not the headline. Surface them mid-page in their own block (see Section 5). Hiding them slightly so they over-deliver when found is the deliberate move; teasing them in the hero would frame Lars as "researcher with 3 papers" — a weaker pitch than "engineer who ships at research-grade depth."

The exact tagline wording is not yet locked — treat it as a placeholder that the design must accommodate (~70–110 characters of tagline + a row of small credential chips, company-affiliations only).

---

## 4. The three-way spec — creative + personal + accomplished

The single most important design principle. **Do not solve this by giving each axis its own section.** Combine all three within single elements wherever possible. Specifically:

| Axis | What signals it |
|---|---|
| **Creative** | His own photography integrated into the design (not just in a gallery); typographic taste; restraint; one well-tuned micro-interaction; intentional whitespace; generous treatment of images |
| **Personal** | First-person voice in copy; specific anecdotes (Siberian Husky Lucy, kitesurfing, piano); a portrait somewhere; warmth in spacing/type choices; not corporate |
| **Accomplished** | Named teams and named affiliations (Adobe, Marc Levoy's team, Stanford, Raxium, Phota Labs) carrying credibility transfer; shipped product names with links and thumbnails; small caps or badges for affiliations; publications listed as caliber evidence (CVPR, SIGGRAPH) but not as the headline |

**Anti-patterns that break the spec:**
- Three separate sections each "doing" one axis (creates a fragmented, switching feel).
- Generic stock-photo or template vibe (kills creative + personal in one move).
- Academic dryness with author lists and no voice (kills personal).
- Visual-only with no specific credentials (kills accomplished).

---

## 5. Information architecture

Order chosen so **shipped engineering leads**, publications appear as caliber proof, personality follows, bio closes. Inverts the usual "About first" structure on purpose.

1. **Hero** — full viewport, generous. Photo, name, sharp tagline, **company-affiliation chips only** (no CVPR/SIGGRAPH), socials, one CTA (CV).
2. **Now / How I work** — short standing paragraph (~2–4 sentences) in Lars's first-person voice. Says what he's currently working on at Phota Labs and how he thinks about the research-product seam, without leaking proprietary detail. Purpose: assert technical depth that the artifact list alone cannot, given that most of his strongest engineering is invisible. Could live just under the hero, or alongside the hero in a sidebar arrangement.
3. **Shipped** — **the headline section.** Named, in-production products and features Lars has contributed to. Each card: thumbnail / screenshot, product name, one sentence on what it does, one sentence on what *he specifically* did, link to public material (blog post, product page, demo). Examples: Adobe Adaptive Profile (Camera Raw, Oct 2024 — public blog post exists), other Adobe Camera Raw work (to be enumerated), Phota Labs work (linked to co-authored company blog posts), anything from Raxium that's public. Treat this as the largest, most visually weighted block of work — it is the new headline that replaces the old "Research + Projects" framing.
4. **Selected publications** — smaller, denser block placed *below* Shipped. Three rows: DiffusionRig (CVPR 2023), Neural Photo-Finishing (SIGGRAPH Asia 2022), Neural Lumigraph Rendering (CVPR 2021, best paper candidate). Each row: small thumbnail, title + author list + venue/year + links (project page, arXiv). A short framing line above the block — something like *"Co-author at top venues while shipping product"* — tells the reader these are evidence of caliber, not Lars's main job. Do not visually inflate this section.
5. **Photography** — **real portfolio**, not a small teaser. 20–40 hand-curated images. Either themed sections OR single masonry grid with filter chips (Lars will decide post-curation). Click → lightbox with full-res, keyboard nav, swipe on mobile. "More on Flickr/Instagram" as footer-of-section link only.
6. **Piano** — one cleanly embedded video (lite-youtube-embed style, custom thumbnail click-to-play), plus "more on YouTube" link.
7. **Artwork** — small section, taste signal not main course. One or two pieces.
8. **About + Contact** — short, conversational, in his voice. Email, social links, brief bio context not already established in hero.

**Visual weighting** (largest → smallest): Hero ≈ Shipped > Photography > Now/How I work > Selected publications ≈ Piano > Artwork > About/Contact. Note that publications get *less* visual weight than the shipped products that wrap them — that asymmetry is intentional and is the clearest expression of the engineer-not-researcher framing.

---

## 6. Design language direction

The site should feel like **2026, not 2017**. Modern minimal, but warmer than the typical engineer portfolio.

- **Type:** Variable fonts. Strong serif for the name (candidates: Fraunces, Tiempos, Söhne Breit, GT Sectra) — adds personal warmth and creative signal. Clean sans for body and UI (candidates: Inter Tight, Geist, Söhne). Possibly small caps for venue names ("CVPR 2023"). Tight, intentional letter-spacing on display sizes.
- **Color:** Restrained palette. Single accent color, subtle. Light + dark mode both first-class — follow `prefers-color-scheme` with manual toggle. Dark mode is not just "invert the colors" — design both.
- **Spacing:** Generous but disciplined. One spacing scale used everywhere (suggested: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px or rem-equivalent). No element violates the scale.
- **Imagery:** Lars's own photography is the primary visual material — used as hero element, section anchors, and gallery. Not stock, not abstract gradients.
- **Motion:** Restrained. One signature micro-interaction maximum (e.g., subtle hover crossfade on the hero photo, or a hand-drawn arrow accent). No page-load animations, no scroll-jacking, no flashy transitions.
- **Borders / chrome:** Minimal. Hairline dividers (1px or thinner), thoughtful use of whitespace as separator instead of heavy boxes/cards.

---

## 7. Reference sites

**Closest spiritual reference:**
- **Craig Mod** — [craigmod.com](https://craigmod.com). Photographer-writer with deep achievement, deeply personal voice, photography integrated into the design language. Closest analog to Lars's photographer-engineer hybrid.

**Strong on the "personal + creative + accomplished" combination:**
- **Maggie Appleton** — [maggieappleton.com](https://maggieappleton.com). Hand-illustrated, clearly a serious thinker. Best-in-class for the three-way spec.
- **Tyler Hobbs** — [tylerxhobbs.com](https://tylerxhobbs.com). Generative artist who codes — accomplished, polished, has voice.
- **Frank Chimero** — [frankchimero.com](https://frankchimero.com). Designer/writer, warm.
- **Robin Sloan** — [robinsloan.com](https://robinsloan.com). Mostly text, but unmistakable voice.

**Helpful for layout density / engineering credibility (but lacking warmth — borrow density only, not coldness):**
- Lee Robinson — leerob.com
- Bryce Wray — brycewray.com

**Helpful for sidebar-identity layout idea (persistent "who you are" alongside scrollable content):**
- HTML5UP Strata — html5up.net/strata. The structural idea (fixed sidebar with photo/name/socials, scrollable main column) maps well onto the three-way spec because identity is always present while achievements scroll. Use the **idea**, not the visuals.

**Explicitly rejected references:**
- **Rauno Freiberg** (rauno.me) — strong creative signal but unclear engineering credibility, and a noticeable design gap between the landing page and subpages. Avoid the navigation-coherence problem.

---

## 8. Specific design moves agreed

These are concrete decisions the design should embody:

- **Combine intro + header.** The current site introduces Lars twice (hero + "About Me"). The new hero is the introduction; the bio at the end is *context*, not introduction.
- **Hero combines all three axes in one block:**
  - Background or composition anchor: one of his own photographs (creative).
  - First-person sentence in his real voice (personal).
  - Small **company-affiliation** chips beneath — Phota Labs, ex-Adobe (Marc Levoy's team), Stanford EE — accomplishment via credibility transfer (accomplished). **No publication chips here.**
  - Small portrait + name in a sidebar or corner (personal warmth).
- **Shipped block leads, publications follow.** The largest work-related visual block is named, in-production products. Publications are a smaller, later block framed as caliber proof. This visual asymmetry is the single clearest expression of the engineer-not-researcher framing — preserve it through every iteration.
- **Project / shipped rows:** dense, scannable rows with one human sentence per entry ("what I actually did, what was hard"). Don't go full academic-dry; add voice.
- **Density signals seriousness.** Lars has more strong work than the current site shows — pack shipped products into scannable rows so the *quantity* is visible.
- **Photography as load-bearing creative proof,** not a hobby footnote.
- **One small craft moment.** Not a big animation. One restrained detail (hand-drawn arrow accent, cursor-following highlight on hero photo, soft hero-photo crossfade — pick one). Restraint reads as confidence.
- **Sticky-on-scroll-up nav** (hidden on scroll-down) appearing only after the hero. Mobile uses a standard hamburger.
- **Drop the stale "May 2025 hiring news" banner** (it's a year old and reads as inattention). Replace with current state or remove.
- **Update the CV link** (currently dated Nov 2023).

---

## 9. Constraints (non-negotiable)

- **Cross-page design coherence.** Subpages (e.g., expanded projects list, lightbox views) must feel like a continuous design system with the landing page — same nav, same type scale, same chrome, same color tokens. Lars actively notices and dislikes design gaps between landing and subpages. Build a single design system; do not let subpages drift.
- **Performance.** Web AND mobile must feel fast. Hero LCP under 2.0s on 3G-throttled mobile. No multi-megabyte images. Photography section must lazy-load.
- **Mobile-first.** Hamburger nav, touch-friendly hit targets, generous tap zones, masonry/grid that works on narrow screens. Project rows should collapse cleanly.
- **Dark + light mode** both first-class. Follow `prefers-color-scheme`, plus manual toggle.
- **Accessibility.** Real focus states, keyboard nav for lightbox/gallery, color contrast meets WCAG AA, alt text on every image.
- **No design-tool exotic features that don't survive code export.** The output of Claude Design's work will be implemented in Astro with hand-written modern CSS. Anything that requires proprietary runtime tooling won't make it to production.

---

## 10. Open questions (still to decide)

These are intentionally unresolved. Design exploration can propose options.

- **Hero photo:** which of Lars's photographs? Should it be a portrait of him, a landscape/kitesurfing/wave shot, or both (e.g., portrait in sidebar + photograph as main hero)?
- **Gallery shape:** themed sections vs. single masonry with filter chips. Lars will decide after curating ~30–40 candidate photos.
- **One craft moment:** which one? Hand-drawn accent, hero crossfade, cursor-following highlight, subtle generative element, etc.
- **Tagline final wording:** placeholder above is directional, not final. Will be tightened against real source material (LinkedIn, Phota Labs blogs) in a later pass.
- **Color accent:** a single accent color is desired but not yet chosen. Should feel personal — possibly drawn from a recurring tone in his photography (warm ocean blues / golden hour / etc.).
- **"Now / How I work" copy:** placement (under hero vs. alongside hero) and exact wording TBD. Should be 2–4 sentences, first person, asserting technical depth at the research-product seam without proprietary detail.
- **Shipped section completeness:** the full list of named products / features Lars has contributed to (beyond Adobe Adaptive Profile and Phota Labs blogs) is not yet enumerated. Will be drafted from LinkedIn + memory in a later pass.

---

## 11. What success looks like

- A hiring manager landing on the page within 5 seconds knows: this person does serious AI research, ships real products, AND has unusual creative range.
- A creative director landing on the same page within 5 seconds knows: this person has visual taste and isn't "just" an engineer.
- A friend or peer landing on the page feels like they got a sense of *who Lars is* — warm, specific, not corporate.
- Site loads fast on a mid-range phone over a weak connection.
- Every subpage feels like the same site as the landing page, no design seams.

If the design hits all five, we're done.

---

## 12. Scope note for the design phase

The expected output of the design phase is:

1. **Hero variants** (2–3 explored options).
2. **A design system**: type scale, color tokens (light + dark), spacing scale, component primitives (project row, photo card, nav, footer).
3. **Layout mockups** for each section in the IA above.
4. **One end-to-end visual page** showing the system applied.

The design will then be implemented in **Astro with hand-written modern CSS**, hosted on GitHub Pages or Cloudflare Pages, with photography optimized via Astro's `<Image>` component (or Bunny.net / Cloudflare Images if scale demands). Implementation is out of scope for the design phase — but the design should be implementable cleanly in static HTML/CSS without relying on proprietary runtime tooling.
