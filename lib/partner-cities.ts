/** Collapse catalog cities that repeat with different accents or casing. */
export function cityKey(city: string) {
  return city
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function diacritics(value: string) {
  const marks = value.normalize("NFD").match(/\p{M}/gu);
  return marks ? marks.length : 0;
}

/** One label per city, accented spelling preferred, sorted in Spanish. */
export function uniqueSortedCities(cities: readonly string[]) {
  const byKey = new Map<string, string>();
  for (const raw of cities) {
    const label = raw.trim().replace(/\s+/g, " ");
    if (!label) continue;
    const key = cityKey(label);
    const current = byKey.get(key);
    if (!current || diacritics(label) > diacritics(current)) {
      byKey.set(key, label);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "es"));
}
