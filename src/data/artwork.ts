export const artworkSection = {
  marker: "06 · Made by hand",
  title: "Paint + Craft",
};

export interface ArtImage {
  /** R2 site-asset path, e.g. "artwork/venice_1". Resolved via siteAssetUrl. */
  path: string;
  alt: string;
  width: number;
  height: number;
}

export interface ArtSingle {
  kind?: "single";
  /** R2 site-asset path, e.g. "artwork/painting_sunrise". */
  path: string;
  imageAlt: string;
  title: string;
  width: number;
  height: number;
  /** Optional "making-of" image, opened in a lightbox via a button on this slide. */
  makingOf?: {
    path: string;
    alt: string;
    width: number;
    height: number;
    /** Button label. */
    label: string;
  };
}

export interface ArtCollage {
  kind: "collage";
  title: string;
  images: ArtImage[];
}

export type ArtPiece = ArtSingle | ArtCollage;

export const artworks: ArtPiece[] = [
  {
    path: "artwork/painting_sunrise",
    imageAlt: "Painting of a beach sunrise with palm tree and gulls",
    title: "sunrise at lanikai beach",
    width: 3533,
    height: 2659,
  },
  {
    path: "artwork/third_movement",
    imageAlt: "Abstract painting with treble clef, music notes, and piano keys",
    title: "third movement",
    width: 3581,
    height: 2376,
  },
  {
    kind: "collage",
    title: "venice, unfinished",
    images: [
      {
        path: "artwork/venice_1",
        alt: "Venice painting in progress — panel one",
        width: 3618,
        height: 4824,
      },
      {
        path: "artwork/venice_2",
        alt: "Venice painting in progress — panel two",
        width: 3710,
        height: 4947,
      },
      {
        path: "artwork/venice_3",
        alt: "Venice painting in progress — panel three",
        width: 3652,
        height: 4869,
      },
    ],
  },
  {
    path: "artwork/pineapple",
    imageAlt: "String-art pineapple mounted on a reclaimed pallet-wood backdrop",
    title: "string art on pallet wood",
    width: 3996,
    height: 3996,
    makingOf: {
      path: "artwork/woodworking/woodwork-collage",
      alt: "Process collage: building the pallet-wood backdrop for the pineapple piece",
      width: 1600,
      height: 1272,
      label: "see how I made this backdrop",
    },
  },
];
