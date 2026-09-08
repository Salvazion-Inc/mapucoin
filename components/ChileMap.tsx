"use client";

import {
  destinationsByLandscape,
  formatCLP,
  landscapes,
  mapPoints,
  type Landscape,
} from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { mapTiles } from "@/lib/map-tiles";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";

type KindFilter = "place" | "capsule" | "all";

function pinHtml(kind: "place" | "capsule") {
  const color = kind === "capsule" ? "#d4af37" : "#c45c26";
  return `<div style="width:28px;height:28px;border-radius:999px;background:${color};border:3px solid #f4e8d0;box-shadow:0 4px 12px rgba(44,24,16,.35)"></div>`;
}

export default function ChileMap({
  focusSlug,
  height = "70vh",
}: {
  focusSlug?: string;
  height?: string;
}) {
  const { locale } = useLocale();
  const c = t(locale);
  const [filter, setFilter] = useState<KindFilter>("place");
  const [land, setLand] = useState<Landscape | "all">("all");
  const points = useMemo(() => {
    let all = mapPoints();
    if (filter !== "all") all = all.filter((p) => p.group === filter);
    if (land !== "all") {
      all = all.filter((p) => p.landscapes?.includes(land));
    }
    return all;
  }, [filter, land]);

  const listed = useMemo(
    () => destinationsByLandscape(land),
    [land],
  );

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
      maxZoom: tiles.maxZoom,
    }).addTo(map);
    if (tiles.labelsUrl) {
      L.tileLayer(tiles.labelsUrl, {
        maxZoom: tiles.maxZoom,
        opacity: 0.9,
      }).addTo(map);
    }

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
      const shown = localizeItem(p, locale);
      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px">
            <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#d4af37;margin:0">${p.group === "capsule" ? c.map.capsule : c.map.destination}</p>
            <strong style="font-size:15px;color:#f3e6cc">${shown.name}</strong>
            <p style="margin:6px 0 8px;color:#f3e6cc;font-size:13px;opacity:.8">${shown.tagline}</p>
            <p style="margin:0;font-size:13px;color:#d4af37">${c.from} ${formatCLP(p.priceFromCLP)}</p>
            <a href="${href}" style="display:inline-block;margin-top:8px;color:#d4af37;font-weight:600">${c.map.viewSheet}</a>
          </div>`,
        );
      markers.push(marker);
      if (focusSlug && p.slug === focusSlug) {
        map.setView([p.lat, p.lng], 9);
        marker.openPopup();
      }
    }

    const mainland = points.filter(
      (p) => p.lng > -78.5 && p.lat > -56 && p.lat < -17,
    );
    const fit = mainland.length ? mainland : points;
    if (fit.length) {
      map.fitBounds(
        L.latLngBounds(fit.map((p) => [p.lat, p.lng] as [number, number])),
        { padding: [40, 40], maxZoom: focusSlug ? 9 : 6 },
      );
    }

    return () => {
      map.remove();
    };
  }, [points, focusSlug, locale, c.from, c.map.capsule, c.map.destination, c.map.viewSheet]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {landscapes.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLand((v) => (v === l.id ? "all" : l.id))}
            className={`rounded-full px-4 py-1.5 text-sm ${
              land === l.id
                ? "bg-gold text-black"
                : "border border-gold/30 text-sand"
            }`}
          >
            {c.landscapes[l.id]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setLand("all")}
          className={`rounded-full px-4 py-1.5 text-sm ${
            land === "all"
              ? "bg-gold text-black"
              : "border border-gold/30 text-sand"
          }`}
        >
          {c.map.all}
        </button>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(
          [
            ["place", c.map.places],
            ["capsule", c.map.capsules],
            ["all", c.map.both],
          ] as [KindFilter, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1 text-xs ${
              filter === id
                ? "bg-sand text-night"
                : "border border-gold/20 text-sand/70"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="self-center text-xs text-sand/50">
          {c.map.legend}
          {land !== "all" ? ` · ${c.landscapes[land]}` : ""}
          {` · ${points.length}`}
        </span>
      </div>
      <div
        id="mapucoin-map"
        className="overflow-hidden rounded-3xl border border-gold/15"
        style={{ height }}
      />
      {land !== "all" && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {listed.map((d) => (
            <li key={d.slug}>
              <a
                href={`/destinos/${d.slug}`}
                className="inline-block rounded-full border border-gold/25 px-3 py-1 text-xs text-sand/80 hover:border-gold hover:text-gold"
              >
                {d.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
