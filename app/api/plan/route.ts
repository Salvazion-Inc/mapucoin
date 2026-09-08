import {
  activities,
  capsules,
  destinations,
  gastronomy,
  getBySlug,
} from "@/lib/catalog";
import { localeMeta, parseLocale } from "@/lib/locale";

export const runtime = "nodejs";

function catalogFor(placeSlug: string) {
  const place = destinations.find((d) => d.slug === placeSlug);
  const caps = capsules.filter(
    (c) => c.placeSlug === placeSlug || !placeSlug,
  );
  const food = gastronomy.filter((g) => g.placeSlug === placeSlug);
  const acts = activities.filter((a) => a.placeSlug === placeSlug);
  return { place, caps, food, acts };
}

function fallbackPlan(input: {
  lugar: string;
  presupuesto: number;
  noches: number;
  viajeros: number;
  intereses: string[];
}) {
  const { place, caps, food, acts } = catalogFor(input.lugar);
  const dest = place || destinations[0];
  const stay = caps[0] || capsules[0];
  const stayTotal = stay.priceFromCLP * input.noches;
  const meals = food.slice(0, Math.min(3, input.noches));
  const chosenActs = acts.slice(0, Math.max(1, Math.min(3, input.noches)));
  const foodTotal = meals.reduce((s, m) => s + m.priceFromCLP, 0);
  const actTotal = chosenActs.reduce((s, a) => s + a.priceFromCLP, 0);
  const total = stayTotal + foodTotal + actTotal;
  const days = Array.from({ length: input.noches }, (_, i) => {
    const items = [];
    if (i === 0) {
      items.push({
        type: "stay" as const,
        name: stay.name,
        slug: stay.slug,
        costCLP: stay.priceFromCLP,
        note: stay.tagline,
      });
      items.push({
        type: "place" as const,
        name: dest.name,
        slug: dest.slug,
        costCLP: 0,
        note: "Llegada y orientación en el territorio.",
      });
    } else {
      items.push({
        type: "stay" as const,
        name: stay.name,
        slug: stay.slug,
        costCLP: stay.priceFromCLP,
        note: "Noche en cápsula tecnológica.",
      });
    }
    const meal = meals[i % Math.max(meals.length, 1)];
    if (meal) {
      items.push({
        type: "food" as const,
        name: meal.name,
        slug: meal.slug,
        costCLP: meal.priceFromCLP,
        note: meal.tagline,
      });
    }
    const act = chosenActs[i % Math.max(chosenActs.length, 1)];
    if (act && i < chosenActs.length) {
      items.push({
        type: "activity" as const,
        name: act.name,
        slug: act.slug,
        costCLP: act.priceFromCLP,
        note: act.tagline,
      });
    }
    return {
      day: i + 1,
      title: i === 0 ? `Llegada a ${dest.city}` : `Día en ${dest.name}`,
      items,
    };
  });

  return {
    title: `${input.noches} noches en ${dest.name}`,
    summary: dest.description,
    destination: dest.name,
    nights: input.noches,
    guests: input.viajeros,
    budgetCLP: input.presupuesto,
    days,
    totals: {
      stay: stayTotal,
      food: foodTotal,
      activities: actTotal,
      total,
      remaining: input.presupuesto - total,
    },
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const lugar = String(body.lugar || destinations[0].slug);
  const presupuesto = Number(body.presupuesto) || 800000;
  const noches = Math.min(21, Math.max(1, Number(body.noches) || 4));
  const viajeros = Math.min(8, Math.max(1, Number(body.viajeros) || 2));
  const intereses: string[] = String(body.intereses || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const language = localeMeta[parseLocale(body.locale)].replyLanguage;

  const { place, caps, food, acts } = catalogFor(lugar);
  const dest = place || getBySlug(lugar) || destinations[0];

  const catalogJson = JSON.stringify({
    destino: dest,
    capsulas: caps,
    gastronomia: food,
    actividades: acts,
  });

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return Response.json({
      plan: fallbackPlan({
        lugar,
        presupuesto,
        noches,
        viajeros,
        intereses,
      }),
      source: "catalog",
    });
  }

  const system = `Eres el concierge de Mapucoin, plataforma turística de Chile (mapucoin.com).
Mapu es tierra. Armas viajes reales con cápsulas tecnológicas para dormir, gastronomía local y actividades.
Moneda: CLP. Nunca inventes lugares fuera del catálogo JSON. Usa slugs del catálogo.
Responde SOLO JSON válido con esta forma:
{
  "title": string,
  "summary": string,
  "destination": string,
  "nights": number,
  "guests": number,
  "budgetCLP": number,
  "days": [{"day": number, "title": string, "items": [{"type": "stay"|"food"|"activity"|"place", "name": string, "slug": string, "costCLP": number, "note": string}]}],
  "totals": {"stay": number, "food": number, "activities": number, "total": number, "remaining": number}
}
El total no debe superar el presupuesto. Prefiere una cápsula todas las noches. Incluye al menos una experiencia gastronómica y una actividad. Write title, summary, day titles and notes in ${language}. Keep place names in Spanish. Tono cálido y concreto.`;

  const user = `Destino: ${dest.name} (${lugar})
Presupuesto: ${presupuesto} CLP
Noches: ${noches}
Viajeros: ${viajeros}
Intereses: ${intereses.join(", ") || "naturaleza, gastronomía"}
Catálogo:
${catalogJson}`;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4.6",
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const credits =
      /credits|spending limit|permission-denied/i.test(errText);
    return Response.json({
      plan: fallbackPlan({
        lugar,
        presupuesto,
        noches,
        viajeros,
        intereses,
      }),
      source: "catalog",
      grok: credits ? "credits" : "error",
    });
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  try {
    const plan = JSON.parse(match ? match[0] : text);
    return Response.json({ plan, source: "grok" });
  } catch {
    return Response.json({
      plan: fallbackPlan({
        lugar,
        presupuesto,
        noches,
        viajeros,
        intereses,
      }),
      source: "catalog",
    });
  }
}
