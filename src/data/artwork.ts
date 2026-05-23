export const artworkSection = {
  marker: "06 · Art + Craft",
  title: "Made by hand",
};

export interface ArtPiece {
  imageSrc: string;
  imageAlt: string;
  title: string;
  width: number;
  height: number;
}

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
    imageSrc: "/images/art/painting2.jpg",
    imageAlt: "Painting of cherry blossoms framing a snow-capped mountain",
    title: "venice, unfinished",
    width: 1856,
    height: 3694,
  },
];
