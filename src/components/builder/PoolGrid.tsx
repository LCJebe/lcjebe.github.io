// Photos that exist in photos.json but aren't currently in portfolio.order —
// the "pool" of removed/never-added photos. No drag-reorder (no inherent
// order), just an "add to portfolio" action per tile.

import type { Category, Photo, Render } from "~/data/schema";
import { packIntoColumns } from "~/lib/masonryPack";
import PhotoTile from "./PhotoTile";

interface Props {
  poolPhotos: Photo[];
  allCategories: Category[];
  /** Tile size/format come from portfolio.render so the pool view matches
   *  what would ship if these photos were added back. */
  render: Render;
  membershipsOf: (photoId: string) => string[];
  suggestedNewOf: (photoId: string) => string[];
  onToggleCategory: (photoId: string, categoryId: string) => void;
  onPromoteSuggestion: (photoId: string, label: string) => void;
  onAddToPortfolio: (photoId: string) => void;
}

export default function PoolGrid({
  poolPhotos,
  allCategories,
  render,
  membershipsOf,
  suggestedNewOf,
  onToggleCategory,
  onPromoteSuggestion,
  onAddToPortfolio,
}: Props): React.ReactElement {
  if (poolPhotos.length === 0) {
    return (
      <p className="builder-empty">
        No photos in the pool. Every photo on R2 is currently in your portfolio.
      </p>
    );
  }
  const packedCols = packIntoColumns(poolPhotos, 3);
  return (
    <div className="masonry is-editor" data-cols="3">
      {packedCols.map((col, i) => (
        <div className="masonry-col" key={i}>
          {col.map((p) => (
            <PhotoTile
              key={p.id}
              photo={p}
              memberships={membershipsOf(p.id)}
              allCategories={allCategories}
              suggestedNew={suggestedNewOf(p.id)}
              mode="pool"
              tileFormat={render.tile_format}
              tileSize={render.tile_size}
              onToggleCategory={(cid) => onToggleCategory(p.id, cid)}
              onPromoteSuggestion={(s) => onPromoteSuggestion(p.id, s)}
              onRemove={() => {}}
              onAdd={() => onAddToPortfolio(p.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
