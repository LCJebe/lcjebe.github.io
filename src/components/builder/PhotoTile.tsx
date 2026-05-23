// Tile for the editor + pool grids. Built on the live site's `.masonry-item`
// so editor and viewer pack identically — chips are absolutely-positioned
// overlays at the bottom rather than a separate strip below the image.

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category, Format, Photo, Size } from "~/data/schema";
import { photoUrl } from "~/lib/photoUrl";

interface Props {
  photo: Photo;
  /** Category memberships from portfolio.photo_categories[id]. */
  memberships: string[];
  /** Full category list — for the "add" picker. */
  allCategories: Category[];
  /** AI-suggested categories that aren't yet promoted (i.e., not in
   *  allCategories). Shown as different chips with one-click promote. */
  suggestedNew: string[];
  mode: "portfolio" | "pool";
  /** Format/size for the tile <img>. Driven by portfolio.render so the
   *  builder shows what the live site will deliver. */
  tileFormat: Format;
  tileSize: Size;
  onToggleCategory: (categoryId: string) => void;
  onPromoteSuggestion: (label: string) => void;
  onRemove: () => void;
  onAdd: () => void;
}

export default function PhotoTile({
  photo,
  memberships,
  allCategories,
  suggestedNew,
  mode,
  tileFormat,
  tileSize,
  onToggleCategory,
  onPromoteSuggestion,
  onRemove,
  onAdd,
}: Props): React.ReactElement {
  const sortable = useSortable({
    id: photo.id,
    disabled: mode !== "portfolio",
  });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    sortable;

  const [pickerOpen, setPickerOpen] = useState(false);
  const labelOf = (id: string) =>
    allCategories.find((c) => c.id === id)?.label ?? id;
  const unjoined = allCategories.filter((c) => !memberships.includes(c.id));

  return (
    <div
      ref={setNodeRef}
      className={`masonry-item is-editor ${isDragging ? "is-dragging" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <img
        src={photoUrl(photo.id, tileFormat, tileSize)}
        alt={photo.id}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
      />
      {mode === "portfolio" && (
        <button
          type="button"
          className="builder-drag-handle"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      )}
      <button
        type="button"
        className="builder-tile-action"
        aria-label={mode === "portfolio" ? "Remove from portfolio" : "Add to portfolio"}
        title={mode === "portfolio" ? "Remove from portfolio" : "Add to portfolio"}
        onClick={mode === "portfolio" ? onRemove : onAdd}
      >
        {mode === "portfolio" ? "×" : "+"}
      </button>
      <div className="builder-tile-overlay">
        <div className="builder-chips">
          {memberships.map((cid) => (
            <button
              key={cid}
              type="button"
              className="builder-chip"
              title="Click to remove"
              onClick={() => onToggleCategory(cid)}
            >
              {labelOf(cid)} <span aria-hidden="true">×</span>
            </button>
          ))}
          {unjoined.length > 0 && (
            <span className="builder-chip-add">
              {pickerOpen ? (
                <select
                  autoFocus
                  className="builder-chip-picker"
                  onBlur={() => setPickerOpen(false)}
                  onChange={(e) => {
                    if (e.target.value) onToggleCategory(e.target.value);
                    setPickerOpen(false);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Add category…
                  </option>
                  {unjoined.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  className="builder-chip is-add"
                  onClick={() => setPickerOpen(true)}
                  title="Add category"
                >
                  +
                </button>
              )}
            </span>
          )}
          {suggestedNew.map((s) => (
            <button
              key={s}
              type="button"
              className="builder-chip is-suggested"
              title="Click to promote into a new category"
              onClick={() => onPromoteSuggestion(s)}
            >
              +{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
