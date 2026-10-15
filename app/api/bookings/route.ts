import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { requireVerifiedAccount } from "@/lib/verified-access";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const gate = await requireVerifiedAccount(req);
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const db = getSupabase();
  if (!db) return NextResponse.json({ bookings: [] });

  try {
    const { data, error } = await db
      .from("bookings")
      .select(
        "id, full_name, email, capsule_slug, yacht_slug, nights, guests, amount, status, created_at, destination",
      )
      .or(`email.eq.${user.email},user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) return NextResponse.json({ bookings: [] });
    return NextResponse.json({ bookings: data || [] });
  } catch {
    return NextResponse.json({ bookings: [] });
  }
}
