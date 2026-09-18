type Bucket = { n: number; reset: number };

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 4000;

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.reset < now) buckets.delete(key);
  }
  if (buckets.size < MAX_KEYS) return;
  const extra = buckets.size - Math.floor(MAX_KEYS / 2);
  let dropped = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    dropped += 1;
    if (dropped >= extra) break;
  }
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  return ip.slice(0, 64);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true; remaining: number } | { ok: false; retryAfter: number } {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.reset <= now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1) };
  }
  if (current.n >= limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((current.reset - now) / 1000)),
    };
  }
  current.n += 1;
  return { ok: true, remaining: Math.max(0, limit - current.n) };
}

export function rateLimitedResponse(retryAfter: number) {
  return Response.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    },
  );
}
