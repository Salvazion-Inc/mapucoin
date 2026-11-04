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

-- Test partners (sandbox): excluded from every public listing.
alter table public.partners add column if not exists is_test boolean not null default false;

-- DEC-20261029-01: server-only tables, no access for anon/authenticated.
revoke all on public.mp_partner_accounts, public.mp_webhook_events from anon, authenticated;

-- DEC-20261103-05: tokens cifrados app-side (AES-256-GCM, MP_TOKEN_KEY); columnas en claro quedan siempre null.
alter table public.mp_partner_accounts add column if not exists access_token_enc text,
  add column if not exists refresh_token_enc text, add column if not exists key_version int;
alter table public.mp_partner_accounts alter column access_token drop not null;
-- Neto real que recibe el partner tras application_fee + comisión MP (desde fee_details).
alter table public.bookings add column if not exists partner_net_clp integer;
