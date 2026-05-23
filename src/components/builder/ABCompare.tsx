// A/B compare overlay. Pick a photo, see it rendered at every (format × size)
// combo with byte size from R2. Click a cell to assign as tile or lightbox.
//
// File sizes come from a HEAD request to the R2 CDN — the response's
// Content-Length is the wire size of the asset. HEAD is cheap (no body).

import { useEffect, useMemo, useState } from "react";
import type { Format, Photo, Render, Size } from "~/data/schema";
import { photoUrl } from "~/lib/photoUrl";

const SIZES: Size[] = ["270", "540", "1k", "full"];
const FORMATS: Format[] = ["sdr_webp", "hdr_jpg"];

interface Props {
  photos: Photo[];
  /** Default photo to show — typically the first in the order. */
  defaultPhotoId: string;
  render: Render;
  onClose: () => void;
  onAssignTile: (format: Format, size: Size) => void;
  onAssignLightbox: (format: Format, size: Size) => void;
}

export default function ABCompare({
  photos,
  defaultPhotoId,
  render,
  onClose,
  onAssignTile,
  onAssignLightbox,
}: Props): React.ReactElement {
  const [photoId, setPhotoId] = useState(defaultPhotoId);
  const photo = useMemo(
    () => photos.find((p) => p.id === photoId) ?? photos[0],
    [photos, photoId],
  );
  const [sizes, setSizes] = useState<Map<string, number | "err">>(new Map());

  // Whenever the chosen photo changes, refetch byte sizes for all 8 combos.
  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    setSizes(new Map());
    (async () => {
      const entries = await Promise.all(
        FORMATS.flatMap((f) =>
          SIZES.map(async (s) => {
            const url = photoUrl(photo.id, f, s);
            try {
              const res = await fetch(url, { method: "HEAD" });
              const len = res.headers.get("content-length");
              return [`${f}_${s}`, len ? Number(len) : ("err" as const)] as const;
            } catch {
              return [`${f}_${s}`, "err" as const] as const;
            }
          }),
        ),
      );
      if (!cancelled) setSizes(new Map(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [photo?.id]);

  if (!photo) return <div />;

  return (
    <div
      className="builder-ab-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="builder-ab-modal" role="dialog" aria-label="A/B compare">
        <div className="builder-ab-header">
          <strong>A/B compare</strong>
          <select
            value={photo.id}
            onChange={(e) => setPhotoId(e.target.value)}
          >
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>
          <span className="builder-spacer" />
          <button type="button" onClick={onClose} className="builder-ab-close">
            ×
          </button>
        </div>
        <div className="builder-ab-grid">
          {FORMATS.flatMap((f) =>
            SIZES.map((s) => {
              const key = `${f}_${s}`;
              const bytes = sizes.get(key);
              const isTile = render.tile_format === f && render.tile_size === s;
              const isLightbox =
                render.lightbox_format === f && render.lightbox_size === s;
              return (
                <div
                  key={key}
                  className={`builder-ab-cell ${isTile ? "is-tile" : ""} ${
                    isLightbox ? "is-lightbox" : ""
                  }`}
                >
                  <div className="builder-ab-cell-img">
                    <img
                      src={photoUrl(photo.id, f, s)}
                      alt={`${f} ${s}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="builder-ab-cell-meta">
                    <code>{key}</code>
                    <span className="builder-ab-cell-bytes">
                      {bytes === undefined
                        ? "…"
                        : bytes === "err"
                          ? "—"
                          : formatBytes(bytes)}
                    </span>
                  </div>
                  <div className="builder-ab-cell-actions">
                    <button type="button" onClick={() => onAssignTile(f, s)}>
                      Use as tile
                    </button>
                    <button
                      type="button"
                      onClick={() => onAssignLightbox(f, s)}
                    >
                      Use as lightbox
                    </button>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
