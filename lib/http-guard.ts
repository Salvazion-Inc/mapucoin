import { appOrigin } from "@/lib/stripe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HONEYPOT_KEYS = ["website", "company_site", "url"];

export function isEmail(value: string) {
  const email = value.trim().toLowerCase();
  return email.length >= 6 && email.length <= 254 && EMAIL_RE.test(email);
}

export function isPersonName(value: string) {
  const name = value.trim();
  if (name.length < 2 || name.length > 120) return false;
  return /[\p{L}]/u.test(name);
}

export function honeypotFilled(body: Record<string, unknown>) {
  return HONEYPOT_KEYS.some((key) => String(body[key] || "").trim().length > 0);
}

function hostOf(value: string) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return "";
  }
}

export function originAllowed(req: Request) {
  const origin = (req.headers.get("origin") || "").trim();
  if (!origin) return true;

  const host = hostOf(origin);
  if (!host) return false;
  if (host === "localhost" || host.startsWith("localhost:")) return true;
  if (host === "127.0.0.1" || host.startsWith("127.0.0.1:")) return true;

  const allowed = new Set<string>();
  const appHost = hostOf(appOrigin(req));
  if (appHost) allowed.add(appHost);
  allowed.add("mapucoin.com");
  allowed.add("www.mapucoin.com");

  if (allowed.has(host)) return true;
  if (host.endsWith(".vercel.app") && host.includes("mapucoin")) return true;
  return false;
}

export function originRejectedResponse() {
  return Response.json({ error: "origin" }, { status: 403 });
}
