import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { QualificationResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { runId: string; result: QualificationResult };

    if (!body.runId || !body.result) {
      return NextResponse.json({ error: "runId and result are required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("lead_qualifications")
      .update({
        score: body.result.score,
        tier: body.result.tier,
        summary: body.result.summary,
        strengths: body.result.strengths,
        concerns: body.result.concerns,
        recommendation: body.result.recommendation,
        confidence: body.result.confidence,
        status: "completed",
      })
      .eq("run_id", body.runId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[leads/save] supabase update failed:", error);
      return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[leads/save] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
