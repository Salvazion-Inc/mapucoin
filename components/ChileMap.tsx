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
import type { PublicPartner } from "@/lib/partners";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type CatalogPoint = ReturnType<typeof mapPoints>[number];
type PartnerPoint = {
  slug: string;
  name: string;
  city: string;
  region: string;
  tagline: string;
  lat: number;
  lng: number;
  priceFromCLP: number;
  landscapes?: Landscape[];
  group: "partner";
  href: string;
};
type MapPoint = (CatalogPoint & { href?: string }) | PartnerPoint;

function partnerHref(slug: string, catalog: CatalogPoint[]) {
  const cat = catalog.find((p) => p.slug === slug);
  if (cat?.group === "capsule") return `/capsulas/${slug}`;
  if (cat?.group === "place") return `/destinos/${slug}`;
  return `/partners/${slug}`;
}

function toPartnerPoint(p: PublicPartner, catalog: CatalogPoint[]): PartnerPoint {
  const cat = catalog.find((c) => c.slug === p.slug);
  return {
    slug: p.slug,
    name: p.business,
    city: p.city,
    region: cat?.region || "",
    tagline: p.offer_summary,
    lat: p.lat,
    lng: p.lng,
    priceFromCLP: p.price_from_clp,
    landscapes: p.landscape ? [p.landscape] : cat?.landscapes,
    group: "partner",
    href: partnerHref(p.slug, catalog),
  };
}

const PIN_SIZE = 36;

