# Photography portfolio — curation notes

Scratch doc for working out how the photo gallery is categorized,
sorted, and filtered. Not a spec — a place to think.

## Axes under consideration

### Palette

Group / sort by dominant color or mood.

- Palette 1 — _name? swatch?_
- Palette 2 — _name? swatch?_
- _Open: are palettes a filter (click → narrow set) or an ordering (color-runs across the grid)?_

### Keywords

Free-form, multi-tag per photo. Current shortlist:

- `wildlife`
- `creative`
- `water`
- `dynamic`
- _palette tags (above) — TBD_

## Open questions

- **Single axis or layered?** Palette chips + keyword chips at the same time, or pick one filter system?
- **Source of truth?** Lightroom IPTC keywords (already wired into `scripts/photos/pipeline.ts`'s `readPhotoMetadata`), or a manual override file?
- **Filter UI fit?** Existing `PhotoGrid.astro` has chip-style filters with `data-theme` per item — extends naturally to multi-tag.
