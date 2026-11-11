-- Mapucoin partner checklist. Additive only.
-- Run by hand in the Supabase SQL editor. Do not apply from CI or from an agent.
-- Shared project with Kaenz: this file does not ALTER public.applications,
-- public.profiles, public.bookings, public.partners, or any other Kaenz table.
--
-- Rollback order: flag off, then scripts/rollback-partner-photos.ts --confirm=partner-application-photos
-- (Storage API), then supabase/rollback/partner-application-v2.sql, then git revert.
-- Do not DELETE FROM storage.objects or storage.buckets.
-- Feature flag: MAPUCOIN_PARTNER_APPLICATION_V2=1 after this script succeeds.
-- Leave the flag unset or 0 until the owner approves the new public copy
-- and the Privacy paragraph. Unset is OFF in Production.

create table if not exists public.partner_application_details (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  application_source text not null check (application_source in ('partners', 'applications')),
  account_id text not null,
  account_email text not null,
  legal_name text not null,
  rut text not null,
  entity_type text not null check (entity_type in ('empresa', 'persona_natural')),
  category text not null check (category in ('capsula', 'gastronomia', 'actividad', 'guia', 'transporte', 'vina')),
  region text not null,
  comuna text not null,
  presence_url text not null,
  description text not null,
  offers jsonb not null,
  sernatur_registered boolean not null default false,
  sernatur_number text,
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  privacy_version text not null,
  photo_paths text[] not null,
  created_at timestamptz not null default now(),
  constraint partner_application_details_source_id unique (application_source, application_id),
  constraint partner_application_details_photos_count check (
    cardinality(photo_paths) between 3 and 4
  ),
  constraint partner_application_details_offers_array check (
    jsonb_typeof(offers) = 'array'
  )
);

create index if not exists partner_application_details_application_idx
  on public.partner_application_details (application_id);

alter table public.partner_application_details enable row level security;

-- No policies: anon and authenticated have no access. The service role bypasses RLS.
-- Default privileges on this project can grant new public tables to anon, so revoke.
revoke all on table public.partner_application_details from public, anon, authenticated;
grant select, insert, update, delete on table public.partner_application_details to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partner-application-photos',
  'partner-application-photos',
  false,
  800000,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Blocks this bucket even if a broad storage policy exists. Other buckets stay as they are.
drop policy if exists "mapucoin partner photos block client" on storage.objects;
create policy "mapucoin partner photos block client"
on storage.objects
as restrictive
for all
to anon, authenticated
using (bucket_id <> 'partner-application-photos')
with check (bucket_id <> 'partner-application-photos');

comment on table public.partner_application_details is
  'Mapucoin partner checklist. Service role only. No anon or authenticated INSERT.';
