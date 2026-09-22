/** Real companies from the public Sernatur service directory.
 * The directory lists the business, not a tariff. */
export type ServiceOperator = {
  name: string;
  url: string;
  service: string;
};

const listing = (path: string) =>
  `https://serviciosturisticos.sernatur.cl${path}`;

const row = (name: string, path: string, service: string): ServiceOperator => ({
  name,
  url: listing(path),
  service,
});

export const operators: Record<string, ServiceOperator> = {
  "astronomia-atacama": row(
    "Atacama Desert Stargazing",
    "/38856-atacama-desert-stargazing",
    "Tour operador",
  ),
  "sandboard-atacama": row(
    "Sandboard San Pedro",
    "/17801-sandboard-san-pedro",
    "Sandboard",
  ),
  "buceo-punta-choros": row(
    "Buceo Humboldt",
    "/21401-buceo-humboldt",
    "Buceo recreativo",
  ),
  "surf-pichilemu": row(
    "Escuela de surf Pichilemu",
    "/18777-escuela-de-surf-pichilemu",
    "Surf",
  ),
  "cata-colchagua": row(
    "Colchagua Andes Experience",
    "/23667-colchagua-andes-experience",
    "Tour operador",
  ),
  "volcan-villarrica": row(
    "Aguaventura",
    "/4235-ascension-volcan-villarrica-aguaventura",
    "Ascenso al Villarrica",
  ),
  "rafting-futaleufu": row(
    "Rafting Futaleufú",
    "/15199-rafting-futaleufu",
    "Rafting",
  ),
  "nautico-llanquihue": row(
    "Ko'KayaK",
    "/11481-kokayak",
    "Canotaje",
  ),
  "tour-bosque-chiloe": row(
    "Chiloétnico",
    "/10101-chiloetnico",
    "Senderismo",
  ),
  "trekking-la-campana": row(
    "Olmué Nómade Aventura",
    "/18406-olmue-nomade-aventura",
    "Trekking",
  ),
  "ski-valle-nevado": row(
    "Hotel Valle Nevado",
    "/6262-hotel-valle-nevado",
    "Hotel y centro de ski",
  ),
  "snowboard-chillan": row(
    "Nevados de Chillán — Centro de Ski",
    "/7940-nevados-de-chillan---centro-de-ski",
    "Centro de ski",
  ),
  "geiseres-el-tatio": row(
    "Atacama Magic",
    "/29702-atacama-magic",
    "Tour operador",
  ),
  "cata-elqui": row(
    "República Elqui",
    "/85127-republica-elqui",
    "Tour operador",
  ),
  "navegacion-marmol": row(
    "Marmol Expediciones",
    "/22607-marmol-expediciones",
    "Paseos náuticos",
  ),
  "sendero-alerce-chiloe": row(
    "Chiloé Natural",
    "/16831-chiloe-natural",
    "Trekking",
  ),
  "ski-la-parva": row("La Parva", "/19927-la-parva", "Centro de ski"),
  "sendero-conguillio": row(
    "Amulen Expediciones",
    "/94010-sierra-nevada-conguillio---amulen-expediciones",
    "Trekking en Conguillío",
  ),
  "cueva-del-milodon": row(
    "Rutas Smilodon",
    "/57851-rutas-smilodon",
    "Trekking",
  ),
  "valle-de-la-luna": row(
    "Desert Tour Atacama",
    "/56230-desert-tour-atacama-spa",
    "Tour operador",
  ),
  "w-paine": row(
    "Torres del Paine Adventure",
    "/83565-torres-del-paine-adventure",
    "Senderismo",
  ),
  "tongariki-amanecer": row(
    "Explora Rapa Nui",
    "/35738-explora-rapa-nui",
    "Senderismo",
  ),
  "curanto-chilote": row(
    "Fogón-agroturismo La Pincoya",
    "/8906-fogon-agroturismo-la-pincoya",
    "Restaurante",
  ),
  "asado-patagonico": row(
    "El Asador — The Singular Patagonia",
    "/8658-el-asador---the-singular-patagonia",
    "Restaurante",
  ),
  "cocina-mapuche": row(
    "Yafutuwe Ruka",
    "/86067-yafutuwe-ruka-cafeteria-mapuche",
    "Cocina mapuche",
  ),
  "mariscal-valpo": row(
    "El mercado for the Voyager",
    "/47726-el-mercado-for-the-voyager",
    "Restaurante",
  ),
  "mariscal": row(
    "El mercado for the Voyager",
    "/47726-el-mercado-for-the-voyager",
    "Restaurante",
  ),
  "pisco-elqui": row(
    "Espíritu del Fuego",
    "/75605-espiritu-del-fuego",
    "Restaurante",
  ),
  "pastelitos-curacavi": row(
    "Los Hornitos de Curacaví",
    "/20866-los-hornitos-de-curacavi",
    "Restaurante",
  ),
  "pastel-de-choclo": row(
    "Café de la Viña",
    "/5058-cafe-de-la-vina",
    "Viña Viu Manent",
  ),
  humitas: row(
    "Con pala y Cuchara56",
    "/66947-con-pala-y-cuchara56",
    "Restaurante",
  ),
  "porotos-granados": row(
    "Con pala y Cuchara56",
    "/66947-con-pala-y-cuchara56",
    "Restaurante",
  ),
  "caldillo-de-congrio": row(
    "Restaurant O'Higgins Valparaíso",
    "/4147-restaurant-ohiggins-valparaiso",
    "Restaurante",
  ),
  "pastel-de-centolla": row("Factoría", "/18533-factoria", "Restaurante"),
  chorrillana: row(
    "Restaurant O'Higgins Valparaíso",
    "/4147-restaurant-ohiggins-valparaiso",
    "Restaurante",
  ),
};

export function operatorFor(slug: string) {
  return operators[slug];
}
