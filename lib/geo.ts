export type LatLng = { lat: number; lng: number };

const R = 6371;

export function haversineKm(a: LatLng, b: LatLng) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatKm(km: number, locale = "es") {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  const n = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return locale.startsWith("en") ? `${n} km` : `${n} km`;
}

/** Santiago, default pin when GPS is off. */
export const DEFAULT_HERE: LatLng & { label: string } = {
  lat: -33.4489,
  lng: -70.6693,
  label: "Santiago",
};
