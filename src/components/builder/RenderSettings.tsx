// Tile + lightbox size/format pickers. Mutates portfolio.render — Preview
// mode reflects changes immediately, and the live site picks them up on
// next save + page reload.

import type { Format, Render, Size } from "~/data/schema";

const SIZES: Size[] = ["270", "540", "1k", "full"];
const FORMATS: Format[] = ["sdr_webp", "hdr_jpg"];

interface Props {
  render: Render;
  onChange: (render: Render) => void;
  onOpenCompare: () => void;
}

export default function RenderSettings({
  render,
  onChange,
  onOpenCompare,
}: Props): React.ReactElement {
  const update = (patch: Partial<Render>) => onChange({ ...render, ...patch });
  return (
    <div className="builder-render-settings">
      <div className="builder-render-row">
        <span className="builder-render-label">Tile</span>
        <select
          value={render.tile_format}
          onChange={(e) => update({ tile_format: e.target.value as Format })}
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          value={render.tile_size}
          onChange={(e) => update({ tile_size: e.target.value as Size })}
        >
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="builder-render-row">
        <span className="builder-render-label">Lightbox</span>
        <select
          value={render.lightbox_format}
          onChange={(e) => update({ lightbox_format: e.target.value as Format })}
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          value={render.lightbox_size}
          onChange={(e) => update({ lightbox_size: e.target.value as Size })}
        >
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="builder-render-compare"
        onClick={onOpenCompare}
      >
        Compare A/B…
      </button>
    </div>
  );
}
