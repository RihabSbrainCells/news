"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldAtlas from "world-atlas/countries-110m.json";
import { codeForAtlasName } from "../lib/worldAtlasNames";

// Three fixed tiers rather than a continuous scale: with a handful of
// published articles per country, a gradient would imply more precision
// than the data actually has. Tiers re-bucket cleanly as volume grows.
function tierFor(count) {
  if (!count) return "quiet";
  if (count <= 2) return "light";
  return "hot";
}

const TIER_FILL = {
  quiet: "var(--quiet)",
  light: "var(--trend)",
  hot: "var(--ember)",
};

export default function WorldMap({ countries, counts }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  const nameByCode = useMemo(() => new Map(countries.map((c) => [c.code, c.name])), [countries]);

  return (
    <div className="worldmap">
      <ComposableMap
        projectionConfig={{ scale: 148 }}
        width={800}
        height={420}
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label="World map. Countries are shaded by how much news coverage is currently published for them. Use the search above to find a country instead."
      >
        <Geographies geography={worldAtlas}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = codeForAtlasName(geo.properties.name);
              const count = code ? counts.get(code) || 0 : 0;
              const tier = code ? tierFor(count) : "unmapped";
              const name = code ? nameByCode.get(code) || geo.properties.name : geo.properties.name;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  tabIndex={code ? 0 : -1}
                  onClick={() => code && router.push(`/country/${code.toLowerCase()}`)}
                  onKeyDown={(e) => {
                    if (code && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      router.push(`/country/${code.toLowerCase()}`);
                    }
                  }}
                  onMouseEnter={() => code && setHovered({ name, count })}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    default: {
                      fill: code ? TIER_FILL[tier] : "var(--unmapped)",
                      stroke: "var(--paper)",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: code ? "pointer" : "default",
                    },
                    hover: {
                      fill: code ? "var(--country)" : "var(--unmapped)",
                      stroke: "var(--paper)",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: code ? "pointer" : "default",
                    },
                    pressed: {
                      fill: "var(--country)",
                      stroke: "var(--paper)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                  }}
                >
                  {code && <title>{name} — {count} {count === 1 ? "story" : "stories"}</title>}
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="worldmap__footer">
        <p className="worldmap__hint" aria-live="polite">
          {hovered ? `${hovered.name} · ${hovered.count} ${hovered.count === 1 ? "story" : "stories"}` : "Tap a country for its news."}
        </p>
        <ul className="worldmap__legend">
          <li><span className="worldmap__swatch" style={{ background: "var(--quiet)" }} /> No coverage yet</li>
          <li><span className="worldmap__swatch" style={{ background: "var(--trend)" }} /> Light coverage</li>
          <li><span className="worldmap__swatch" style={{ background: "var(--ember)" }} /> Heavy coverage</li>
        </ul>
      </div>
    </div>
  );
}
