// Left sidebar — mode toggle (Portfolio/Pool), filter chips, category CRUD,
// drag-reorder for the user-defined category list.

import { useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "~/data/schema";

export type Mode = "portfolio" | "pool";
/** Filter for the photo grid. Either "all", a category id, or "uncategorized". */
export type Filter = "all" | "uncategorized" | string;

interface Props {
  mode: Mode;
  filter: Filter;
  categories: Category[];
  /** Counts per filter for the badge. Keyed by category id, plus
   *  pseudo-keys "all" and "uncategorized". */
  counts: Record<string, number>;
  onSetMode: (mode: Mode) => void;
  onSetFilter: (filter: Filter) => void;
  onAddCategory: (label: string) => void;
  onRenameCategory: (id: string, label: string) => void;
  onDeleteCategory: (id: string) => void;
  onSetCategoryOrder: (categoryIds: string[]) => void;
}

export default function CategorySidebar({
  mode,
  filter,
  categories,
  counts,
  onSetMode,
  onSetFilter,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onSetCategoryOrder,
}: Props): React.ReactElement {
  const [newLabel, setNewLabel] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const ids = categories.map((c) => c.id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onSetCategoryOrder(arrayMove(ids, from, to));
  };

  return (
    <aside className="builder-sidebar">
      <div className="builder-mode-toggle" role="tablist" aria-label="Mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "portfolio"}
          className={mode === "portfolio" ? "is-active" : ""}
          onClick={() => onSetMode("portfolio")}
        >
          Portfolio
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "pool"}
          className={mode === "pool" ? "is-active" : ""}
          onClick={() => onSetMode("pool")}
        >
          Pool
        </button>
      </div>

      <div className="builder-section-label">Filter</div>
      <ul className="builder-filter-list">
        <li>
          <button
            type="button"
            className={`builder-filter ${filter === "all" ? "is-active" : ""}`}
            onClick={() => onSetFilter("all")}
          >
            All <span className="builder-filter-count">{counts.all ?? 0}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`builder-filter ${filter === "uncategorized" ? "is-active" : ""}`}
            onClick={() => onSetFilter("uncategorized")}
          >
            Uncategorized{" "}
            <span className="builder-filter-count">{counts.uncategorized ?? 0}</span>
          </button>
        </li>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {categories.map((c) => (
              <SortableCategoryRow
                key={c.id}
                category={c}
                count={counts[c.id] ?? 0}
                isActive={filter === c.id}
                isEditing={editing === c.id}
                onSelect={() => onSetFilter(c.id)}
                onStartEdit={() => setEditing(c.id)}
                onCommitEdit={(label) => {
                  if (label && label !== c.label) onRenameCategory(c.id, label);
                  setEditing(null);
                }}
                onCancelEdit={() => setEditing(null)}
                onDelete={() => {
                  if (confirm(`Delete category "${c.label}"? Memberships will be removed.`)) {
                    onDeleteCategory(c.id);
                  }
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      </ul>

      <form
        className="builder-add-category"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = newLabel.trim();
          if (!trimmed) return;
          onAddCategory(trimmed);
          setNewLabel("");
        }}
      >
        <input
          type="text"
          placeholder="Add category…"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button type="submit" disabled={!newLabel.trim()}>
          Add
        </button>
      </form>
    </aside>
  );
}

interface RowProps {
  category: Category;
  count: number;
  isActive: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onCommitEdit: (label: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function SortableCategoryRow({
  category,
  count,
  isActive,
  isEditing,
  onSelect,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onDelete,
}: RowProps): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });
  return (
    <li
      ref={setNodeRef}
      className={`builder-filter-row ${isDragging ? "is-dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="builder-filter-grip"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      {isEditing ? (
        <input
          autoFocus
          className="builder-filter-edit"
          defaultValue={category.label}
          onBlur={(e) => onCommitEdit(e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") onCancelEdit();
          }}
        />
      ) : (
        <button
          type="button"
          className={`builder-filter ${isActive ? "is-active" : ""}`}
          onClick={onSelect}
          onDoubleClick={onStartEdit}
          title="Double-click to rename"
        >
          {category.label}{" "}
          <span className="builder-filter-count">{count}</span>
        </button>
      )}
      <button
        type="button"
        className="builder-filter-delete"
        aria-label={`Delete ${category.label}`}
        title={`Delete ${category.label}`}
        onClick={onDelete}
      >
        ×
      </button>
    </li>
  );
}
