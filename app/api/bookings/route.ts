import { NextResponse } from "next/server";
import { cookieValue, readSession, SESSION_COOKIE } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await readSession(
    cookieValue(req.headers.get("cookie"), SESSION_COOKIE),
  );
  if (!user) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }

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
