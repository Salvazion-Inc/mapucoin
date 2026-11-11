-- Rollback for supabase/partner-application-v2.sql
-- Run by hand in the Supabase SQL editor. Do not run from CI or from an agent.
-- Removes only the Mapucoin checklist table, its private photo bucket, and the
-- restrictive policy that blocks client access to that bucket.
-- Does not ALTER or DROP public.applications, public.profiles, public.bookings,
-- public.partners, or any Kaenz table. Does not revoke grants on other tables.
-- Stored dossiers and photos for this checklist are deleted.

drop policy if exists "mapucoin partner photos block client" on storage.objects;

delete from storage.objects
where bucket_id = 'partner-application-photos';

delete from storage.buckets
where id = 'partner-application-photos';

drop table if exists public.partner_application_details;
