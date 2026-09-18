import { createHash, timingSafeEqual } from "crypto";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function adminSecretConfigured() {
  return Boolean(
    process.env.MAPUCOIN_ADMIN_SECRET || process.env.AUTH_SECRET,
  );
}

function expectedSecret() {
  return (
    process.env.MAPUCOIN_ADMIN_SECRET || process.env.AUTH_SECRET || ""
  );
}

export function adminToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  return (
    bearer ||
    (req.headers.get("x-admin-secret") || "").trim() ||
    (req.headers.get("x-mapucoin-admin") || "").trim()
  );
}

export function secretsMatch(given: string, expected: string) {
  if (!given || !expected) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

export function adminAuthorized(req: Request) {
  const secret = expectedSecret();
  if (!secret) return false;
  const given = adminToken(req);
  if (!given) return false;
  return secretsMatch(given, secret);
}
