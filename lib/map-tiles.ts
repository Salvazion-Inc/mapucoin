export function mapTiles() {
  const key = (process.env.NEXT_PUBLIC_MAP_API_KEY || "").trim();
  const url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  return {
    url: key ? `${url}?key=${encodeURIComponent(key)}` : url,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  };
}
