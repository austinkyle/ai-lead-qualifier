import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UsageStatus } from "@/lib/types";

const DAILY_LIMIT = 2;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (sub) {
    return NextResponse.json<UsageStatus>({ isPro: true, used: 0, limit: null });
  }

  const todayMidnightUTC = new Date();
  todayMidnightUTC.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("lead_qualifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayMidnightUTC.toISOString());

  return NextResponse.json<UsageStatus>({
    isPro: false,
    used: count ?? 0,
    limit: DAILY_LIMIT,
  });
}
