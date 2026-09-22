import data from "./park-passes.json";

export type ParkFare = {
  adult: number;
  youth: number;
  child: number;
  senior: number;
  disability: number;
};

export type ParkPass = {
  slug: string;
  name: string;
  buyUrl: string;
  internalId: number;
  day: { national: ParkFare; foreign: ParkFare };
  stay?: { national: ParkFare; foreign: ParkFare };
  sector?: "campana" | "patagonia";
};

export const PARK_PASSES_FETCHED_AT = data.fetchedAt;
export const PARKS_PASS_SOURCE = data.source;

const passes = data.passes as ParkPass[];
const bySlug = new Map(passes.map((p) => [p.slug, p]));

/** Parks a destination always visits. Other parks enter via the itinerary. */
const PLACE_PARKS: Record<string, string[]> = {
  "san-pedro-de-atacama": ["rn-los-flamencos"],
  pucon: ["pn-villarrica"],
  "puerto-varas": ["pn-vicente-perez-rosales"],
  osorno: ["pn-vicente-perez-rosales"],
  chiloe: ["pn-chiloe"],
  "torres-del-paine": ["torres-del-paine"],
  "siete-tazas": ["siete-tazas"],
  "juan-fernandez": ["juan-fernandez"],
  olmue: ["pn-la-campana"],
  concepcion: ["pn-nonguen"],
  "cajon-del-maipo": ["mn-el-morado"],
  "carretera-austral": ["pn-queulat"],
};

const ACTIVITY_PARK: Record<string, { park: string; includesEntry: boolean }> =
  {
    "volcan-villarrica": { park: "pn-villarrica", includesEntry: false },
    "sendero-conguillio": { park: "pn-conguillio", includesEntry: true },
    "sendero-huerquehue": { park: "pn-huerquehue", includesEntry: true },
    "cueva-del-milodon": { park: "mn-cueva-del-milodon", includesEntry: false },
    "w-paine": { park: "torres-del-paine", includesEntry: true },
    "trekking-la-campana": { park: "pn-la-campana", includesEntry: true },
    "kayak-siete-tazas": { park: "siete-tazas", includesEntry: true },
    "valle-de-la-luna": { park: "rn-los-flamencos", includesEntry: false },
    "barco-peulla": { park: "pn-vicente-perez-rosales", includesEntry: false },
  };

export function getParkPass(slug: string) {
  return bySlug.get(slug);
}

export function adultNationalCLP(slug: string) {
  return bySlug.get(slug)?.day.national.adult;
}

export function passesForPlace(placeSlug: string) {
  const slugs = new Set(PLACE_PARKS[placeSlug] || []);
  if (bySlug.has(placeSlug)) slugs.add(placeSlug);
  return [...slugs]
    .map((slug) => bySlug.get(slug))
    .filter((p): p is ParkPass => Boolean(p));
}

export type QuotedPass = {
  buyUrl: string;
  guests: number;
  perGuestCLP: number;
  adultNationalCLP: number;
  youthNationalCLP: number;
  childNationalCLP: number;
  seniorNationalCLP: number;
  disabilityNationalCLP: number;
  adultForeignCLP: number;
  youthForeignCLP: number;
  seniorForeignCLP: number;
  dayAdultNationalCLP: number;
  multiDay: boolean;
  sector?: "campana" | "patagonia";
};

type QuoteItem = {
  type: string;
  name: string;
  slug?: string;
  costCLP: number;
  note: string;
  pass?: QuotedPass;
};

type QuotePlan = {
  days: { day: number; title: string; items: QuoteItem[] }[];
  nights: number;
  guests: number;
  budgetCLP: number;
  totals: {
    stay: number;
    food: number;
    activities: number;
    tickets: number;
    total: number;
    remaining: number;
  };
};

function quotePass(pass: ParkPass, nights: number, guests: number): QuotedPass {
  const multiDay = Boolean(pass.stay) && nights >= 2;
  const band = multiDay && pass.stay ? pass.stay : pass.day;
  return {
    buyUrl: pass.buyUrl,
    guests,
    perGuestCLP: band.national.adult,
    adultNationalCLP: band.national.adult,
    youthNationalCLP: band.national.youth,
    childNationalCLP: band.national.child,
    seniorNationalCLP: band.national.senior,
    disabilityNationalCLP: band.national.disability,
    adultForeignCLP: band.foreign.adult,
    youthForeignCLP: band.foreign.youth,
    seniorForeignCLP: band.foreign.senior,
    dayAdultNationalCLP: pass.day.national.adult,
    multiDay,
    sector: pass.sector,
  };
}

export function applyOfficialPasses<T extends QuotePlan>(
  plan: T,
  placeSlug: string,
): T {
  const nights = Math.max(1, Number(plan.nights) || 1);
  const guests = Math.max(1, Number(plan.guests) || 1);
  plan.days = plan.days || [];
  const wanted = new Map<string, ParkPass>();
  for (const pass of passesForPlace(placeSlug)) wanted.set(pass.slug, pass);

  for (const day of plan.days || []) {
    for (const item of day.items || []) {
      if (!item.slug) continue;
      const direct = bySlug.get(item.slug);
      if (direct) wanted.set(direct.slug, direct);
      const activity = ACTIVITY_PARK[item.slug];
      const linked = activity ? bySlug.get(activity.park) : undefined;
      if (linked) wanted.set(linked.slug, linked);
    }
  }

  for (const day of plan.days || []) {
    day.items = (day.items || []).filter((item) => item.type !== "ticket");
  }

  for (const day of plan.days || []) {
    for (const item of day.items) {
      const activity = item.slug ? ACTIVITY_PARK[item.slug] : undefined;
      if (!activity?.includesEntry) continue;
      const pass = wanted.get(activity.park);
      if (!pass) continue;
      item.costCLP = Math.max(
        0,
        (Number(item.costCLP) || 0) - pass.day.national.adult,
      );
    }
  }

  for (const pass of wanted.values()) {
    const quoted = quotePass(pass, nights, guests);
    const ticket: QuoteItem = {
      type: "ticket",
      name: pass.name,
      slug: pass.slug,
      costCLP: quoted.perGuestCLP * guests,
      note: "",
      pass: quoted,
    };
    const day =
      plan.days.find((entry) =>
        entry.items.some((item) => {
          const activity = item.slug ? ACTIVITY_PARK[item.slug] : undefined;
          return activity?.park === pass.slug || item.slug === pass.slug;
        }),
      ) || plan.days[0];
    if (!day) continue;
    const stayAt = day.items.findIndex((item) => item.type === "stay");
    day.items.splice(stayAt >= 0 ? stayAt + 1 : 0, 0, ticket);
  }

  let stay = 0;
  let food = 0;
  let activities = 0;
  let tickets = 0;
  for (const day of plan.days || []) {
    for (const item of day.items) {
      const cost = Number(item.costCLP) || 0;
      if (item.type === "stay") stay += cost;
      else if (item.type === "food") food += cost;
      else if (item.type === "activity") activities += cost;
      else if (item.type === "ticket") tickets += cost;
    }
  }
  const total = stay + food + activities + tickets;
  plan.totals = {
    stay,
    food,
    activities,
    tickets,
    total,
    remaining: plan.budgetCLP - total,
  };
  return plan;
}
