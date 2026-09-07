"use client";

import { formatCLP, mapPoints } from "@/lib/catalog";
import { mapTiles } from "@/lib/map-tiles";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";


type Filter = "all" | "place" | "capsule";

function pinHtml(kind: "place" | "capsule") {
  const color = kind === "capsule" ? "#c9a227" : "#c45c26";
  return `<div style="width:28px;height:28px;border-radius:999px;background:${color};border:3px solid #f4e8d0;box-shadow:0 4px 12px rgba(44,24,16,.35)"></div>`;
}

export default function ChileMap({
  focusSlug,
  height = "70vh",
}: {
  focusSlug?: string;
  height?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const points = useMemo(() => {
    const all = mapPoints();
    return filter === "all" ? all : all.filter((p) => p.group === filter);
  }, [filter]);

  useEffect(() => {
    const el = document.getElementById("mapucoin-map");
    if (!el) return;

    const tiles = mapTiles();
    const map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([-35.5, -71.3] as LatLngExpression, 5);

    L.tileLayer(tiles.url, {
      attribution: tiles.attribution,
      subdomains: tiles.subdomains,
      maxZoom: tiles.maxZoom,
    }).addTo(map);

    const markers: L.Marker[] = [];
    for (const p of points) {
      const icon = L.divIcon({
        className: "map-pin",
        html: pinHtml(p.group),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const href =
        p.group === "capsule" ? `/capsulas/${p.slug}` : `/destinos/${p.slug}`;
      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px">
            <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c45c26;margin:0">${p.group === "capsule" ? "Cápsula" : "Destino"}</p>
            <strong style="font-size:15px">${p.name}</strong>
            <p style="margin:6px 0 8px;color:#4a2c1a;font-size:13px">${p.tagline}</p>
            <p style="margin:0;font-size:13px;color:#c45c26">desde ${formatCLP(p.priceFromCLP)}</p>
            <a href="${href}" style="display:inline-block;margin-top:8px;color:#2c1810;font-weight:600">Ver ficha →</a>
          </div>`,
        );
      marker.on("click", () => {
        /* popup handles navigation */
      });
      markers.push(marker);
      if (focusSlug && p.slug === focusSlug) {
        map.setView([p.lat, p.lng], 9);
        marker.openPopup();
      }
    }

    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [40, 40], maxZoom: focusSlug ? 9 : 6 },
    );

    return () => {
      map.remove();
    };
  }, [points, focusSlug]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["all", "Todo"],
            ["place", "Destinos"],
            ["capsule", "Cápsulas"],
          ] as [Filter, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === id ? "bg-earth text-sand" : "bg-sand text-bark"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="self-center text-xs text-bark/60">
          Terracota: destinos · Oro: cápsulas
        </span>
      </div>
      <div
        id="mapucoin-map"
        className="overflow-hidden rounded-3xl border border-earth/10"
        style={{ height }}
      />
    </div>
  );
}
