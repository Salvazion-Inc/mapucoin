# Clave de acceso $SALVAZION — Mapucoin Premium

MTP v1.1.0, Constraint 7. La clave `$SALVAZION` es **solo una llave de acceso** a Mapucoin Premium. No es una inversión. No genera retornos, intereses, dividendos ni participación. Mapucoin no promete un precio ni un resultado financiero. El único beneficio del holder es el acceso Premium a la plataforma de viajes.

## Bandera

`SALVAZION_PREMIUM_KEY_ENABLED` sale en `false`.

Valores que la encienden: `true`, `1`, `yes`, `on` (sin importar mayúsculas, con espacios recortados). Cualquier otro valor, incluido vacío, la deja apagada.

Con la bandera apagada:

- `/api/premium` responde `{ enabled: false, premium: false }` y borra la cookie de acceso.
- No hay llamada a la red del token.
- La cuenta no muestra el panel. El resto del sitio no cambia.

Con la bandera encendida, un holder puede abrir Premium. Si la bandera vuelve a `false`, la cookie deja de valer aunque siga en el navegador.

Variables que solo se leen con la bandera encendida:

| Variable | Uso |
| --- | --- |
| `SALVAZION_TOKEN_ADDRESS` | Contrato ERC-20 de la clave. |
| `SALVAZION_RPC_URL` | HTTPS JSON-RPC de solo lectura. |
| `SALVAZION_MIN_RAW` | Saldo mínimo en unidades mínimas. Por defecto `1` (cualquier saldo mayor que cero). |
| `SALVAZION_PREMIUM_KEY_SECRET` | Firma la cookie de acceso. Sin este valor el acceso no se guarda entre recargas. |

## Diseño

Piezas nuevas, sin tocar pagos, Stripe, proveedores de login, datos personales ni migraciones:

- `lib/salvazion-premium.ts` — bandera, umbral y decisión de acceso.
- `lib/salvazion-premium-server.ts` — lectura pública del saldo y cookie.
- `app/api/premium/route.ts` — `GET` estado, `POST` comprobación.
- `components/app/PremiumKeyPanel.tsx` — panel en Cuenta, montado solo si la bandera está encendida.

La página `/app/cuenta` lee la bandera en el servidor (`dynamic = force-dynamic`) y pasa un booleano. Apagada, no se monta el panel y no hay petición extra.

## Comprobación de holder

1. El visitante escribe una dirección pública `0x` de 40 hex.
2. El servidor arma `eth_call` a `balanceOf` (selector `0x70a08231`) contra el contrato configurado.
3. Si el saldo en unidades mínimas es mayor o igual a `SALVAZION_MIN_RAW`, hay acceso.
4. La respuesta firma una cookie HttpOnly `mapucoin_premium_key` de 12 horas con `{ p: 1, exp }`.

La dirección no se guarda, no entra en la cookie, no se asocia a la cuenta y no se escribe en logs. El RPC configurado ve la dirección porque la consulta es pública; Mapucoin no la conserva. La URL de RPC tiene que ser `https`, sin credenciales en la URL, y no puede apuntar a localhost, metadata ni rangos privados.

Si faltan contrato o RPC válidos, la comprobación responde `unconfigured` y no abre Premium.

## Beneficio del holder

Solo acceso a Mapucoin Premium en la cuenta:

- estado **Premium activo**
- nota de planificación: menos traslados y más tiempo en el territorio, dentro del presupuesto de viaje

No hay descuento, retiro, rendimiento ni promesa de precio. Reservar sigue igual, con Stripe, para todo el mundo.

## Copia

La interfaz nueva está en español en `lib/salvazion-premium-copy.ts`. El texto promocional no habla de inversión, retorno ni precio de la clave. El aviso de Constraint 7 sí lo dice en negativo: la clave es una llave de acceso, no es una inversión, no genera retornos y Mapucoin no promete un precio.

Auditoría de la copia ya publicada (`lib/copy.ts`, `lib/app-copy.ts`, `lib/seo.ts`): no hay frases de inversión, retorno o especulación de precio. El nombre Mapucoin es la plataforma de viajes.

Ajustes para que esa lectura se mantenga:

- Términos, sección 9.
- `public/llms.txt`.
- Una línea en los prompts del concierge (`/api/chat` y `/api/plan`) para que no hablen de inversión, retornos, precio del token ni especulación.

## Riesgos

- **Cookie de 12 horas.** Quien transfiere la clave después de comprobarla conserva el acceso hasta que vence la cookie. No reconsultamos el saldo en cada request porque eso exigiría guardar la dirección.
- **RPC de terceros.** Un endpoint mal configurado podría fallar o, si se salta la validación de URL, alcanzar una red interna. Solo se aceptan HTTPS públicos.
- **Confusión con el nombre.** «Mapucoin» y «$SALVAZION» pueden leerse como un activo. La copia de términos, el panel y los prompts lo cierran.
- **Secreto ausente.** Sin `SALVAZION_PREMIUM_KEY_SECRET` el `POST` puede decir `premium: true` en esa respuesta, pero no deja cookie. Al recargar, Premium no sigue abierto.
- **Dirección pública.** Quien conoce una dirección con saldo puede abrir Premium en su navegador. Es una llave de acceso, no una identidad.

## Rollback

1. Poner `SALVAZION_PREMIUM_KEY_ENABLED=false` (o borrar la variable) y volver a desplegar. El panel desaparece, `/api/premium` niega el acceso y borra la cookie, y no hay llamadas al RPC.
2. Si hace falta sacar el código: revertir este PR. No hay migración que deshacer ni cambio en Stripe, login o tablas.

La bandera apagada es el estado de producción hasta que contrato, RPC y secreto estén definidos a propósito.
