# Mapucoin

Plataforma turística de Chile: el viajero indica **presupuesto** y **lugar**, Grok arma un itinerario con **cápsulas tecnológicas**, **gastronomía local** y **actividades**, sobre un **mapa interactivo**. Partners se inscriben y Stripe cobra.

La **App** (PWA instalable, misma infraestructura que Kaenz / Salvazion) vive en `/app`: cuenta, mapa, cápsulas, viaje con Grok y mesa. Entrar en `/login`.

- Dominio: [mapucoin.com](https://mapucoin.com)
- Marca: logo kultrún en Canva (`Logo Mapucoin`)
- Stack: Next.js 15 · Grok (xAI) · Supabase · Stripe · Leaflet · Vercel · GitHub

## Páginas

| Ruta | Qué hace |
| --- | --- |
| `/` | Hero + planificador presupuesto/destino |
| `/planificar` | Itinerario Grok + chat concierge |
| `/mapa` | Mapa de destinos y cápsulas |
| `/destinos` `/capsulas` `/gastronomia` `/actividades` | Catálogo |
| `/partners` | Alta de partners |
| `/partners/onboard` | Stripe Connect Express (CL) |
| `/reserva` | Checkout Stripe (CLP) |
| `/login` `/signup` | Cuenta (correo, Google) |
| `/app` | App PWA — Explorar |
| `/app/capsulas` | Cápsulas y reserva Stripe |
| `/app/viaje` | Itinerario Grok |
| `/app/mesa` | Gastronomía y actividades |
| `/app/cuenta` | Perfil y reservas |

## Variables

Copia `.env.example` a `.env.local`:

```
XAI_API_KEY=
NEXT_PUBLIC_APP_URL=https://mapucoin.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAPUCOIN_ADMIN_SECRET=
MAPUCOIN_PLATFORM_FEE_BPS=1200
```

## Supabase

Mapucoin comparte el proyecto Supabase de Kaenz (`mqkyzkrpoinbvclxurfg`). Las reservas van a `bookings`, el perfil a `profiles` (roles `client` / `owner`) y los partners a `applications`. `supabase/schema.sql` documenta el modelo propio si se separa el proyecto.

Google entra por el provider ya activo en ese proyecto Supabase (mismo cliente Cloud que Kaenz). Guía: `docs/auth-google.md`.

Sin Supabase, login/signup siguen funcionando en local (cookie de sesión). Sin `XAI_API_KEY`, el planificador usa el itinerario de catálogo. Sin Stripe, la reserva muestra error hasta configurar la clave.

`app.mapucoin.com` redirige a `mapucoin.com/app`. La App exige sesión.

## Stripe

Webhook: `https://mapucoin.com/api/stripe/webhook`

Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `account.updated`. Moneda CLP (sin decimales).

### Connect (12%)

Detalle y fallback US→CL: [`docs/stripe-connect.md`](docs/stripe-connect.md).

- `GET /api/partners/approved` — pins públicos (`slug`, `business`, `city`, `lat`, `lng`, `price_from_clp`, `offer_summary`, `landscape`). Sin email/teléfono/Stripe IDs.
- `POST /api/partners/approve` y `POST /api/partners/reject` — header `Authorization: Bearer $MAPUCOIN_ADMIN_SECRET` (o `x-admin-secret`). Pasa `pending` → `approved` con geo/listing, o `rejected`.
- `GET /api/partners?status=pending` — listado admin (PII). No es público.
- `POST /api/partners/connect` — Express `country=CL` + Account Link. Partner: mismo correo de la postulación. Admin: Bearer + `{ "id" }`.
- `/api/checkout` — si el partner de la cápsula está Connect-ready (`charges_enabled` y `payouts_enabled`): `payment_intent_data.application_fee_amount` (12%) + `transfer_data.destination`. Si no, o si Stripe rechaza el destination charge: guest Checkout en la plataforma y `payout_mode=manual` con fee contabilizado.

En el proyecto Supabase compartido con Kaenz (`profiles.id` es uuid → `auth.users`), corre `supabase/p2.sql` (no recasts de `profiles.id`). `schema.sql` completo también es seguro ahora. Si `partners` aún no existe, P2 usa `applications` (solo filas Mapucoin).

`MAPUCOIN_ADMIN_SECRET` es el header de approve/reject. Si falta, se acepta `AUTH_SECRET`.

### Test mode

1. Stripe Dashboard (test): webhook al endpoint de arriba con los tres eventos. Claves `sk_test_` / `whsec_` en Vercel o `.env.local`.
2. Connect settings (test): habilitar Chile si aparece. Branding mínimo para Account Links.
3. `MAPUCOIN_ADMIN_SECRET` y `MAPUCOIN_PLATFORM_FEE_BPS=1200` en el entorno.
4. Postula un partner real por `/#partners` (no inventar filas a mano).
5. `GET /api/partners?status=pending` con el secret → copia `id`.
6. Aprueba con geo del catálogo (ejemplo de body; usa el `id` real y coords de un destino curado, no un partner ficticio):

```bash
curl -sS -X POST https://mapucoin.com/api/partners/approve \
  -H "Authorization: Bearer $MAPUCOIN_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"id":"<partner_id>","lat":-22.9087,"lng":-68.1997,"price_from_clp":165000,"offer_summary":"Techo de vidrio para la Vía Láctea. Climatización y Starlink.","landscape":"desierto","slug":"capsula-atacama-star"}'
```

7. `GET /api/partners/approved` y `/#mapa` filtro Partners (o Ambos). Pin extra solo si el `slug` no choca con el catálogo; si coincide, el pin curado se queda y el checkout igual enlaza al partner.
8. `/partners/onboard` con el correo de esa postulación. Completa Express con [datos de test Connect](https://docs.stripe.com/connect/testing).
9. Confirma `account.updated` en el webhook y `charges_enabled` / `payouts_enabled` en `GET /api/partners?status=approved`.
10. Reserva `https://mapucoin.com/reserva?capsula=capsula-atacama-star` (u otro slug curado). Tarjeta test `4242…`. En el PaymentIntent: `application_fee_amount` = 12% CLP y `transfer_data.destination` si Connect-ready; si no, cargo plataforma y booking `payout_mode=manual`.
11. Si `POST /api/partners/connect` responde `blocked: true`, deja el partner aprobado (el pin sigue) y usa el accounting manual. No fuerces destination charges.

## Dominio mapucoin.com

El dominio ya está añadido al proyecto Vercel `mapucoin`. Hoy el DNS sigue en Canva (`ns*.systemdns.com` → `103.169.142.0`). Para que `https://mapucoin.com` sirva esta app, en el DNS del registrador (Canva / systemdns):

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |
| CNAME | `www` | `d73ca93feac97dc3.vercel-dns-017.com` |

O cambia los nameservers a `ns1.vercel-dns.com` y `ns2.vercel-dns.com`.

Hasta que el DNS propague, la app vive en [https://mapucoin.vercel.app](https://mapucoin.vercel.app).

## Local

```bash
npm install
npm run dev
```
