# Mapucoin

Plataforma turística de Chile: el viajero indica **presupuesto** y **lugar**, Grok arma un itinerario con **cápsulas tecnológicas**, **gastronomía local** y **actividades**, sobre un **mapa interactivo**. Partners se inscriben y Stripe cobra.

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
| `/reserva` | Checkout Stripe (CLP) |

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
```

## Supabase

Ejecuta `supabase/schema.sql` en el SQL editor (tablas `partners` y `bookings`).

## Stripe

Webhook: `https://mapucoin.com/api/stripe/webhook` → evento `checkout.session.completed`. Moneda CLP (sin decimales).

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