function pinHtml() {
  return `<div class="map-pin-mark"><img src="/logo-mark.png" alt="Mapucoin" width="${PIN_SIZE}" height="${PIN_SIZE}" /></div>`;
}

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pointKey(p: Pick<MapPoint, "group" | "slug">) {
  return `${p.group}:${p.slug}`;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
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
  const [land, setLand] = useState<Landscape | "all">("all");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [partners, setPartners] = useState<PublicPartner[] | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const searchFocusRef = useRef<string | null>(null);
  const catalog = useMemo(() => mapPoints(), []);
  const merged = useMemo(() => {
    const taken = new Set(catalog.map((p) => p.slug));
    const extra = (partners || [])
      .filter((p) => !taken.has(p.slug))
      .map((p) => toPartnerPoint(p, catalog));
    return [...catalog, ...extra] as MapPoint[];
  }, [catalog, partners]);
  const points = useMemo(() => {
    if (land === "all") return merged;
    return merged.filter((p) => p.landscapes?.includes(land));
  }, [merged, land]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/partners/approved")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.partners) ? data.partners : [];
        setPartners(list);
      })
      .catch(() => {
        if (!cancelled) setPartners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const listed = useMemo(
    () => destinationsByLandscape(land),
    [land],
  );

  function displayOf(p: MapPoint) {
    if (p.group === "partner") return p;
    return localizeItem(p, locale);
  }

  function groupLabel(group: MapPoint["group"]) {
    if (group === "capsule") return c.map.capsule;
    if (group === "partner") return c.map.partner;
    return c.map.destination;
  }

  const hits = useMemo(() => {
    const q = fold(query);
    if (!q) return [];
    return merged
      .map((p) => {
        const shown = displayOf(p);
        const hay = fold(
          [
            shown.name,
            shown.city,
            shown.region,
            shown.tagline,
            p.slug.replace(/-/g, " "),
            ...(p.landscapes ?? []).map((id) => c.landscapes[id]),
          ].join(" "),
        );
        const name = fold(shown.name);
        const rank = name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3;
        return { p, shown, hay, rank };
      })
      .filter((x) => x.hay.includes(q))
      .sort((a, b) => a.rank - b.rank || a.shown.name.localeCompare(b.shown.name, locale))
      .slice(0, 8);
  }, [merged, query, locale, c.landscapes]);

  function flyToKey(key: string) {
    const map = mapRef.current;
    const marker = markersRef.current.get(key);
    if (!map || !marker) return false;
    map.setView(marker.getLatLng(), 9);
    marker.openPopup();
    return true;
  }

  function selectPoint(p: MapPoint) {
    const shown = displayOf(p);
    const key = pointKey(p);
    setQuery(shown.name);
    setMenuOpen(false);
    setActive(0);
    searchFocusRef.current = key;
    const visible = land === "all" || Boolean(p.landscapes?.includes(land));
    if (visible && flyToKey(key)) {
      searchFocusRef.current = null;
      return;
    }
    setLand("all");
  }

  function onSearchKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setMenuOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMenuOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      const hit = hits[active] ?? hits[0];
      if (hit) {
        e.preventDefault();
        selectPoint(hit.p);
      }
    }
  }

  useEffect(() => {
    const el = mapEl.current;
    if (!el) return;

    const tiles = mapTiles();
    const map = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView([-35.5, -71.3] as LatLngExpression, 5);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    mapRef.current = map;

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

    const byKey = new Map<string, L.Marker>();
    let focusMarker: L.Marker | undefined;
    for (const p of points) {
      const icon = L.divIcon({
        className: "map-pin",
        html: pinHtml(),
        iconSize: [PIN_SIZE, PIN_SIZE],
        iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
      });
      const href =
        p.group === "partner"
          ? p.href
          : p.group === "capsule"
            ? `/capsulas/${p.slug}`
            : `/destinos/${p.slug}`;
      const shown = displayOf(p);
      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px">
            <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#d4af37;margin:0">${groupLabel(p.group)}</p>
            <strong style="font-size:15px;color:#f3e6cc">${shown.name}</strong>
            <p style="margin:6px 0 8px;color:#f3e6cc;font-size:13px;opacity:.8">${shown.tagline}</p>
            <p style="margin:0;font-size:13px;color:#d4af37">${c.from} ${formatCLP(p.priceFromCLP)}</p>
            <a href="${href}" style="display:inline-block;margin-top:8px;color:#d4af37;font-weight:600">${c.map.viewSheet}</a>
          </div>`,
          {
            className: "mapucoin-popup",
            autoPanPaddingTopLeft: [16, 72],
            autoPanPaddingBottomRight: [16, 40],
          },
        );
      const key = pointKey(p);
      byKey.set(key, marker);
      if (focusSlug && p.slug === focusSlug) focusMarker = marker;
    }
    markersRef.current = byKey;

    const want = searchFocusRef.current;
    const flew = Boolean(want && flyToKey(want));
    if (flew) searchFocusRef.current = null;

    const mainland = points.filter(
      (p) => p.lng > -78.5 && p.lat > -56 && p.lat < -17,
    );
    const fit = mainland.length ? mainland : points;
    if (flew) {
      // Search already zoomed to the selected pin.
    } else if (focusMarker) {
      map.setView(focusMarker.getLatLng(), 9);
      focusMarker.openPopup();
    } else if (fit.length) {
      map.fitBounds(
        L.latLngBounds(fit.map((p) => [p.lat, p.lng] as [number, number])),
        { padding: [40, 40], maxZoom: 6 },
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = new Map();
    };
  }, [points, focusSlug, locale, c.from, c.map.capsule, c.map.destination, c.map.partner, c.map.viewSheet]);

  useEffect(() => {
    const box = searchRef.current;
    if (!box) return;
    L.DomEvent.disableClickPropagation(box);
    L.DomEvent.disableScrollPropagation(box);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const showMenu = menuOpen && fold(query).length > 0;

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
      <div className="relative overflow-hidden rounded-3xl border border-gold/15">
        <div
          ref={searchRef}
          className="absolute top-3 right-3 left-3 z-[1100] sm:left-auto sm:w-[22rem]"
        >
          <label className="relative block">
            <span className="sr-only">{c.map.search}</span>
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gold">
              <SearchIcon />
            </span>
            <input
              type="text"
              inputMode="search"
              value={query}
              placeholder={c.map.search}
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={showMenu}
              aria-controls="map-search-results"
              aria-autocomplete="list"
              className="w-full rounded-full border border-gold/35 bg-black py-2.5 pr-10 pl-10 text-sm text-sand shadow-[0_8px_24px_rgba(0,0,0,0.45)] placeholder:text-sand/40"
              onChange={(e) => {
                setQuery(e.target.value);
                setMenuOpen(true);
                setActive(0);
              }}
              onFocus={() => {
                if (fold(query)) setMenuOpen(true);
              }}
              onKeyDown={onSearchKey}
            />
            {query ? (
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center rounded-full px-2 text-sand/50 hover:text-gold"
                aria-label={c.map.searchClear}
                onClick={() => {
                  setQuery("");
                  setMenuOpen(false);
                }}
              >
                ×
              </button>
            ) : null}
          </label>
          {showMenu ? (
            <ul
              id="map-search-results"
              role="listbox"
              className="mt-1.5 max-h-72 overflow-auto rounded-2xl border border-gold/25 bg-black py-1 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
            >
              {hits.length === 0 ? (
                <li className="px-3.5 py-2.5 text-sm text-sand/55">
                  {c.map.searchEmpty}
                </li>
              ) : (
                hits.map((hit, i) => (
                  <li key={pointKey(hit.p)} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      className={`flex w-full flex-col items-start px-3.5 py-2 text-left ${
                        i === active ? "bg-gold/15" : "hover:bg-gold/10"
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => selectPoint(hit.p)}
                    >
                      <span className="text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">
                        {groupLabel(hit.p.group)}
                      </span>
                      <span className="text-sm text-sand">{hit.shown.name}</span>
                      <span className="text-xs text-sand/50">
                        {hit.shown.city} · {hit.shown.region}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
        <div ref={mapEl} className="relative z-0" style={{ height }} />
      </div>
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
