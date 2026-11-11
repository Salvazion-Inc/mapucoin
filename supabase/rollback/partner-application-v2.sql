-- Rollback for supabase/partner-application-v2.sql
-- Run by hand in the Supabase SQL editor. Do not run from CI or from an agent.
--
-- Order. Do not skip a step, and do not delete storage rows from SQL.
-- Supabase rejects DELETE on storage.objects and storage.buckets
-- (42501, storage.protect_delete) and a SQL delete would orphan the files.
-- 1. Set MAPUCOIN_PARTNER_APPLICATION_V2=0 and redeploy.
-- 2. Empty and delete bucket partner-application-photos with the Storage API:
--    node --experimental-strip-types scripts/rollback-partner-photos.ts --confirm=partner-application-photos
-- 3. Run this file. It only drops the restrictive policy and the new table,
--    in one transaction, after the bucket is already gone.
-- 4. git revert the checklist change if the code should leave the repo.
--
-- Does not ALTER or DROP public.applications, public.profiles, public.bookings,
-- public.partners, or any Kaenz table.

begin;

drop policy if exists "mapucoin partner photos block client" on storage.objects;

drop table if exists public.partner_application_details;

commit;
