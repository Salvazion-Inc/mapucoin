import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  const k = t.slice(0, i).trim();
  if (!process.env[k]) process.env[k] = v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function hit(method, pathName, body) {
  const res = await fetch(url + pathName, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  console.log(method, pathName, res.status, text.slice(0, 280).replace(/\s+/g, " "));
}

await hit("GET", "/rest/v1/profiles?select=*&limit=1");
await hit("GET", "/rest/v1/bookings?select=*&limit=1");
await hit("POST", "/rest/v1/rpc/exec_sql", { query: "select 1" });
await hit("POST", "/pg/query", { query: "select 1" });
await hit("POST", "/pg-meta/default/query", { query: "select 1" });
await hit("GET", "/rest/v1/");
