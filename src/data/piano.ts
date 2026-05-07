export const pianoSection = {
  marker: "05 · from the studio",
  title: "Piano.",
  desc: "Two pieces I keep coming back to. Recorded at Brown Music Center at Stanford.",
};

export interface PianoVideo {
  videoUrl: string;
  duration: string;
  label: string;
  title: string;
  description: string;
}

/**
 * Piano recordings. Both posted on YouTube; durations are placeholders.
 * Lars to confirm exact runtimes.
 */
export const pianoVideos: PianoVideo[] = [
  {
    videoUrl: "https://www.youtube.com/watch?v=upXb8zjPaz8",
    duration: "08:45", // placeholder — Lars to confirm
    label: "Beethoven · Piano Sonata No. 8 (“Pathétique”)",
    title: "I. Grave — Allegro di molto e con brio.",
    description:
      "Beethoven is one of the few composers I never get tired of.",
  },
  {
    videoUrl: "https://www.youtube.com/watch?v=WqjmNg-FRLI",
    duration: "04:30", // placeholder — Lars to confirm
    label: "Liszt · Liebestraum No. 3",
    title: "S. 541, No. 3.",
    description:
      "Played at the slowest tempo I could justify and still call it Liszt. " +
      "Stitched together from a few takes.",
  },
];

// "More on YouTube" link — points at the channel.
// Placeholder: Lars to provide canonical YouTube channel URL.
export const pianoMoreUrl = "https://www.youtube.com/@LarsJebe";
