import { NextRequest, NextResponse } from "next/server";
import { tasks, auth } from "@trigger.dev/sdk/v3";

export async function POST(req: NextRequest) {
  try {
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
