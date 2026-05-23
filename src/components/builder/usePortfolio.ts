// State + persistence for the builder.
//
// On mount: fetches photos.json (immutable catalog) and portfolio.json (the
// editable layout). Mutations all run through `mutate()` which sets a dirty
// flag. `save()` POSTs to /__builder/save (handled by the Vite plugin).

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Photo,
  PhotosFile,
  Portfolio,
  Render,
} from "~/data/schema";

interface State {
  loading: boolean;
  error: string | null;
  photos: Photo[];
  portfolio: Portfolio;
  dirty: boolean;
  saving: boolean;
}

const EMPTY_PORTFOLIO: Portfolio = {
  version: 1,
  categories: [],
  order: [],
  photo_categories: {},
  category_orders: {},
  render: {
    tile_size: "540",
    tile_format: "sdr_webp",
    lightbox_size: "1k",
    lightbox_format: "hdr_jpg",
  },
};

export interface UsePortfolio extends State {
  setOrder: (order: string[]) => void;
  setCategoryOrder: (categoryIds: string[]) => void;
  /** Set the photo order within a single category. Persisted to
   *  `category_orders[categoryId]`. Use this when the user drags photos
   *  while filtered to a single category. */
  setCategoryPhotoOrder: (categoryId: string, order: string[]) => void;
  togglePhotoCategory: (photoId: string, categoryId: string) => void;
  addCategory: (label: string, customId?: string) => string;
  renameCategory: (id: string, label: string) => void;
  deleteCategory: (id: string) => void;
  removeFromPortfolio: (photoId: string) => void;
  addToPortfolio: (photoId: string) => void;
  promoteSuggestion: (photoId: string, label: string) => void;
  setRender: (render: Render) => void;
  save: () => Promise<void>;
}

