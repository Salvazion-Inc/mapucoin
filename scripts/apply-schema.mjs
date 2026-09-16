/**
 * Apply supabase/schema.sql using the service role against PostgREST-adjacent
 * endpoints, then verify partners / profiles / bookings.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(".env.local");

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ref = url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1];

if (!url || !key || !ref) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function rest(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 240) };
}

async function runSql(sql) {
  const attempts = [
    `${url}/pg/query`,
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
  ];
  const bodies = [{ query: sql }, { query: sql }, sql];
  const extra = process.env.SUPABASE_ACCESS_TOKEN
    ? {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      }
    : headers;

  for (const endpoint of attempts) {
    const hdr = endpoint.includes("api.supabase.com") ? extra : headers;
    for (const body of bodies) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: hdr,
          body: typeof body === "string" ? body : JSON.stringify(body),
        });
        const text = await res.text();
        if (res.ok) return { endpoint, status: res.status, text: text.slice(0, 300) };
        if (res.status !== 404 && res.status !== 405) {
          return { endpoint, status: res.status, text: text.slice(0, 400) };
        }
      } catch (err) {
        /* next */
      }
    }
  }
  return null;
}

const before = {
  partners: await rest("partners"),
  profiles: await rest("profiles"),
  bookings: await rest("bookings"),
};
console.log("before", JSON.stringify(before));

const sql = fs.readFileSync(path.join(ROOT, "supabase", "schema.sql"), "utf8");
const ran = await runSql(sql);
console.log("sql", ran ? JSON.stringify(ran) : "no-sql-endpoint");

const after = {
  partners: await rest("partners"),
  profiles: await rest("profiles"),
  bookings: await rest("bookings"),
};
console.log("after", JSON.stringify(after));

const ok =
  after.partners.status < 400 &&
  after.profiles.status < 400 &&
  after.bookings.status < 400;
process.exit(ok ? 0 : 2);
