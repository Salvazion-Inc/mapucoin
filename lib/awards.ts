export type AwardOrg =
  | "World Travel Awards"
  | "Forbes Travel Awards"
  | "Tripadvisor Travelers' Choice Awards"
  | "The World's 50 Best Vineyards"
  | "TIME"
  | "UNESCO"
  | "DarkSky International"
  | "ALMA";

export type Award = {
  title: string;
  place?: string;
  years?: string;
  org: AwardOrg;
  note?: string;
};

export const awards: Award[] = [
  {
    title: "Mejor Destino de Turismo Aventura del Mundo",
    years: "2025",
    org: "World Travel Awards",
    note: "7ª vez",
  },
  {
    title: "Mejor Destino Romántico",
    place: "Desierto de Atacama",
    years: "2018–2025",
    org: "World Travel Awards",
  },
  {
    title: "Mejor Destino de Sudamérica",
    years: "2020 y 2022",
    org: "World Travel Awards",
  },
  {
    title: "Mejor Destino Verde",
    years: "2024–2025",
    org: "World Travel Awards",
  },
  {
    title: "Mejor Destino de Naturaleza",
    years: "2025",
    org: "World Travel Awards",
  },
  {
    title: "Mejor Ciudad",
    place: "Santiago",
    years: "2024",
    org: "World Travel Awards",
  },
  {
    title: "Mejor Destino de Cruceros",
    years: "2025",
    org: "World Travel Awards",
  },
  {
    title: "Mejor Destino Internacional",
    years: "2026",
    org: "Forbes Travel Awards",
  },
  {
    title: "Solo Travel — 4° mundial",
    place: "Santiago",
    years: "2026",
    org: "Tripadvisor Travelers' Choice Awards",
  },
  {
    title: "Top South American Destination",
    place: "Santiago / San Pedro de Atacama",
    years: "2026",
    org: "Tripadvisor Travelers' Choice Awards",
  },
  {
    title: "Reserva de la Biósfera",
    place: "Torres del Paine",
    years: "1978",
    org: "UNESCO",
    note: "Octava Maravilla del Mundo",
  },
  {
    title: "Reserva de la Biósfera",
    place: "Laguna San Rafael",
    years: "1979",
    org: "UNESCO",
  },
  {
    title: "Reserva de la Biósfera",
    place: "Cabo de Hornos",
    years: "2005",
    org: "UNESCO",
  },
  {
    title: "Reserva de la Biósfera",
    place: "La Campana–Peñuelas",
    years: "2025",
    org: "UNESCO",
    note: "Postulación a premio de gobernanza",
  },
  {
    title: "Mejor Viñedo del Mundo",
    place: "Viña Vik",
    years: "2025",
    org: "The World's 50 Best Vineyards",
  },
  {
    title: "World's Greatest Places",
    years: "2026",
    org: "TIME",
    note: "Estancia Mercedes (Magallanes), Pared Sur Camp (Aysén) y Ephedra Restaurant (Antofagasta)",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Parque Nacional Rapa Nui",
    years: "1995",
    org: "UNESCO",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Iglesias de Chiloé",
    years: "2000",
    org: "UNESCO",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Barrio histórico de Valparaíso",
    years: "2003",
    org: "UNESCO",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Oficinas salitreras de Humberstone y Santa Laura",
    years: "2005",
    org: "UNESCO",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Ciudad minera de Sewell",
    years: "2006",
    org: "UNESCO",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Qhapaq Ñan – Sistema Vial Andino",
    years: "2014",
    org: "UNESCO",
  },
  {
    title: "Patrimonio de la Humanidad",
    place: "Asentamiento y momificación de la cultura Chinchorro",
    years: "2021",
    org: "UNESCO",
  },
  {
    title: "Mejor lugar del mundo para observación de estrellas",
    place: "San Pedro de Atacama",
    org: "DarkSky International",
    note: "Astroturismo",
  },
  {
    title: "El radiotelescopio más grande del mundo",
    place: "San Pedro de Atacama",
    org: "ALMA",
  },
];
