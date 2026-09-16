/**
 * Copy Google OAuth keys from Kaenz and generate AUTH_SECRET for Mapucoin.
 * Does not print secret values.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const local = path.join(ROOT, ".env.local");
const kaenz = path.join(
  path.dirname(ROOT),
  "Kaenz App",
  ".env.local",
);

function parseEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function upsert(text, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(text)) return text.replace(re, line);
  return `${text.replace(/\s*$/, "")}\n${line}\n`;
}

const mine = parseEnv(local);
const theirs = parseEnv(kaenz);
let next = fs.existsSync(local) ? fs.readFileSync(local, "utf8") : "";
const added = [];

if (!mine.AUTH_SECRET) {
  next = upsert(next, "AUTH_SECRET", crypto.randomBytes(32).toString("hex"));
  added.push("AUTH_SECRET");
}

if (theirs.GOOGLE_CLIENT_ID && theirs.GOOGLE_CLIENT_SECRET) {
  if (!mine.GOOGLE_CLIENT_ID) {
    next = upsert(next, "GOOGLE_CLIENT_ID", theirs.GOOGLE_CLIENT_ID);
    added.push("GOOGLE_CLIENT_ID");
  }
  if (!mine.GOOGLE_CLIENT_SECRET) {
    next = upsert(next, "GOOGLE_CLIENT_SECRET", theirs.GOOGLE_CLIENT_SECRET);
    added.push("GOOGLE_CLIENT_SECRET");
  }
}

fs.writeFileSync(local, next.endsWith("\n") ? next : `${next}\n`);
console.log("updated .env.local:", added.join(", ") || "already complete");
console.log(
  "google_id_prefix",
  (theirs.GOOGLE_CLIENT_ID || mine.GOOGLE_CLIENT_ID || "").slice(0, 12),
);
