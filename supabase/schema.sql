-- Mapucoin — run in the Supabase SQL editor.

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

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  capsule_slug text,
  nights int,
  guests int,
  amount numeric,
  status text not null default 'requested',
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz not null default now()
);

alter table public.partners enable row level security;
alter table public.bookings enable row level security;

create policy "public insert partners"
  on public.partners for insert
  with check (true);

create policy "service insert bookings"
  on public.bookings for insert
  with check (true);

create policy "service update bookings"
  on public.bookings for update
  using (true)
  with check (true);
