-- Mercado Pago Split 1:1 (sandbox). Server-only tables: RLS on, no policies (service role only).
create table if not exists public.mp_partner_accounts (
  partner_id text primary key,
  mp_user_id text,
  access_token text not null,
  refresh_token text,
  public_key text,
  live_mode boolean,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.mp_partner_accounts enable row level security;

create table if not exists public.mp_webhook_events (
  id text primary key,
  topic text,
  resource_id text,
  received_at timestamptz not null default now()
);
alter table public.mp_webhook_events enable row level security;

alter table public.bookings add column if not exists mp_preference_id text;
alter table public.bookings add column if not exists mp_payment_id text;
