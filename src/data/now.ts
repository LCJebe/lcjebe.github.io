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
  marker: "01 · NOW",
  title: "How I work",

  paragraphs: [
    `Most of my best engineering isn't visible from the outside. The papers ` +
    `below got published; the day-to-day is the long tail underneath — ` +
    `model pipelines, training and dataset infrastructure, evaluation, the ` +
    `unglamorous work that decides whether a feature actually survives on a ` +
    `real device or doesn't.`,

    `I'm useful at two seams. Between research and product — taking ` +
    `something that works in a notebook and making it ship for a million ` +
    `people. And between engineering and product instinct — most ML ` +
    `engineers shipping at scale aren't thinking product-first; most ` +
    `people with product judgment can't actually build the model. Both ` +
    `together is rarer than it should be, and it's why the work lands.`,

    `Sometimes the engineering rises to a publication; more often it just ` +
    `ships. I prefer to ship.`,
  ],
};
