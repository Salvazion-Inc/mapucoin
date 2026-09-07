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

## Dominio Canva → Vercel

`mapucoin.com` está registrado (hoy apunta a un sitio Canva). Para servir esta app:

1. En Vercel: Project → Settings → Domains → add `mapucoin.com` y `www.mapucoin.com`.
2. En Canva (Domains) o el DNS del registrador, cambia el registro A/CNAME al que indique Vercel (`cname.vercel-dns.com`).
3. Quita o pausa el sitio Canva para que no pelee el DNS.

## Local

```bash
npm install
npm run dev
```
