# Login con Google — Mapucoin

Google ya está encendido en el proyecto Supabase compartido con Kaenz (`mqkyzkrpoinbvclxurfg`). El cliente de Google Cloud redirige a:

```
https://mqkyzkrpoinbvclxurfg.supabase.co/auth/v1/callback
```

Mapucoin no necesita Client ID/Secret en Vercel. El botón **Continuar con Google** llama a `/api/auth/google`, que usa `signInWithOAuth({ provider: "google" })`, y vuelve a `/auth/callback`.

Mapucoin y Kaenz **comparten el mismo proyecto** (plan free: máximo 2). No hace falta un tercero.

Site URL sigue en `https://kaenz.com`. El login de Gmail de Mapucoin usa `redirectTo=https://kaenz.com/mapucoin-auth`; Kaenz reenvía el `code` a `https://mapucoin.com/auth/callback`.

Opcional, para ir directo sin el puente:

```
https://mapucoin.com/auth/callback
https://mapucoin.com/**
https://kaenz.com/mapucoin-auth
http://localhost:3000/auth/callback
```

## Vercel

Ya están `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Opcional:

```
AUTH_SECRET=
```
