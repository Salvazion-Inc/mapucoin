export type Region =
  | "Norte Grande"
  | "Norte Chico"
  | "Centro"
  | "Valle Central"
  | "Araucanía y Lagos"
  | "Patagonia"
  | "Rapa Nui"
  | "Pacífico";

export type PlaceKind = "place" | "capsule" | "food" | "activity";

export type CatalogItem = {
  slug: string;
  kind: PlaceKind;
  name: string;
  region: Region;
  city: string;
  lat: number;
  lng: number;
  image: string;
  gallery?: string[];
  youtube?: string;
  youtubeStart?: number;
  tagline: string;
  description: string;
  highlights: string[];
  priceFromCLP: number;
  nightsHint?: number;
  durationHours?: number;
  capacity?: number;
  tags: string[];
  placeSlug?: string;
};

const p = (file: string) => `/images/places/${file}`;

/** 4K travel film of Chile with chapters per territory. */
export const CHILE_FILM = "uHcjT4GfPNA";

export const destinations: CatalogItem[] = [
  {
    slug: "san-pedro-de-atacama",
    kind: "place",
    name: "San Pedro de Atacama",
    region: "Norte Grande",
    city: "San Pedro de Atacama",
    lat: -22.9087,
    lng: -68.1997,
    image: p("atacama-luna.jpg"),
    gallery: [p("atacama-pueblo.jpg"), p("atacama-dunas.jpg"), p("atacama-luna.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 263,
    tagline: "El desierto más árido y el cielo más limpio del planeta.",
    description:
      "Pueblo de adobe en el altiplano. Valle de la Luna, géiseres del Tatio, lagunas altiplánicas y astronomía de nivel mundial.",
    highlights: ["Valle de la Luna", "El Tatio", "Lagunas Miscanti y Miñiques"],
    priceFromCLP: 180000,
    tags: ["desierto", "estrellas", "cultura atacameña", "aventura"],
  },
  {
    slug: "valle-del-elqui",
    kind: "place",
    name: "Valle del Elqui",
    region: "Norte Chico",
    city: "Pisco Elqui",
    lat: -30.1272,
    lng: -70.4931,
    image: p("elqui.jpg"),
    gallery: [p("elqui-agua.jpg"), p("mamalluca.jpg"), p("pisco-elqui.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 1223,
    tagline: "Viñedos, pisco y observatorios bajo un cielo declarado santuario.",
    description:
      "Terrazas de uva moscatel, destilerías de pisco y observatorios abiertos al público. Ideal para descanso y astronomía.",
    highlights: ["Observatorio Mamalluca", "Pisco artesanal", "Pueblos de montaña"],
    priceFromCLP: 140000,
    tags: ["estrellas", "vino", "descanso", "gastronomía"],
  },
  {
    slug: "valparaiso",
    kind: "place",
    name: "Valparaíso",
    region: "Centro",
    city: "Valparaíso",
    lat: -33.0472,
    lng: -71.6127,
    image: p("valparaiso.jpg"),
    gallery: [p("valparaiso.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 1061,
    tagline: "Cerros, ascensores y murales frente al Pacífico.",
    description:
      "Patrimonio de la Humanidad. Cerros pintados, ascensores históricos, marisquerías y vida portuaria.",
    highlights: ["Cerro Alegre", "Caleta Portales", "Street art"],
    priceFromCLP: 120000,
    tags: ["cultura", "ciudad", "mar", "gastronomía"],
  },
  {
    slug: "santiago-and-maipo",
    kind: "place",
    name: "Santiago y Cajón del Maipo",
    region: "Centro",
    city: "Santiago",
    lat: -33.4489,
    lng: -70.6693,
    image: p("santiago.jpg"),
    gallery: [p("cajon.jpg"), p("mercado.jpg"), p("santiago.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 2936,
    tagline: "Capital andina: museos, viñas y montaña a una hora.",
    description:
      "Barrio Lastarria, Mercado Central, viñas del Maipo y el Cajón con glaciares, termas y trekking.",
    highlights: ["Cajón del Maipo", "Viña Concha y Toro", "Cerro San Cristóbal"],
    priceFromCLP: 110000,
    tags: ["ciudad", "vino", "montaña", "cultura"],
  },
  {
    slug: "pucon",
    kind: "place",
    name: "Pucón",
    region: "Araucanía y Lagos",
    city: "Pucón",
    lat: -39.2823,
    lng: -71.9545,
    image: p("villarrica.jpg"),
    gallery: [p("pucon.jpg"), p("termas.jpg"), p("villarrica.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 2309,
    tagline: "Volcán Villarrica, termas y bosque de araucarias.",
    description:
      "Capital de la aventura en el sur: trekking al volcán, hidrospeed, termas geometric y cultura mapuche.",
    highlights: ["Volcán Villarrica", "Termas Geométricas", "Lago Villarrica"],
    priceFromCLP: 160000,
    tags: ["aventura", "termas", "mapuche", "naturaleza"],
  },
  {
    slug: "puerto-varas",
    kind: "place",
    name: "Puerto Varas",
    region: "Araucanía y Lagos",
    city: "Puerto Varas",
    lat: -41.3195,
    lng: -72.9854,
    image: p("osorno.jpg"),
    gallery: [p("puerto-varas.jpg"), p("osorno.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 733,
    tagline: "Lago Llanquihue y los volcanes Osorno y Calbuco.",
    description:
      "Arquitectura alemana, kuchen, kayak al atardecer y salto Petrohué a los pies del Osorno.",
    highlights: ["Volcán Osorno", "Saltos del Petrohué", "Frutillar"],
    priceFromCLP: 150000,
    tags: ["lagos", "naturaleza", "gastronomía", "descanso"],
  },
  {
    slug: "chiloe",
    kind: "place",
    name: "Chiloé",
    region: "Araucanía y Lagos",
    city: "Castro",
    lat: -42.4825,
    lng: -73.764,
    image: p("palafitos.jpg"),
    gallery: [p("castro.jpg"), p("iglesia-castro.jpg"), p("palafitos.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 890,
    tagline: "Iglesias de madera, palafitos y mitología del archipiélago.",
    description:
      "Curanto en hoyo, iglesias UNESCO, pingüinos de Puñihuil y la niebla que cubre los palafitos de Castro.",
    highlights: ["Palafitos de Castro", "Curanto", "Pingüineras de Puñihuil"],
    priceFromCLP: 145000,
    tags: ["cultura", "gastronomía", "isla", "naturaleza"],
  },
  {
    slug: "torres-del-paine",
    kind: "place",
    name: "Torres del Paine",
    region: "Patagonia",
    city: "Puerto Natales",
    lat: -51.2538,
    lng: -72.3445,
    image: p("paine.jpg"),
    gallery: [p("paine-unsplash.jpg"), p("paine.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 64,
    tagline: "Granito, vientos y el parque más icónico de Sudamérica.",
    description:
      "Torres, Cuernos, Grey y el W. Base en Puerto Natales, glamping de lujo y trekking de clase mundial.",
    highlights: ["Base Torres", "Glaciar Grey", "Laguna Azul"],
    priceFromCLP: 280000,
    tags: ["patagonia", "trekking", "naturaleza", "aventura"],
  },
  {
    slug: "rapa-nui",
    kind: "place",
    name: "Rapa Nui",
    region: "Rapa Nui",
    city: "Hanga Roa",
    lat: -27.1127,
    lng: -109.3497,
    image: p("tongariki.jpg"),
    gallery: [p("rano-raraku.jpg"), p("easter.jpg"), p("tongariki.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 1384,
    tagline: "Moai, cráteres y el ombligo del mundo en el Pacífico.",
    description:
      "Parque Nacional Rapa Nui, ahu Tongariki al amanecer, Rano Kau y cultura ancestral polinésica.",
    highlights: ["Tongariki", "Rano Raraku", "Orongo"],
    priceFromCLP: 320000,
    tags: ["cultura", "isla", "patrimonio", "descanso"],
  },
  {
    slug: "carretera-austral",
    kind: "place",
    name: "Carretera Austral",
    region: "Patagonia",
    city: "Futaleufú",
    lat: -43.1856,
    lng: -71.8664,
    image: p("marmol.jpg"),
    gallery: [p("marmol.jpg"), p("paine.jpg")],
    youtube: CHILE_FILM,
    youtubeStart: 1693,
    tagline: "Ríos turquesa, hanging glaciers y el sur más salvaje.",
    description:
      "De Puerto Montt a Villa O'Higgins: Marble Caves, Queulat, Futaleufú y bosques siempreverdes.",
    highlights: ["Capillas de Mármol", "Futaleufú", "Parque Queulat"],
    priceFromCLP: 220000,
    tags: ["aventura", "naturaleza", "ruta", "patagonia"],
  },
];

export const capsules: CatalogItem[] = [
  {
    slug: "capsula-atacama-star",
    kind: "capsule",
    name: "Cápsula Atacama Star",
    region: "Norte Grande",
    city: "San Pedro de Atacama",
    lat: -22.921,
    lng: -68.241,
    image: "/images/capsula-atacama.jpg",
    tagline: "Techo de vidrio para la Vía Láctea. Climatización y Starlink.",
    description:
      "Cápsula de aluminio y cobre con cúpula acristalada, cama king, ducha de lluvia y climatización de desierto. A 12 minutos de San Pedro.",
    highlights: ["Techo estelar", "Aire acondicionado", "Desayuno atacameño"],
    priceFromCLP: 165000,
    nightsHint: 1,
    capacity: 2,
    tags: ["estrellas", "lujo", "tecnología"],
    placeSlug: "san-pedro-de-atacama",
  },
  {
    slug: "capsula-elqui-observatorio",
    kind: "capsule",
    name: "Cápsula Elqui Observatorio",
    region: "Norte Chico",
    city: "Pisco Elqui",
    lat: -30.141,
    lng: -70.501,
    image: "/images/capsula-elqui.jpg",
    tagline: "Viñedo, telescopio y atardecer violeta sobre el valle.",
    description:
      "Módulo inteligente en terraza de viña. Incluye sesión con telescopio, cata de pisco y deck con hamacas.",
    highlights: ["Telescopio", "Cata de pisco", "Viñedo privado"],
    priceFromCLP: 148000,
    nightsHint: 1,
    capacity: 2,
    tags: ["estrellas", "vino", "descanso"],
    placeSlug: "valle-del-elqui",
  },
  {
    slug: "capsula-araucaria",
    kind: "capsule",
    name: "Cápsula Araucaria",
    region: "Araucanía y Lagos",
    city: "Pucón",
    lat: -39.268,
    lng: -71.932,
    image: "/images/capsula-pucon.jpg",
    tagline: "Frente al Villarrica, con tinaja de cedro y bosque nativo.",
    description:
      "Madera, cobre y ventanal panorámico. Tinaja climatizada, cocina smart y acceso a senderos de araucarias.",
    highlights: ["Tinaja", "Vista al volcán", "Bosque nativo"],
    priceFromCLP: 172000,
    nightsHint: 1,
    capacity: 3,
    tags: ["termas", "naturaleza", "aventura"],
    placeSlug: "pucon",
  },
  {
    slug: "capsula-palafito",
    kind: "capsule",
    name: "Cápsula Palafito",
    region: "Araucanía y Lagos",
    city: "Castro",
    lat: -42.479,
    lng: -73.771,
    image: "/images/capsula-chiloe.jpg",
    tagline: "Sobre el fiordo, inspirada en los palafitos chilotes.",
    description:
      "Cápsula sobre pilotes con vista al canal. Calefacción por bomba de calor, lana chilota y desayuno de mar.",
    highlights: ["Sobre el agua", "Lana chilota", "Amanecer en el canal"],
    priceFromCLP: 138000,
    nightsHint: 1,
    capacity: 2,
    tags: ["isla", "cultura", "descanso"],
    placeSlug: "chiloe",
  },
  {
    slug: "capsula-paine",
    kind: "capsule",
    name: "Cápsula Paine",
    region: "Patagonia",
    city: "Puerto Natales",
    lat: -51.21,
    lng: -72.41,
    image: "/images/capsula-paine.jpg",
    tagline: "Granito de las Torres desde la cama, con calefacción de alta cota.",
    description:
      "Cápsula de lujo aislada para viento patagónico. Panorámica a las Torres, ducha de presión y transferencia al parque.",
    highlights: ["Vista Torres", "Aislación térmica", "Transfer al parque"],
    priceFromCLP: 248000,
    nightsHint: 1,
    capacity: 2,
    tags: ["patagonia", "lujo", "trekking"],
    placeSlug: "torres-del-paine",
  },
];

export const gastronomy: CatalogItem[] = [
  {
    slug: "curanto-chilote",
    kind: "food",
    name: "Curanto en hoyo",
    region: "Araucanía y Lagos",
    city: "Castro",
    lat: -42.48,
    lng: -73.76,
    image: p("curanto.jpg"),
    tagline: "Mariscos, carne y milcao cocidos bajo tierra con nalca.",
    description:
      "Ritual chilote: hoyo, piedras calientes, chapaleles y mariscos del canal. Experiencia con familia local.",
    highlights: ["Cocción ancestral", "Mariscos del canal", "Mesa compartida"],
    priceFromCLP: 28000,
    durationHours: 3,
    tags: ["chilote", "mariscos", "ancestral"],
    placeSlug: "chiloe",
  },
  {
    slug: "asado-patagonico",
    kind: "food",
    name: "Asado patagónico al palo",
    region: "Patagonia",
    city: "Puerto Natales",
    lat: -51.73,
    lng: -72.5,
    image: p("asado.jpg"),
    tagline: "Cordero magallánico a fuego lento, con calafate.",
    description:
      "Cordero de estancia, chimichurri de merken y vino del Maule. Cena a la luz del atardecer austral.",
    highlights: ["Cordero al palo", "Calafate", "Estancia"],
    priceFromCLP: 42000,
    durationHours: 3,
    tags: ["patagonia", "carne", "vino"],
    placeSlug: "torres-del-paine",
  },
  {
    slug: "cocina-mapuche",
    kind: "food",
    name: "Cocina mapuche de fogón",
    region: "Araucanía y Lagos",
    city: "Pucón",
    lat: -39.29,
    lng: -71.94,
    image: p("pucon.jpg"),
    tagline: "Merkén, catuto, yuyo y muday en ruka.",
    description:
      "Almuerzo en ruka con productoras locales. Relato de territorio, hierbas del volcán y pan de trigo candeal.",
    highlights: ["Ruka", "Merkén", "Productoras locales"],
    priceFromCLP: 24000,
    durationHours: 2,
    tags: ["mapuche", "ancestral", "vegetal"],
    placeSlug: "pucon",
  },
  {
    slug: "mariscal-valpo",
    kind: "food",
    name: "Mariscal del puerto",
    region: "Centro",
    city: "Valparaíso",
    lat: -33.036,
    lng: -71.628,
    image: p("machas.jpg"),
    tagline: "Locos, machas y erizos recién desembarcados.",
    description:
      "Caleta con vista a los cerros. Machas a la parmesana, ceviche de reineta y vino del Casablanca.",
    highlights: ["Caleta", "Machas", "Casablanca"],
    priceFromCLP: 22000,
    durationHours: 2,
    tags: ["mariscos", "puerto", "vino"],
    placeSlug: "valparaiso",
  },
  {
    slug: "pisco-elqui",
    kind: "food",
    name: "Ruta del pisco y el vino",
    region: "Norte Chico",
    city: "Pisco Elqui",
    lat: -30.126,
    lng: -70.495,
    image: p("pisco.jpg"),
    tagline: "Destilerías de moscatel y viñas de altura.",
    description:
      "Tres paradas: destilería familiar, viña de altura y pisco sour con limón de pica.",
    highlights: ["Destilería", "Cata", "Pisco sour"],
    priceFromCLP: 32000,
    durationHours: 4,
    tags: ["pisco", "vino", "cata"],
    placeSlug: "valle-del-elqui",
  },
  {
    slug: "mercado-central",
    kind: "food",
    name: "Mercado Central y Lastarria",
    region: "Centro",
    city: "Santiago",
    lat: -33.437,
    lng: -70.651,
    image: p("mercado.jpg"),
    tagline: "Paila marina, empanadas de horno y bar de vinos.",
    description:
      "Recorrido entre pescaderías, pastel de choclo y un cierre en Lastarria con carmenère.",
    highlights: ["Paila marina", "Empanadas", "Carmenère"],
    priceFromCLP: 18000,
    durationHours: 3,
    tags: ["ciudad", "mercado", "vino"],
    placeSlug: "santiago-and-maipo",
  },
];

export const activities: CatalogItem[] = [
  {
    slug: "valle-de-la-luna",
    kind: "activity",
    name: "Atardecer en Valle de la Luna",
    region: "Norte Grande",
    city: "San Pedro de Atacama",
    lat: -22.9147,
    lng: -68.2874,
    image: p("atacama-luna.jpg"),
    tagline: "Dunas, salar y el sol cayendo sobre el Licancabur.",
    description:
      "Caminata guiada por formaciones de sal y yeso. Cupo reducido, hidratación y traslado.",
    highlights: ["Licancabur", "Dunas", "Guía local"],
    priceFromCLP: 35000,
    durationHours: 4,
    tags: ["desierto", "atardecer", "fotografía"],
    placeSlug: "san-pedro-de-atacama",
  },
  {
    slug: "astronomia-atacama",
    kind: "activity",
    name: "Noche astronómica en el desierto",
    region: "Norte Grande",
    city: "San Pedro de Atacama",
    lat: -22.95,
    lng: -68.18,
    image: p("mamalluca.jpg"),
    tagline: "Telescopios, Vía Láctea y relato andino del cielo.",
    description:
      "Observatorio de campo. Saturno, cúmulos y un mate bajo las estrellas.",
    highlights: ["Telescopio", "Vía Láctea", "Relato andino"],
    priceFromCLP: 42000,
    durationHours: 3,
    tags: ["estrellas", "ciencia", "noche"],
    placeSlug: "san-pedro-de-atacama",
  },
  {
    slug: "volcan-villarrica",
    kind: "activity",
    name: "Ascenso al volcán Villarrica",
    region: "Araucanía y Lagos",
    city: "Pucón",
    lat: -39.4208,
    lng: -71.9397,
    image: p("villarrica.jpg"),
    tagline: "Cráter activo, crampones y vista a los lagos.",
    description:
      "Salida de madrugada con guía UIAGM, equipo técnico y descenso en nieve.",
    highlights: ["Cráter", "Guía certificado", "Equipo incluido"],
    priceFromCLP: 145000,
    durationHours: 10,
    tags: ["aventura", "volcán", "trekking"],
    placeSlug: "pucon",
  },
  {
    slug: "termas-geometricas",
    kind: "activity",
    name: "Termas Geométricas",
    region: "Araucanía y Lagos",
    city: "Coñaripe",
    lat: -39.507,
    lng: -71.888,
    image: p("termas.jpg"),
    tagline: "Pasarelas rojas, pozones de agua volcánica y bosque.",
    description:
      "Día de termas en quebrada nativa. Traslado desde Pucón y almuerzo ligero.",
    highlights: ["Pozones", "Bosque", "Arquitectura"],
    priceFromCLP: 48000,
    durationHours: 7,
    tags: ["termas", "descanso", "bosque"],
    placeSlug: "pucon",
  },
  {
    slug: "w-paine",
    kind: "activity",
    name: "Día en Base Torres",
    region: "Patagonia",
    city: "Puerto Natales",
    lat: -50.942,
    lng: -72.959,
    image: p("paine.jpg"),
    tagline: "El trekking clásico hasta las tres torres de granito.",
    description:
      "Sendero de 22 km con guía, picnic y entrada al parque. Condición media-alta.",
    highlights: ["Mirador Torres", "Guía", "Picnic"],
    priceFromCLP: 98000,
    durationHours: 11,
    tags: ["trekking", "patagonia", "aventura"],
    placeSlug: "torres-del-paine",
  },
  {
    slug: "kayak-llanquihue",
    kind: "activity",
    name: "Kayak al atardecer en Llanquihue",
    region: "Araucanía y Lagos",
    city: "Puerto Varas",
    lat: -41.31,
    lng: -72.98,
    image: p("osorno.jpg"),
    tagline: "Osorno reflejado en el lago, en kayak silencioso.",
    description:
      "Salida de 2 horas con chaleco, guía y chocolate caliente al volver.",
    highlights: ["Osorno", "Atardecer", "Kayak"],
    priceFromCLP: 32000,
    durationHours: 2,
    tags: ["lagos", "kayak", "atardecer"],
    placeSlug: "puerto-varas",
  },
  {
    slug: "cerros-valpo",
    kind: "activity",
    name: "Cerros, murales y ascensores",
    region: "Centro",
    city: "Valparaíso",
    lat: -33.045,
    lng: -71.622,
    image: p("valparaiso.jpg"),
    tagline: "Alegre, Concepción y el puerto con guía local.",
    description:
      "Caminata urbana de 3 horas: street art, miradores y una copa en café de cerro.",
    highlights: ["Street art", "Ascensores", "Miradores"],
    priceFromCLP: 18000,
    durationHours: 3,
    tags: ["cultura", "ciudad", "arte"],
    placeSlug: "valparaiso",
  },
  {
    slug: "tongariki-amanecer",
    kind: "activity",
    name: "Amanecer en Tongariki",
    region: "Rapa Nui",
    city: "Hanga Roa",
    lat: -27.125,
    lng: -109.277,
    image: p("tongariki.jpg"),
    tagline: "Quince moai contra el sol del Pacífico.",
    description:
      "Salida de madrugada con guía rapanui, desayuno y visita a Rano Raraku.",
    highlights: ["Moai", "Amanecer", "Guía rapanui"],
    priceFromCLP: 65000,
    durationHours: 5,
    tags: ["cultura", "amanecer", "patrimonio"],
    placeSlug: "rapa-nui",
  },
];

export const allItems: CatalogItem[] = [
  ...destinations,
  ...capsules,
  ...gastronomy,
  ...activities,
];

export const regions: Region[] = [
  "Norte Grande",
  "Norte Chico",
  "Centro",
  "Valle Central",
  "Araucanía y Lagos",
  "Patagonia",
  "Rapa Nui",
  "Pacífico",
];

export const interests = [
  { id: "naturaleza", label: "Naturaleza" },
  { id: "gastronomia", label: "Gastronomía" },
  { id: "cultura", label: "Cultura" },
  { id: "aventura", label: "Aventura" },
  { id: "descanso", label: "Descanso" },
  { id: "estrellas", label: "Astronomía" },
] as const;

export function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function getBySlug(slug: string) {
  return allItems.find((i) => i.slug === slug);
}

export function itemsForPlace(placeSlug: string) {
  return allItems.filter(
    (i) => i.slug === placeSlug || i.placeSlug === placeSlug,
  );
}

export function capsulesForPlace(placeSlug: string) {
  return capsules.filter((c) => c.placeSlug === placeSlug);
}

export function mapPoints() {
  return [
    ...destinations.map((d) => ({
      ...d,
      group: "place" as const,
    })),
    ...capsules.map((c) => ({
      ...c,
      group: "capsule" as const,
    })),
  ];
}
