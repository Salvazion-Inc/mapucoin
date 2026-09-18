import { listApprovedPublic } from "@/lib/partner-store";
import { publicPartners } from "@/lib/partners";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getSupabase();
  if (!db) return Response.json({ partners: [] });
  try {
    const partners = publicPartners(await listApprovedPublic(db));
    return Response.json({
      partners: partners.map((p) => ({
        id: p.id,
        slug: p.slug,
        business: p.business,
        city: p.city,
        role: p.role,
        lat: p.lat,
        lng: p.lng,
        price_from_clp: p.price_from_clp,
        offer_summary: p.offer_summary,
        landscape: p.landscape,
      })),
    });
  } catch {
    return Response.json({ partners: [] });
  }
}
