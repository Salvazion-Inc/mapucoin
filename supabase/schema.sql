-- Mapucoin — run in the Supabase SQL editor (idempotent).

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

create table if not exists public.profiles (
  id text primary key,
  full_name text,
  email text,
  phone text,
  role text not null default 'traveler',
  instagram text,
  city text,
  city_lat double precision,
  city_lng double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  full_name text not null,
  email text not null,
  phone text,
  capsule_slug text,
  yacht_slug text,
  origin text,
  destination text,
  nights int,
  guests int,
  amount numeric,
  status text not null default 'requested',
  stripe_session_id text,
  stripe_payment_intent text,
  notes text,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'id'
      and data_type = 'uuid'
  ) then
    alter table public.profiles alter column id type text using id::text;
  end if;
end $$;

alter table public.bookings add column if not exists user_id text;
alter table public.bookings add column if not exists yacht_slug text;
alter table public.bookings add column if not exists origin text;
alter table public.bookings add column if not exists destination text;
alter table public.bookings add column if not exists notes text;
alter table public.bookings add column if not exists nights int;
alter table public.bookings add column if not exists capsule_slug text;

-- P2: listing fields so an approved partner can become a map pin.
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

-- P2: Stripe Connect Express (country CL) + webhook account.updated.
alter table public.partners add column if not exists stripe_account_id text;
alter table public.partners add column if not exists charges_enabled boolean not null default false;
alter table public.partners add column if not exists payouts_enabled boolean not null default false;
alter table public.partners add column if not exists details_submitted boolean not null default false;
alter table public.partners add column if not exists connect_country text;
alter table public.partners add column if not exists connect_blocked text;

-- P2: fee accounting (12% default). Used for Connect destination charges and
-- for manual partner payout when US platform → CL Connect is blocked.
alter table public.bookings add column if not exists partner_id uuid;
alter table public.bookings add column if not exists stripe_account_id text;
alter table public.bookings add column if not exists application_fee_clp int;
alter table public.bookings add column if not exists partner_payout_clp int;
alter table public.bookings add column if not exists payout_mode text;
alter table public.bookings add column if not exists fee_bps int;

create unique index if not exists partners_slug_unique
  on public.partners (slug)
  where slug is not null;

create unique index if not exists partners_stripe_account_unique
  on public.partners (stripe_account_id)
  where stripe_account_id is not null;

create index if not exists partners_status_idx on public.partners (status);
create index if not exists bookings_partner_id_idx on public.bookings (partner_id);

alter table public.partners enable row level security;
alter table public.bookings enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "service upsert profiles" on public.profiles;
create policy "service upsert profiles"
  on public.profiles for insert
  with check (true);

drop policy if exists "service update profiles" on public.profiles;
create policy "service update profiles"
  on public.profiles for update
  using (true)
  with check (true);

drop policy if exists "service select profiles" on public.profiles;
create policy "service select profiles"
  on public.profiles for select
  using (true);

drop policy if exists "public insert partners" on public.partners;
create policy "public insert partners"
  on public.partners for insert
  with check (true);

-- No public SELECT on partners: email/phone/stripe_account_id stay off the
-- anon key. GET /api/partners/approved projects public columns via service role.

drop policy if exists "service insert bookings" on public.bookings;
create policy "service insert bookings"
  on public.bookings for insert
  with check (true);

drop policy if exists "service update bookings" on public.bookings;
create policy "service update bookings"
  on public.bookings for update
  using (true)
  with check (true);

drop policy if exists "service select bookings" on public.bookings;
create policy "service select bookings"
  on public.bookings for select
  using (true);