export function usePortfolio(): UsePortfolio {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    photos: [],
    portfolio: EMPTY_PORTFOLIO,
    dirty: false,
    saving: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [photosRes, portfolioRes] = await Promise.all([
          fetch("/src/data/photos.json"),
          fetch("/src/data/portfolio.json"),
        ]);
        const photosFile = (await photosRes.json()) as PhotosFile;
        const portfolioRaw = (await portfolioRes.json()) as Partial<Portfolio>;
        if (cancelled) return;
        // Defaults for optional/new fields. The Zod schema applies these at
        // parse time, but the builder consumes the raw JSON to avoid bundling
        // zod into the client — so we mirror the defaults here. Keep in sync
        // with PortfolioSchema in src/data/schema.ts.
        const portfolio: Portfolio = {
          ...(portfolioRaw as Portfolio),
          category_orders: portfolioRaw.category_orders ?? {},
        };
        setState((s) => ({
          ...s,
          loading: false,
          photos: photosFile.photos,
          portfolio,
        }));
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setState((s) => ({ ...s, loading: false, error: message }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = useCallback((fn: (p: Portfolio) => Portfolio) => {
    setState((s) => ({ ...s, portfolio: fn(s.portfolio), dirty: true }));
  }, []);

  const setOrder = useCallback(
    (order: string[]) => mutate((p) => ({ ...p, order })),
    [mutate],
  );

  const setCategoryPhotoOrder = useCallback(
    (categoryId: string, order: string[]) =>
      mutate((p) => ({
        ...p,
        category_orders: { ...p.category_orders, [categoryId]: order },
      })),
    [mutate],
  );

  const setCategoryOrder = useCallback(
    (categoryIds: string[]) =>
      mutate((p) => {
        const byId = new Map(p.categories.map((c) => [c.id, c]));
        const reordered = categoryIds
          .map((id) => byId.get(id))
          .filter((c): c is NonNullable<typeof c> => Boolean(c));
        // Preserve any categories not in the reorder list (defensive).
        const remaining = p.categories.filter((c) => !categoryIds.includes(c.id));
        return { ...p, categories: [...reordered, ...remaining] };
      }),
    [mutate],
  );

  const togglePhotoCategory = useCallback(
    (photoId: string, categoryId: string) =>
      mutate((p) => {
        const cur = p.photo_categories[photoId] ?? [];
        const isAdding = !cur.includes(categoryId);
        const next = isAdding
          ? [...cur, categoryId]
          : cur.filter((c) => c !== categoryId);
        // Keep `category_orders[categoryId]` in sync with the membership
        // change. Only touch the per-category order if an explicit one
        // exists — otherwise the loader still derives the right order on
        // its own from `order` + memberships.
        const catOrders = { ...p.category_orders };
        const existing = catOrders[categoryId];
        if (existing) {
          if (isAdding && !existing.includes(photoId)) {
            catOrders[categoryId] = [...existing, photoId];
          } else if (!isAdding) {
            catOrders[categoryId] = existing.filter((id) => id !== photoId);
          }
        }
        return {
          ...p,
          photo_categories: { ...p.photo_categories, [photoId]: next },
          category_orders: catOrders,
        };
      }),
    [mutate],
  );

  const addCategory = useCallback(
    (label: string, customId?: string): string => {
      const id = customId ?? slugify(label);
      mutate((p) => {
        if (p.categories.some((c) => c.id === id)) return p;
        return { ...p, categories: [...p.categories, { id, label }] };
      });
      return id;
    },
    [mutate],
  );

  const renameCategory = useCallback(
    (id: string, label: string) =>
      mutate((p) => ({
        ...p,
        categories: p.categories.map((c) => (c.id === id ? { ...c, label } : c)),
      })),
    [mutate],
  );

  const deleteCategory = useCallback(
    (id: string) =>
      mutate((p) => {
        const photo_categories = Object.fromEntries(
          Object.entries(p.photo_categories).map(([k, v]) => [
            k,
            v.filter((c) => c !== id),
          ]),
        );
        const { [id]: _dropped, ...category_orders } = p.category_orders;
        void _dropped;
        return {
          ...p,
          categories: p.categories.filter((c) => c.id !== id),
          photo_categories,
          category_orders,
        };
      }),
    [mutate],
  );

  const removeFromPortfolio = useCallback(
    (photoId: string) =>
      mutate((p) => {
        // A photo leaving the portfolio also leaves every per-category order
        // it was placed in — otherwise stale ids would accumulate and the
        // loader's defensive prune would silently mask the drift.
        const category_orders = Object.fromEntries(
          Object.entries(p.category_orders).map(([k, v]) => [
            k,
            v.filter((id) => id !== photoId),
          ]),
        );
        return {
          ...p,
          order: p.order.filter((id) => id !== photoId),
          category_orders,
        };
      }),
    [mutate],
  );

  const addToPortfolio = useCallback(
    (photoId: string) =>
      mutate((p) => {
        if (p.order.includes(photoId)) return p;
        return { ...p, order: [...p.order, photoId] };
      }),
    [mutate],
  );

  const promoteSuggestion = useCallback(
    (photoId: string, label: string) =>
      mutate((p) => {
        const id = slugify(label);
        const categories = p.categories.some((c) => c.id === id)
          ? p.categories
          : [...p.categories, { id, label }];
        const cur = p.photo_categories[photoId] ?? [];
        const wasMember = cur.includes(id);
        const memberships = wasMember ? cur : [...cur, id];
        // Mirror the togglePhotoCategory invariant: keep the per-category
        // order in sync iff it exists explicitly.
        const catOrders = { ...p.category_orders };
        const existing = catOrders[id];
        if (existing && !wasMember && !existing.includes(photoId)) {
          catOrders[id] = [...existing, photoId];
        }
        return {
          ...p,
          categories,
          photo_categories: { ...p.photo_categories, [photoId]: memberships },
          category_orders: catOrders,
        };
      }),
    [mutate],
  );

  const setRender = useCallback(
    (render: Render) => mutate((p) => ({ ...p, render })),
    [mutate],
  );

  const save = useCallback(async () => {
    // Capture the exact state we're sending so we can detect concurrent edits
    // when the request completes. If the user mutates during the in-flight
    // POST, we keep `dirty` true so the autosave effect schedules another
    // round; otherwise the freshly-saved state would silently overwrite their
    // newer local edits.
    const sentPortfolio = state.portfolio;
    setState((s) => ({ ...s, saving: true }));
    try {
      const res = await fetch("/__builder/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sentPortfolio),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `save failed (${res.status})`);
      }
      // Don't replace state.portfolio with the server's response — equal
      // values + new reference would invalidate every downstream useMemo,
      // forcing every tile to rerender, which closes open <select> menus
      // and causes flicker. We trust local state; the server validates.
      setState((s) => ({
        ...s,
        dirty: s.portfolio !== sentPortfolio,
        saving: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, saving: false }));
      throw e;
    }
  }, [state.portfolio]);

  // Autosave: debounce saves so rapid edits (typing a category name, dragging
  // through several positions) coalesce into one POST. Fires 1s after the
  // last mutation. The manual Save button still works for "save now".
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (state.loading || !state.dirty || state.saving) return;
    const t = setTimeout(() => {
      saveRef.current().catch((e) => console.error("autosave failed:", e));
    }, 1000);
    return () => clearTimeout(t);
  }, [state.portfolio, state.dirty, state.loading, state.saving]);

  return {
    ...state,
    setOrder,
    setCategoryOrder,
    setCategoryPhotoOrder,
    togglePhotoCategory,
    addCategory,
    renameCategory,
    deleteCategory,
    removeFromPortfolio,
    addToPortfolio,
    promoteSuggestion,
    setRender,
    save,
  };
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
