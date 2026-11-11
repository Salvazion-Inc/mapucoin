/**
 * Empty and delete the Mapucoin partner photo bucket through the Storage API.
 *
 * Order:
 * 1. Set MAPUCOIN_PARTNER_APPLICATION_V2=0 and redeploy. This script refuses to
 *    run while that flag is on.
 * 2. Run this file. It calls emptyBucket, then deleteBucket, on
 *    partner-application-photos only. It does not write SQL and does not touch
 *    any other bucket.
 * 3. Run supabase/rollback/partner-application-v2.sql in the SQL editor.
 * 4. git revert the checklist change if the code should leave the repo.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node --experimental-strip-types scripts/rollback-partner-photos.ts
 *
 * The service role key stays in the environment. This script does not print it.
 */
import { createClient } from "@supabase/supabase-js";
import { PARTNER_PHOTO_BUCKET } from "../lib/partner-application.ts";

const BUCKET = PARTNER_PHOTO_BUCKET;

function flagOn() {
  const raw = String(process.env.MAPUCOIN_PARTNER_APPLICATION_V2 || "")
    .trim()
    .toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
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
  if (flagOn()) {
    throw new Error(
      "MAPUCOIN_PARTNER_APPLICATION_V2 is on. Turn it off and redeploy before deleting photos.",
    );
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
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

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "rollback failed";
  console.error(message);
  process.exitCode = 1;
});
