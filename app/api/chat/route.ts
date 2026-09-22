import { capsules, destinations, gastronomy, activities } from "@/lib/catalog";
import { localeMeta, parseLocale } from "@/lib/locale";

export const runtime = "nodejs";

const catalog = [
  ...destinations.map((d) => `Destino ${d.name} (${d.slug}): ${d.tagline}`),
  ...capsules.map(
    (c) =>
      `Cápsula ${c.name} (${c.slug}) en ${c.city}: ${c.priceFromCLP} CLP/noche. ${c.tagline}`,
  ),
  ...gastronomy.map((g) => `Gastronomía ${g.name} (${g.slug}): ${g.tagline}`),
  ...activities.map((a) => `Actividad ${a.name} (${a.slug}): ${a.tagline}`),
].join("\n");

export async function POST(req: Request) {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    return Response.json({ error: "Missing XAI_API_KEY" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const language =
    localeMeta[parseLocale(body.locale)].replyLanguage ||
    (typeof body.language === "string" ? body.language : "Spanish (Chile)");
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages = incoming
    .filter(
      (m: { role?: string; content?: string }) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4.6",
      stream: true,
      messages: [
        {
          role: "system",
          content: `Eres el concierge de Mapucoin (mapucoin.com), plataforma turística de Chile.
Ayudas a elegir destino, presupuesto, cápsula tecnológica, gastronomía y actividades.
Pagos con Stripe. Partners se inscriben en /#partners. Reply in ${language}, brief and concrete. Keep place names in Spanish.
Catálogo:
${catalog}`,
        },
        ...messages,
      ],
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text();
    return Response.json(
      { error: errText || "Grok request failed" },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = res.body.getReader();

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const token = json.choices?.[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        } catch {
          /* ignore */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
