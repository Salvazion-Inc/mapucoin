import { destinations, getBySlug, planCatalog, type CatalogItem } from "@/lib/catalog";
import { localeMeta, parseLocale } from "@/lib/locale";
import { trimToBudget, type BudgetPlan } from "@/lib/plan-budget";
import { applyOfficialPasses } from "@/lib/park-passes";

export const runtime = "nodejs";

function fallbackPlan(input: {
  lugar: string;
  presupuesto: number;
  noches: number;
  viajeros: number;
  intereses: string[];
}) {
  const { place, stay, food, acts } = planCatalog(input.lugar);
  const dest = place;
  let room = Math.max(0, Math.round(input.presupuesto));
  const nightPrice = stay?.priceFromCLP || 0;
  const stayNights =
    nightPrice > 0 ? Math.min(input.noches, Math.floor(room / nightPrice)) : 0;
  room -= stayNights * nightPrice;
  const meals: CatalogItem[] = [];
  for (const meal of food) {
    if (meals.length >= input.noches) break;
    if (meal.priceFromCLP <= room) {
      meals.push(meal);
      room -= meal.priceFromCLP;
    }
  }
  const chosenActs: CatalogItem[] = [];
  for (const act of acts) {
    if (chosenActs.length >= input.noches) break;
    if (act.priceFromCLP <= room) {
      chosenActs.push(act);
      room -= act.priceFromCLP;
    }
  }
  const stayTotal = stayNights * nightPrice;
  const foodTotal = meals.reduce((s, m) => s + m.priceFromCLP, 0);
  const actTotal = chosenActs.reduce((s, a) => s + a.priceFromCLP, 0);
  const total = stayTotal + foodTotal + actTotal;
  const dayCount = Math.max(stayNights, meals.length, chosenActs.length, 1);
  const days = Array.from({ length: dayCount }, (_, i) => {
    const items = [];
    if (i === 0) {
      items.push({
        type: "place" as const,
        name: dest.name,
        slug: dest.slug,
        costCLP: 0,
        note: "Llegada y orientación en el territorio.",
      });
    }
    if (stay && i < stayNights) {
      items.push({
        type: "stay" as const,
        name: stay.name,
        slug: stay.slug,
        costCLP: stay.priceFromCLP,
        note: stay.tagline,
      });
    }
    const meal = meals[i];
    if (meal) {
      items.push({
        type: "food" as const,
        name: meal.name,
        slug: meal.slug,
        costCLP: meal.priceFromCLP,
        note: meal.tagline,
      });
    }
    const act = chosenActs[i];
    if (act) {
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
    title: `${stayNights || input.noches} noches en ${dest.name}`,
    summary: dest.description,
    destination: dest.name,
    nights: stayNights || input.noches,
    guests: input.viajeros,
    budgetCLP: input.presupuesto,
    days,
    totals: {
      stay: stayTotal,
      food: foodTotal,
      activities: actTotal,
      tickets: 0,
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

  const packed = planCatalog(lugar);
  const dest = packed.place || getBySlug(lugar) || destinations[0];
  const caps = packed.stay ? [packed.stay] : [];
  const food = packed.food;
  const acts = packed.acts;

  const catalogJson = JSON.stringify({
    destino: dest,
    paisaje: packed.land,
    capsulas: caps,
    gastronomia: food,
    actividades: acts,
  });

  const key = process.env.XAI_API_KEY;
  const quoted = (plan: ReturnType<typeof fallbackPlan>) => {
    for (const day of plan.days || []) {
      for (const item of day.items || []) {
        if (!item.slug) continue;
        if (item.type !== "stay" && item.type !== "food" && item.type !== "activity") {
          continue;
        }
        const cat = getBySlug(item.slug);
        const kind =
          item.type === "stay" ? "capsule" : item.type === "food" ? "food" : "activity";
        item.costCLP = cat && cat.kind === kind ? cat.priceFromCLP : 0;
      }
    }
    const withPasses = applyOfficialPasses(plan, lugar);
    return trimToBudget(withPasses as BudgetPlan & typeof withPasses);
  };

  if (!key) {
    return Response.json({
      plan: quoted(
        fallbackPlan({
          lugar,
          presupuesto,
          noches,
          viajeros,
          intereses,
        }),
      ),
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
  "totals": {"stay": number, "food": number, "activities": number, "tickets": number, "total": number, "remaining": number}
}
El total no debe superar el presupuesto. Si no cabe la cápsula todas las noches, incluye menos noches. Si una comida, actividad o pase no cabe, no la incluyas. Prefiere la cápsula, después gastronomía y una actividad del paisaje. No inventes el precio de entradas a parques: el servidor agrega el pase oficial de pasesparques.cl y recorta lo que se pase del presupuesto. Write title, summary, day titles and notes in ${language}. Keep place names in Spanish. Tono cálido y concreto.`;

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
      plan: quoted(
        fallbackPlan({
          lugar,
          presupuesto,
          noches,
          viajeros,
          intereses,
        }),
      ),
      source: "catalog",
      grok: credits ? "credits" : "error",
    });
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  try {
    const plan = quoted(JSON.parse(match ? match[0] : text));
    return Response.json({ plan, source: "grok" });
  } catch {
    return Response.json({
      plan: quoted(
        fallbackPlan({
          lugar,
          presupuesto,
          noches,
          viajeros,
          intereses,
        }),
      ),
      source: "catalog",
    });
  }
}
