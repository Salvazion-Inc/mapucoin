# Login con Google — Mapucoin

Google ya está encendido en el proyecto Supabase compartido con Kaenz (`mqkyzkrpoinbvclxurfg`). El cliente de Google Cloud redirige a:

```
https://mqkyzkrpoinbvclxurfg.supabase.co/auth/v1/callback
```

Mapucoin no necesita Client ID/Secret en Vercel. El botón **Continuar con Google** llama a `/api/auth/google`, que usa `signInWithOAuth({ provider: "google" })`, y vuelve a `/auth/callback`.

## Redirects en Supabase

Authentication → URL Configuration → Redirect URLs, si aún no están:

```
https://mapucoin.com/auth/callback
https://mapucoin.com/**
https://www.mapucoin.com/auth/callback
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Site URL puede seguir en Kaenz; Mapucoin pasa `redirectTo` explícito.

## Vercel

Ya están `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Opcional:

```
AUTH_SECRET=
```
