/**
 * Fecha de "Última actualización" de Privacidad. DEC-20261103-22: se fija el día del paso a
 * producción de Mercado Pago (DEC-20261103-16): 4 de noviembre de 2026.
 */
export const PRIVACY_LAST_UPDATED = "4 de noviembre de 2026";

/** Version stored with a partner checklist acceptance. Same date as the public page. */
export const PRIVACY_VERSION = PRIVACY_LAST_UPDATED;

/** Version stored with a partner checklist acceptance. Same date as the public terms. */
export const TERMS_IN_FORCE = "8 de septiembre de 2026";

export const terms = {
  title: "Términos y Condiciones",
  intro:
    `Mapucoin Terms of Service. Fecha de entrada en vigor: ${TERMS_IN_FORCE}. Al usar mapucoin.com, reservar una cápsula o postular como partner, aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.`,
  sections: [
    {
      heading: "1. Definiciones",
      body: "Mapucoin es una plataforma tecnológica de viajes en Chile, operada por Salvazion SpA, RUT 78.462.349-1, Chile. Mapucoin es un intermediario de reservas que cobra una comisión; no es un operador turístico. Usuario: Quien planifica o reserva. Partner: Quien opera una cápsula, gastronomía, tour, guía, transporte o viña. Cápsula: Módulo de alojamiento listado en la plataforma. Viaje: Itinerario armado con presupuesto, destino, noches y viajeros.",
    },
    {
      heading: "2. Nuestro rol",
      body: "Mapucoin es solo una plataforma tecnológica. No somos tour operador, hotelero ni empleador de los partners. Las cápsulas, la gastronomía y las actividades las operan partners independientes. Los itinerarios son sugerencias, no un contrato de viaje.",
    },
    {
      heading: "3. Elegibilidad",
      body: "Debes tener al menos 18 años. Debes entregar datos veraces al reservar o postular. Los partners son responsables de permisos, seguros y operación en Chile.",
    },
    {
      heading: "4. Reservas y pagos",
      body: "El pago se procesa con Mercado Pago en pesos chilenos (CLP). El monto va directo a la cuenta de Mercado Pago del partner; Salvazion SpA, operadora de Mapucoin, retiene el 12% como comisión de plataforma en la misma transacción. El precio mostrado es el de la ficha al momento de pagar. Al reservar aceptas la política de cancelación del partner y los términos de Mercado Pago. Mapucoin no almacena números de tarjeta. Tus derechos como consumidor se rigen por la Ley 19.496.",
    },
    {
      heading: "5. Cancelaciones",
      body: "Las cancelaciones siguen la política indicada al reservar. Causas de fuerza mayor (clima, cierre de parque, erupción) las resuelve el partner. Las no-shows no se reembolsan, salvo que el partner indique lo contrario.",
    },
    {
      heading: "6. Conducta",
      body: "No uses la plataforma para fines ilegales, no falsees datos de una cápsula o un tour, y no eludas la comisión de Mapucoin ni los pagos por Mercado Pago. Partners: Lo que recibes es el total menos el 12% de Mapucoin y la comisión de Mercado Pago, y te lo mostramos en cada reserva.",
    },
    {
      heading: "7. Responsabilidad",
      body: "En la máxima medida permitida por la ley, Salvazion SpA no responde por daños derivados del uso de la plataforma o de un viaje operado por un partner. El partner es responsable de la prestación del servicio.",
    },
    {
      heading: "8. Ley aplicable",
      body: "Estos términos se rigen por las leyes de la República de Chile y los tribunales de Chile, sin perjuicio de derechos irrenunciables del consumidor en Chile. Contacto: info@salvazion.org.",
    },
    {
      heading: "9. Clave de acceso $SALVAZION",
      body: "Si Mapucoin habilita Mapucoin Premium, la clave $SALVAZION sirve únicamente para abrir ese acceso. Es una llave de acceso a la plataforma de viajes. No es una inversión, no genera retornos, intereses, dividendos ni participación, y Mapucoin no promete un precio, una apreciación ni un resultado financiero. El único beneficio del holder es el acceso Premium. Desactivar la función cierra ese acceso.",
    },
  ],
};

export const privacy = {
  title: "Política de Privacidad",
  intro:
    `Mapucoin Privacy Policy. Última actualización: ${PRIVACY_LAST_UPDATED}. Mapucoin es una plataforma de viajes operada por Salvazion SpA, RUT 78.462.349-1, Chile. Esta política describe qué datos tratamos en https://mapucoin.com. Al usar la plataforma aceptas esta política junto con los Términos.`,
  sections: [
    {
      heading: "1. Responsable",
      body: "Responsable: Salvazion SpA, RUT 78.462.349-1, sociedad por acciones chilena. Domicilio: Comuna de Algarrobo, Región de Valparaíso, Chile. Contacto: info@salvazion.org.",
    },
    {
      heading: "2. Datos que podemos recoger",
      body: "Según el uso: Nombre, correo, teléfono, destino, presupuesto, noches, viajeros e intereses del planificador; datos de reserva e identificador del pago; postulaciones de partners y, si vinculan Mercado Pago, su identificador de vendedor y credenciales de acceso cifradas; mensajes al concierge; cookies de sesión; y datos técnicos de seguridad (IP, navegador). Mercado Pago procesa el pago. No guardamos el número de la tarjeta ni el CVC. Tratamos los datos conforme a la Ley 19.628 y sus modificaciones.",
    },
    {
      heading: "3. Finalidades",
      body: "Operar reservas e itinerarios, mostrar partners en el mapa, responder consultas, prevenir abuso, cumplir obligaciones legales y mejorar el servicio.",
    },
    {
      heading: "4. Encargados",
      body: "Usamos Vercel (hosting), Supabase (base de datos), Mercado Pago (pagos y reparto al partner) y xAI (respuestas del planificador: El mensaje se envía solo para generar la respuesta). No vendemos datos personales para publicidad de terceros.",
    },
    {
      heading: "5. Conservación y derechos",
      body: "Conservamos datos mientras haya una reserva o cuenta, o lo exija la ley. Puedes pedir acceso, rectificación o eliminación a info@salvazion.org. Según tu jurisdicción, pueden aplicar derechos tipo GDPR o de California.",
    },
    {
      heading: "6. Transferencias y menores",
      body: "Salvazion SpA está en Chile. Proveedores pueden tratar datos en EE.UU. u otros países. La plataforma es para mayores de 18 años.",
    },
    {
      heading: "7. Cambios",
      body: "Podemos actualizar esta política publicando la nueva versión en esta URL. El uso continuado implica aceptación en la medida que permita la ley. Términos: /terminos.",
    },
  ],
};
