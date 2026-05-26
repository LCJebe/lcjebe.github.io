export const artworkSection = {
  marker: "06 · Made by hand",
  title: "Artwork",
};

export interface ArtImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ArtSingle {
  kind?: "single";
  imageSrc: string;
  imageAlt: string;
  title: string;
  width: number;
  height: number;
}

export interface ArtCollage {
  kind: "collage";
  title: string;
  images: ArtImage[];
}

export type ArtPiece = ArtSingle | ArtCollage;

export const artworks: ArtPiece[] = [
  {
    imageSrc: "/images/art/PAINTING.jpg",
    imageAlt: "Painting of a beach sunrise with palm tree and gulls",
    title: "sunrise at lanikai beach",
    width: 3533,
    height: 2659,
  },
  {
    imageSrc: "/images/art/IMG_5341.jpg",
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
        src: "/images/art/venice1.jpg",
        alt: "Venice painting in progress — panel one",
        width: 3618,
        height: 4824,
      },
      {
        src: "/images/art/venice2.jpg",
        alt: "Venice painting in progress — panel two",
        width: 3710,
        height: 4947,
      },
      {
        src: "/images/art/venice3.jpg",
        alt: "Venice painting in progress — panel three",
        width: 3652,
        height: 4869,
      },
    ],
  },
];
