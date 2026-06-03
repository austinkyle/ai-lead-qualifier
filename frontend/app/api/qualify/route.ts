import { NextRequest, NextResponse } from "next/server";
import { tasks, auth } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check subscription / daily limit before doing any work.
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!sub) {
      const todayMidnightUTC = new Date();
      todayMidnightUTC.setUTCHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("lead_qualifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayMidnightUTC.toISOString());

      if ((count ?? 0) >= 2) {
        return NextResponse.json(
          { error: "limit_reached", used: count, limit: 2 },
          { status: 429 }
        );
      }
    }

    const body = (await req.json()) as Record<string, unknown>;

    if (
      typeof body.fullName !== "string" ||
      typeof body.businessName !== "string" ||
      typeof body.email !== "string" ||
      typeof body.challenge !== "string" ||
      !body.fullName.trim() ||
      !body.businessName.trim() ||
      !body.email.trim() ||
      !body.challenge.trim()
    ) {
      return NextResponse.json(
        { error: "fullName, businessName, email, and challenge are required" },
        { status: 400 }
      );
    }

    const handle = await tasks.trigger("qualify-lead", body);

    await supabase.from("lead_qualifications").insert({
      user_id: user.id,
      run_id: handle.id,
      company_name: body.businessName,
      contact_name: body.fullName,
      email: body.email,
      use_case: body.challenge,
      budget: typeof body.monthlyBudget === "string" ? body.monthlyBudget : null,
      timeline: typeof body.timeline === "string" ? body.timeline : null,
      team_size: typeof body.employeeCount === "string" ? body.employeeCount : null,
      status: "pending",
    });

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
    });

    return NextResponse.json({
      runId: handle.id,
      publicAccessToken: publicToken,
    });
  } catch (err) {
    console.error("[qualify] failed to trigger task:", err);
    return NextResponse.json(
      { error: "Failed to start analysis. Please try again." },
      { status: 500 }
    );
  }
}
