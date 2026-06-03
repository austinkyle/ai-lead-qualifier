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

    const body = (await req.json()) as Record<string, unknown>;

    if (
      typeof body.companyName !== "string" ||
      typeof body.contactName !== "string" ||
      typeof body.email !== "string" ||
      !body.companyName.trim() ||
      !body.contactName.trim() ||
      !body.email.trim()
    ) {
      return NextResponse.json(
        { error: "companyName, contactName, and email are required" },
        { status: 400 }
      );
    }

    const handle = await tasks.trigger("qualify-lead", body);

    await supabase.from("lead_qualifications").insert({
      user_id: user.id,
      run_id: handle.id,
      company_name: body.companyName,
      contact_name: body.contactName,
      email: body.email,
      budget: typeof body.budget === "string" ? body.budget : null,
      use_case: typeof body.useCase === "string" ? body.useCase : null,
      timeline: typeof body.timeline === "string" ? body.timeline : null,
      team_size: typeof body.teamSize === "string" ? body.teamSize : null,
      current_tools: typeof body.currentTools === "string" ? body.currentTools : null,
      decision_maker: typeof body.decisionMaker === "boolean" ? body.decisionMaker : null,
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
