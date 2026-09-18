import { PUBLIC_PARTNER_COLUMNS, publicPartners } from "@/lib/partners";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getSupabase();
  if (!db) return Response.json({ partners: [] });

  const { data, error } = await db
    .from("partners")
    .select(PUBLIC_PARTNER_COLUMNS)
    .eq("status", "approved")
    .not("slug", "is", null)
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("business", { ascending: true })
    .limit(500);

  if (error) {
    return Response.json({ partners: [] });
  }

  return Response.json({ partners: publicPartners(data) });
}
