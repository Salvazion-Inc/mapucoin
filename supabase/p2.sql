-- Mapucoin P2 only. Safe on the shared Kaenz project (does not touch profiles.id).

create extension if not exists "pgcrypto";

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('capsula', 'gastronomia', 'actividad', 'guia', 'transporte', 'vina')),
  business text not null,
  city text,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.partners add column if not exists slug text;
alter table public.partners add column if not exists lat double precision;
alter table public.partners add column if not exists lng double precision;
alter table public.partners add column if not exists price_from_clp int;
alter table public.partners add column if not exists offer_summary text;
alter table public.partners add column if not exists landscape text;
alter table public.partners add column if not exists capsule_slug text;
alter table public.partners add column if not exists approved_at timestamptz;
alter table public.partners add column if not exists rejected_at timestamptz;
alter table public.partners add column if not exists reject_reason text;
alter table public.partners add column if not exists stripe_account_id text;
alter table public.partners add column if not exists charges_enabled boolean not null default false;
alter table public.partners add column if not exists payouts_enabled boolean not null default false;
alter table public.partners add column if not exists details_submitted boolean not null default false;
alter table public.partners add column if not exists connect_country text;
alter table public.partners add column if not exists connect_blocked text;

alter table public.bookings add column if not exists partner_id uuid;
alter table public.bookings add column if not exists stripe_account_id text;
alter table public.bookings add column if not exists application_fee_clp int;
alter table public.bookings add column if not exists partner_payout_clp int;
alter table public.bookings add column if not exists payout_mode text;
alter table public.bookings add column if not exists fee_bps int;
alter table public.bookings add column if not exists capsule_slug text;
alter table public.bookings add column if not exists nights int;

create unique index if not exists partners_slug_unique
  on public.partners (slug)
  where slug is not null;

create unique index if not exists partners_stripe_account_unique
  on public.partners (stripe_account_id)
  where stripe_account_id is not null;

create index if not exists partners_status_idx on public.partners (status);
create index if not exists bookings_partner_id_idx on public.bookings (partner_id);

alter table public.partners enable row level security;

drop policy if exists "public insert partners" on public.partners;
create policy "public insert partners"
  on public.partners for insert
  with check (true);
