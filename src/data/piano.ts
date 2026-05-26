export const pianoSection = {
  marker: "05 · From the studio",
  title: "Piano",
};

export interface PianoVideo {
  videoUrl: string;
  duration: string;
  label: string;
  title: string;
  description: string;
  /** Optional offset in seconds to seek into the video on play. */
  startSeconds?: number;
}

/**
 * Piano recordings. Both posted on YouTube; durations are placeholders.
 * Lars to confirm exact runtimes.
 */
export const pianoVideos: PianoVideo[] = [
  {
    videoUrl: "https://www.youtube.com/watch?v=WqjmNg-FRLI",
    duration: "04:30", // placeholder — Lars to confirm
    label: "Liszt · Liebestraum No. 3",
    title: "S. 541, No. 3",
    description:
      "Stitched together from a few takes. " +
      "Recorded with my phone at Brown Music Center at Stanford.",
    startSeconds: 7,
  },
  {
    videoUrl: "https://www.youtube.com/watch?v=upXb8zjPaz8",
    duration: "08:45", // placeholder — Lars to confirm
    label: "Beethoven · Piano Sonata No. 8 (“Pathétique”)",
    title: "I. Grave — Allegro di molto e con brio",
    description:
      "Beethoven is one of the few composers I never get tired of. Don't be discouraged by the slow start -- it turns into a really fun piece to listen to! " +
      "Recorded with my phone at Brown Music Center at Stanford.",
    startSeconds: 10,
  },
];

// Older / archive link — points to a separate channel of pop-song piano
// covers Lars made years ago.
export const pianoMoreUrl = "https://www.youtube.com/@solopianolj3501/videos";
