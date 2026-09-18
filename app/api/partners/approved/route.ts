import { listApprovedPublic } from "@/lib/partner-store";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getSupabase();
  if (!db) return Response.json({ partners: [] });
  try {
    const partners = await listApprovedPublic(db);
    return Response.json({ partners });
  } catch {
    return Response.json({ partners: [] });
  }
}
