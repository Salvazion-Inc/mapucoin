# P2 · Cifrar tokens de Mercado Pago (antes de cuentas reales)

Estado: diseño, sin implementar. Origen: GOV-FAIL-MPC-MIG37 / DEC-20261029-01.

Hoy `public.mp_partner_accounts.access_token` y `refresh_token` se guardan en claro. Protección actual: RLS sin policies + grants solo `service_role`/`postgres`. Suficiente para sandbox, no para cuentas reales.

## Opciones
1. **Supabase Vault** (`vault.create_secret` / `vault.decrypted_secrets`): el token va a Vault y la tabla guarda solo el `secret_id`. Lectura vía función `security definer` ejecutable solo por `service_role`. Pro: clave gestionada por Supabase. Contra: el proyecto es compartido con Kaenz (permisos de Vault por proyecto).
2. **Cifrado app-side** (AES-256-GCM, `node:crypto`) con clave `MP_TOKEN_KEY` (32 bytes, Vercel Secret por entorno). Columnas `access_token_enc`, `refresh_token_enc`, `key_version`. Pro: la base nunca ve el token; independiente de Kaenz. Contra: rotación de clave a cargo nuestro.
(pgsodium está en deprecación en Supabase: no usar.)

## Recomendación
Opción 2 (app-side) con `key_version` para rotar; migración aditiva + backfill + drop de columnas en claro tras verificar.

## Criterios de salida
- Ningún token en claro en la base (query de verificación).
- Tests: cifrar/descifrar, clave errónea falla, rotación de versión.
- DEC registrada antes de aplicar la migración (R23-DEC).
