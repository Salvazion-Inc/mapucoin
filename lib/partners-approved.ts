import type { SupabaseClient } from "@supabase/supabase-js";
import { listApprovedPublic } from "@/lib/partner-store";
import { publicPartners } from "@/lib/partners";

type Lister = (db: SupabaseClient) => ReturnType<typeof listApprovedPublic>;

/** GET /api/partners/approved: 500 with a log on any DB error instead of a silent empty list. */
export async function approvedPartnersResponse(
  db: SupabaseClient | null,
  list: Lister = listApprovedPublic,
): Promise<Response> {
  // No Supabase configured (local/CI without env): the map just shows the static catalog.
  if (!db) {
    console.warn("partners_approved_no_db");
    return Response.json({ partners: [] });
  }
  try {
    const partners = publicPartners(await list(db));
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
  } catch (err) {
    console.error("partners_approved_error", err instanceof Error ? err.message : "error");
    return Response.json({ error: "partners_unavailable" }, { status: 500 });
  }
}
