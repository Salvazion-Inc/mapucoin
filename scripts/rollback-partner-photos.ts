/**
 * Empty and delete the Mapucoin partner photo bucket through the Storage API.
 *
 * Order:
 * 1. Set MAPUCOIN_PARTNER_APPLICATION_V2=0 and redeploy. This script refuses to
 *    run while that flag is on.
 * 2. Run this file with the exact confirm flag. It prints the Supabase project
 *    ref and URL, then calls emptyBucket and deleteBucket on
 *    partner-application-photos only.
 * 3. Run supabase/rollback/partner-application-v2.sql in the SQL editor.
 * 4. git revert the checklist change if the code should leave the repo.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node --experimental-strip-types scripts/rollback-partner-photos.ts \
 *   --confirm=partner-application-photos
 *
 * Without that confirm flag the script refuses and does not delete anything.
 * The service role key stays in the environment. This script does not print it.
 */
import { createClient } from "@supabase/supabase-js";
import { PARTNER_PHOTO_BUCKET } from "../lib/partner-application.ts";

const BUCKET = PARTNER_PHOTO_BUCKET;
export const PHOTO_ROLLBACK_CONFIRM = "--confirm=partner-application-photos";

function flagOn(env: NodeJS.ProcessEnv) {
  const raw = String(env.MAPUCOIN_PARTNER_APPLICATION_V2 || "")
    .trim()
    .toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

export function supabaseProjectRef(url: string) {
  return new URL(url).hostname.split(".")[0] || "";
}

/**
 * Decides whether a delete may start. A missing confirm flag returns before
 * any project URL is treated as a target. When confirm is present, notice is
 * the lines to print before any Storage call.
 */
export function preparePhotoRollback(argv: string[], env: NodeJS.ProcessEnv) {
  if (!argv.includes(PHOTO_ROLLBACK_CONFIRM)) {
    return {
      ok: false as const,
      error: "Refusing to delete. Pass --confirm=partner-application-photos.",
    };
  }
  const url = String(env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  if (!url) {
    return {
      ok: false as const,
      error: "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    };
  }
  let ref = "";
  try {
    ref = supabaseProjectRef(url);
  } catch {
    return { ok: false as const, error: "Supabase URL is not valid." };
  }
  if (!ref) return { ok: false as const, error: "Supabase URL is not valid." };
  const notice = [`Supabase project ref: ${ref}`, `Supabase URL: ${url}`];
  if (flagOn(env)) {
    return {
      ok: false as const,
      error:
        "MAPUCOIN_PARTNER_APPLICATION_V2 is on. Turn it off and redeploy before deleting photos.",
      notice,
    };
  }
  if (!String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim()) {
    return {
      ok: false as const,
      error: "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
      notice,
    };
  }
  return { ok: true as const, ref, url, notice };
}

function missingBucket(error: { message?: string; status?: number; statusCode?: string } | null) {
  if (!error) return false;
  const message = error.message || "";
  return (
    error.status === 404 ||
    error.statusCode === "404" ||
    /not found|does not exist/i.test(message)
  );
}

async function main() {
  if (BUCKET !== "partner-application-photos") {
    throw new Error("Refusing to touch a bucket other than partner-application-photos.");
  }
  const prepared = preparePhotoRollback(process.argv.slice(2), process.env);
  if ("notice" in prepared && prepared.notice) {
    for (const line of prepared.notice) console.log(line);
  }
  if (!prepared.ok) throw new Error(prepared.error);

  const db = createClient(prepared.url, process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: { persistSession: false },
  });
  const emptied = await db.storage.emptyBucket(BUCKET);
  if (emptied.error && !missingBucket(emptied.error)) {
    throw new Error(emptied.error.message);
  }
  if (emptied.error && missingBucket(emptied.error)) {
    console.log("Bucket already absent.");
    return;
  }
  const removed = await db.storage.deleteBucket(BUCKET);
  if (removed.error && !missingBucket(removed.error)) {
    throw new Error(removed.error.message);
  }
  console.log("Emptied and deleted partner-application-photos.");
}

const isDirectRun = process.argv[1]?.includes("rollback-partner-photos");
if (isDirectRun) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "rollback failed";
    console.error(message);
    process.exitCode = 1;
  });
}
