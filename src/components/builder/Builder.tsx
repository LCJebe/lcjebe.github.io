// Portfolio builder root. Owns layout chrome (topbar, sidebar, main),
// composes the hook + the grid components. View mode (edit/preview) and
// filter mode (portfolio/pool) are local UI state — only the actual
// portfolio.json mutations go through usePortfolio.

import { useMemo, useState } from "react";
import ABCompare from "./ABCompare";
import CategorySidebar, { type Filter, type Mode } from "./CategorySidebar";
import EditorGrid from "./EditorGrid";
import PoolGrid from "./PoolGrid";
import RenderSettings from "./RenderSettings";
import { usePortfolio } from "./usePortfolio";

export default function Builder(): React.ReactElement {
  const p = usePortfolio();
  const [mode, setMode] = useState<Mode>("portfolio");
  const [filter, setFilter] = useState<Filter>("all");
  const [isPreview, setIsPreview] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  // Vocab for "is this AI suggestion already promoted?" check.
  const vocabSet = useMemo(
    () => new Set(p.portfolio.categories.map((c) => c.id)),
    [p.portfolio.categories],
  );
  const photoById = useMemo(
    () => new Map(p.photos.map((x) => [x.id, x])),
    [p.photos],
  );
  const portfolioSet = useMemo(
    () => new Set(p.portfolio.order),
    [p.portfolio.order],
  );

  const orderedPhotos = useMemo(
    () =>
      p.portfolio.order
        .map((id) => photoById.get(id))
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [p.portfolio.order, photoById],
  );

  const poolPhotos = useMemo(
    () => p.photos.filter((x) => !portfolioSet.has(x.id)),
    [p.photos, portfolioSet],
  );

  const membershipsOf = (photoId: string): string[] =>
    p.portfolio.photo_categories[photoId] ?? [];

  // Suggestions = AI-suggested categories that the user hasn't yet promoted
  // into the canonical vocab. Show as "+x" chips you can promote.
  const suggestedNewOf = (photoId: string): string[] => {
    const photo = photoById.get(photoId);
    if (!photo) return [];
    const seen = new Set([
      ...vocabSet,
      ...(p.portfolio.photo_categories[photoId] ?? []),
    ]);
    const all = [...photo.ai_suggested_categories, ...photo.ai_categories];
    return Array.from(new Set(all.filter((s) => !seen.has(s))));
  };

  // Filter selection is applied to the active mode's pool of photos. When a
  // single category is selected and that category has an explicit
  // `category_orders` entry, the in-category sequence honors that order —
  // and any newly-toggled members not yet placed in the explicit order are
  // appended at the end (matching the loader's resolution).
  const filteredPhotos = useMemo(() => {
    const source = mode === "portfolio" ? orderedPhotos : poolPhotos;
    if (filter === "all") return source;
    if (filter === "uncategorized") {
      return source.filter((ph) => membershipsOf(ph.id).length === 0);
    }
    const inCat = source.filter((ph) => membershipsOf(ph.id).includes(filter));
    const explicit = p.portfolio.category_orders[filter];
    if (!explicit) return inCat;
    const inCatById = new Map(inCat.map((ph) => [ph.id, ph]));
    const ordered: typeof inCat = [];
    const seen = new Set<string>();
    for (const id of explicit) {
      const ph = inCatById.get(id);
      if (ph && !seen.has(id)) {
        ordered.push(ph);
        seen.add(id);
      }
    }
    for (const ph of inCat) {
      if (!seen.has(ph.id)) ordered.push(ph);
    }
    return ordered;
  }, [mode, orderedPhotos, poolPhotos, filter, p.portfolio.photo_categories, p.portfolio.category_orders]);

  // Counts per filter for sidebar badges. Computed against the active mode's
  // source so they reflect what the user would see if they clicked.
  const counts = useMemo(() => {
    const source = mode === "portfolio" ? orderedPhotos : poolPhotos;
    const out: Record<string, number> = {
      all: source.length,
      uncategorized: source.filter((ph) => membershipsOf(ph.id).length === 0).length,
    };
    for (const c of p.portfolio.categories) {
      out[c.id] = source.filter((ph) => membershipsOf(ph.id).includes(c.id)).length;
    }
    return out;
  }, [mode, orderedPhotos, poolPhotos, p.portfolio.categories, p.portfolio.photo_categories]);

  // Reset filter to "all" when categories change in a way that orphans it.
  if (
    filter !== "all" &&
    filter !== "uncategorized" &&
    !p.portfolio.categories.some((c) => c.id === filter)
  ) {
    setFilter("all");
  }

  if (p.loading) return <p>Loading…</p>;
  if (p.error) return <p style={{ color: "salmon" }}>Failed: {p.error}</p>;

  const handleSave = async () => {
    try {
      await p.save();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Save failed:\n${msg}`);
    }
  };

  return (
    <div className="builder-shell">
      <div className="builder-topbar">
        <h1>Portfolio builder</h1>
        <span className="builder-status">
          {p.saving ? "saving…" : p.dirty ? "● unsaved" : "✓ saved"}
        </span>
        <span className="builder-spacer" />
        <button
          type="button"
          className={`builder-toggle-btn ${isPreview ? "is-active" : ""}`}
          aria-pressed={isPreview}
          onClick={() => setIsPreview((v) => !v)}
          title="Toggle preview (hide editing chrome)"
        >
          Preview
        </button>
        <button
          type="button"
          className={`builder-toggle-btn ${settingsOpen ? "is-active" : ""}`}
          onClick={() => setSettingsOpen((v) => !v)}
          title="Render settings"
        >
          ⚙
        </button>
        <button
          type="button"
          className="builder-save"
          onClick={handleSave}
          disabled={!p.dirty || p.saving}
        >
          {p.saving ? "Saving…" : "Save"}
        </button>
      </div>

      {settingsOpen && (
        <RenderSettings
          render={p.portfolio.render}
          onChange={p.setRender}
          onOpenCompare={() => setCompareOpen(true)}
        />
      )}

      {compareOpen && p.portfolio.order.length > 0 && (
        <ABCompare
          photos={p.photos}
          defaultPhotoId={p.portfolio.order[0]}
          render={p.portfolio.render}
          onClose={() => setCompareOpen(false)}
          onAssignTile={(f, s) =>
            p.setRender({ ...p.portfolio.render, tile_format: f, tile_size: s })
          }
          onAssignLightbox={(f, s) =>
            p.setRender({
              ...p.portfolio.render,
              lightbox_format: f,
              lightbox_size: s,
            })
          }
        />
      )}

      <CategorySidebar
        mode={mode}
        filter={filter}
        categories={p.portfolio.categories}
        counts={counts}
        onSetMode={(m) => {
          setMode(m);
          setFilter("all");
        }}
        onSetFilter={setFilter}
        onAddCategory={(label) => p.addCategory(label)}
        onRenameCategory={p.renameCategory}
        onDeleteCategory={p.deleteCategory}
        onSetCategoryOrder={p.setCategoryOrder}
      />

      <main className="builder-main">
        {mode === "portfolio" ? (
          <EditorGrid
            orderedPhotos={filteredPhotos}
            fullOrder={p.portfolio.order}
            allCategories={p.portfolio.categories}
            vocabSet={vocabSet}
            render={p.portfolio.render}
            isPreview={isPreview}
            membershipsOf={membershipsOf}
            suggestedNewOf={suggestedNewOf}
            activeCategoryFilter={
              filter !== "all" && filter !== "uncategorized" ? filter : null
            }
            onSetOrder={p.setOrder}
            onSetCategoryPhotoOrder={p.setCategoryPhotoOrder}
            onToggleCategory={p.togglePhotoCategory}
            onPromoteSuggestion={p.promoteSuggestion}
            onRemoveFromPortfolio={p.removeFromPortfolio}
          />
        ) : (
          <PoolGrid
            poolPhotos={filteredPhotos}
            allCategories={p.portfolio.categories}
            render={p.portfolio.render}
            membershipsOf={membershipsOf}
            suggestedNewOf={suggestedNewOf}
            onToggleCategory={p.togglePhotoCategory}
            onPromoteSuggestion={p.promoteSuggestion}
            onAddToPortfolio={p.addToPortfolio}
          />
        )}
      </main>
    </div>
  );
}
