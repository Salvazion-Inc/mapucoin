import { approvedPartnersResponse } from "@/lib/partners-approved";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return approvedPartnersResponse(getSupabase());
}
