/**
 * app/api/interview/start/route.ts
 *
 * POST /api/interview/start — INTERNAL DEVELOPMENT ROUTE
 *
 * ⚠️ NOTICE: The official hackathon endpoint is POST /api/interview.
 * This route is kept strictly as an internal development helper for the frontend UI.
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initializeInternalInterview } from "@/server/interview-controller";

const StartRequestSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parseResult = StartRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid request body",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { candidateId } = parseResult.data;
    const response = await initializeInternalInterview(candidateId);

    if (response.status === "error") {
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[POST /api/interview/start]", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
