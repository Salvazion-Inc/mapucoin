# Stripe Connect (P2)

Mapucoin cobra en **CLP** sobre la cuenta de plataforma (Salvazion Inc., US) y reparte al partner cuando hay una cuenta Connect Express **lista**.

Take-rate por defecto: **12%** (`MAPUCOIN_PLATFORM_FEE_BPS=1200`). Entero CLP, siempre menor que el cargo.

## Flujo

1. Partner postula en `/#partners` (`POST /api/partners`) → `status=pending`.
2. Admin aprueba en `/admin/partners` o `POST /api/partners/approve` con `MAPUCOIN_ADMIN_SECRET` y define `lat`, `lng`, `slug`, `price_from_clp`, `offer_summary`, `landscape` (coords de catálogo, no inventadas).
3. El partner (correo de la postulación) abre `/partners/onboard` → Express Account Link, `country=CL`.
4. Webhook `account.updated` copia `charges_enabled`, `payouts_enabled`, `details_submitted`.
5. Checkout: si el partner está Connect-ready → `application_fee_amount` + `transfer_data.destination`. Si no → cargo solo en plataforma (guest Checkout actual) y se guardan `application_fee_clp` / `partner_payout_clp` / `payout_mode=manual`.

Connect-ready = `stripe_account_id` + `charges_enabled` + `payouts_enabled`.

## Webhook

Endpoint: `https://mapucoin.com/api/stripe/webhook`

Eventos (test mode y live):

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `account.updated`

## US platform → CL Connect

La plataforma vive en una cuenta Stripe **US**. Los partners son **CL**.

Un platform US *puede* crear Express en países que Stripe tenga habilitados en [Connect settings](https://dashboard.stripe.com/settings/connect). Chile hay que activarlo ahí (test mode y live por separado). Destination charges cross-border no están abiertos en todas las regiones; Stripe puede rechazar `country=CL`, las capabilities `card_payments`/`transfers`, o `transfer_data.destination`.

Si eso pasa:

1. `POST /api/partners/connect` responde `{ blocked: true, payout_mode: "manual", reason }` y persiste `partners.connect_blocked`.
2. `/api/checkout` **no** envía `application_fee_amount` ni `transfer_data`. El guest Checkout CLP sigue igual (path to 1st $).
3. El booking igual guarda el take-rate: `payout_mode=manual`, `application_fee_clp` (12%), `partner_payout_clp` (resto). El payout al partner es una transferencia/banco fuera de Connect, usando esos campos.

No se inventan partners ni bookings para simular Connect.

## Test mode

Ver README → Stripe Connect (pasos). No uses claves live contra Account Links de prueba.
