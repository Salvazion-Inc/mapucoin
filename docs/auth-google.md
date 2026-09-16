# Login con Google — Mapucoin

Mapucoin usa el mismo flujo OAuth web que Kaenz (`/api/auth/google` → callback).

## Redirect URIs

En [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → el cliente OAuth web de Kaenz/Salvazion:

**Authorized JavaScript origins**

```
https://mapucoin.com
https://www.mapucoin.com
http://localhost:3000
```

**Authorized redirect URIs**

```
https://mapucoin.com/api/auth/google/callback
https://www.mapucoin.com/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
```

Local ya coincide con Kaenz (`http://localhost:3000/api/auth/google/callback`), así que el mismo Client ID funciona en desarrollo.

## Vercel

Variables en el proyecto `mapucoin` (Production + Preview + Development):

```
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Las de Supabase, Stripe y xAI ya estaban en el proyecto.

## Supabase

Proyecto: `mqkyzkrpoinbvclxurfg`

Ejecuta `supabase/schema.sql` (tablas `partners`, `profiles`, `bookings`). El script `node scripts/apply-schema.mjs` lo intenta con la service role.
