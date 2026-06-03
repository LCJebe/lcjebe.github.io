/**
 * "Now / How I work" — short standing paragraphs in Lars's voice.
 *
 * Deliberately NOT a re-cap of the hero (which already lists affiliations).
 * This section is about HOW he works — process, instincts, principles.
 *
 * The last paragraph automatically renders in --fg-faint via
 * `.now-block p:last-child` — write it shorter and quieter as a closing line.
 */

export const now = {
  marker: "01 · Now",
  title: "How I work",

  paragraphs: [
    `I'm useful at two seams. Between research and product: taking ` +
    `something that works in a notebook and making it ship for a million ` +
    `people. And between engineering and product instinct: <strong>most ML ` +
    `engineers shipping at scale aren't thinking product-first; most ` +
    `people with product judgment can't ship the system underneath.</strong> Both ` +
    `together is rare, and it's why the work lands.`,

    `Most of my best engineering isn't visible from the outside, but you can ` +
    `see it in the products it ends up in. The parts that don't show are usually ` +
    `the parts that decide whether a feature actually survives in the real world.`,

    `Sometimes the engineering is turned into a publication; more often it just ` +
    `ships. I prefer to ship.`,
  ],
};