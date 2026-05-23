// Drag-reorder grid of photos in the portfolio. Items live inside
// .masonry-col wrappers — same greedy shortest-fit pack the live site
// uses — so the editor preview matches what `/` will ship. dnd-kit's
// SortableContext still sees a flat id list; nesting items in column
// divs doesn't affect rectangle-based drop detection.

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import type { Category, Photo, Render } from "~/data/schema";
import { packIntoColumns } from "~/lib/masonryPack";
import PhotoTile from "./PhotoTile";

interface Props {
  /** Display order — typically the filtered subset of portfolio.order. */
  orderedPhotos: Photo[];
  /** Full portfolio.order — what we mutate when drag ends in "all" /
   *  "uncategorized" mode. The display list may be filtered, so reordering
   *  must be lifted back to the full order. */
  fullOrder: string[];
  allCategories: Category[];
  vocabSet: Set<string>;
  /** Tile size/format come from portfolio.render so the editor shows what
   *  the live site will ship — true WYSIWYG. */
  render: Render;
  /** Hides editing chrome (chips, drag handle, action button) — for the
   *  Preview toggle in the topbar. */
  isPreview: boolean;
  membershipsOf: (photoId: string) => string[];
  suggestedNewOf: (photoId: string) => string[];
  /** Single-category filter id when the user is viewing one category, else
   *  null. Drives whether drag-reorders mutate `category_orders[id]` (per-
   *  category) or `portfolio.order` (global). */
  activeCategoryFilter: string | null;
  onSetOrder: (newOrder: string[]) => void;
  onSetCategoryPhotoOrder: (categoryId: string, order: string[]) => void;
  onToggleCategory: (photoId: string, categoryId: string) => void;
  onPromoteSuggestion: (photoId: string, label: string) => void;
  onRemoveFromPortfolio: (photoId: string) => void;
}

export default function EditorGrid({
  orderedPhotos,
  fullOrder,
  allCategories,
  vocabSet,
  render,
  isPreview,
  membershipsOf,
  suggestedNewOf,
  activeCategoryFilter,
  onSetOrder,
  onSetCategoryPhotoOrder,
  onToggleCategory,
  onPromoteSuggestion,
  onRemoveFromPortfolio,
}: Props): React.ReactElement {
  // Slight activation distance so click events on chips/buttons don't
  // immediately start a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const ids = orderedPhotos.map((p) => p.id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const filteredFrom = ids.indexOf(String(active.id));
    const filteredTo = ids.indexOf(String(over.id));
    if (filteredFrom < 0 || filteredTo < 0) return;
    if (activeCategoryFilter) {
      // Single category view — reorder within the filtered set only and
      // persist to `category_orders[activeCategoryFilter]`. The global
      // `order` and other categories' orders are untouched, which is the
      // whole point: shared photos can sit in different positions in
      // different category views.
      onSetCategoryPhotoOrder(
        activeCategoryFilter,
        arrayMove(ids, filteredFrom, filteredTo),
      );
      return;
    }
    // "All" or "uncategorized" — lift the reorder to the FULL order so the
    // move lands adjacent to the over-target in global space.
    const fullFrom = fullOrder.indexOf(String(active.id));
    const fullTo = fullOrder.indexOf(String(over.id));
    if (fullFrom < 0 || fullTo < 0) return;
    onSetOrder(arrayMove(fullOrder, fullFrom, fullTo));
  };

  // suppress unused param warning until vocab-tied UI logic kicks in
  void vocabSet;

  const packedCols = packIntoColumns(orderedPhotos, 3);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div
          className={`masonry is-editor ${isPreview ? "is-preview" : ""}`}
          data-cols="3"
        >
          {packedCols.map((col, i) => (
            <div className="masonry-col" key={i}>
              {col.map((p) => (
                <PhotoTile
                  key={p.id}
                  photo={p}
                  memberships={membershipsOf(p.id)}
                  allCategories={allCategories}
                  suggestedNew={suggestedNewOf(p.id)}
                  mode="portfolio"
                  tileFormat={render.tile_format}
                  tileSize={render.tile_size}
                  onToggleCategory={(cid) => onToggleCategory(p.id, cid)}
                  onPromoteSuggestion={(s) => onPromoteSuggestion(p.id, s)}
                  onRemove={() => onRemoveFromPortfolio(p.id)}
                  onAdd={() => {}}
                />
              ))}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
