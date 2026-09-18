import { timingSafeEqual } from "crypto";

export function adminAuthorized(req: Request) {
  const secret =
    process.env.MAPUCOIN_ADMIN_SECRET ||
    process.env.AUTH_SECRET ||
    "mapucoin-by-salvazion-inc-session-key";
  const header = req.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  const given =
    bearer ||
    (req.headers.get("x-admin-secret") || "").trim() ||
    (req.headers.get("x-mapucoin-admin") || "").trim();
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
