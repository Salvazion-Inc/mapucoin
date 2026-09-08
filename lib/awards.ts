export type AwardOrg =
  | "World Travel Awards"
  | "Forbes Travel Awards"
  | "Tripadvisor Travelers' Choice Awards"
  | "UNESCO";

export type Award = {
  title: string;
  place?: string;
  years: string;
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
];
