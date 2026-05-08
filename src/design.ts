/**
 * Design knobs — single source of truth for look-and-feel axes.
 *
 * Each field below corresponds to one design axis. BaseLayout.astro emits
 * these as `data-*` attributes on <html>; src/styles/variants.css keys CSS
 * overrides off those attributes.
 *
 * The default look (the v3 mockups) is defined in tokens.css + components.css.
 * Variants only contain *deltas*, so values are never duplicated — to revert
 * any axis, copy the value from the `default:` comment back over the field.
 *
 * Switching the whole site to defaults: set every field to its default value
 * (or remove the variants.css import in BaseLayout.astro for a hard reset).
 */

export type ColorScheme = "warm";
export type TypePairing = "fraunces-display" | "mono-display";
export type TypeScale = "default" | "dramatic";
export type SelectionColor = "accent" | "foreground";
export type Toggle = "on" | "off";

export interface DesignConfig {
  colorScheme: ColorScheme;
  typePairing: TypePairing;
  typeScale: TypeScale;
  selectionColor: SelectionColor;
  heroCtaArrow: Toggle;
}

export const design: DesignConfig = {
  colorScheme: "warm",          // default: "warm"
  typePairing: "mono-display",  // default: "fraunces-display"
  typeScale: "dramatic",        // default: "default"
  selectionColor: "foreground", // default: "accent"
  heroCtaArrow: "off",          // default: "on"
};

/**
 * Map the config to the data-attribute object spread onto <html>.
 * Kept here so BaseLayout doesn't need to know each axis individually.
 */
export const designDataAttrs = {
  "data-color-scheme": design.colorScheme,
  "data-type-pairing": design.typePairing,
  "data-type-scale": design.typeScale,
  "data-selection-color": design.selectionColor,
  "data-hero-cta-arrow": design.heroCtaArrow,
} as const;
