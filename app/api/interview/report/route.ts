/**
 * app/api/interview/report/route.ts
 *
 * GET /api/interview/report?sessionId=<id> — Internal development route
 *
 * ⚠️  NOTICE: The public hackathon API contract must be adapted to the
 * official Technical Specification before submission. This route is an
 * INTERNAL development scaffold. Field names, HTTP methods, and response
 * shapes must be reconciled with the external spec when it is provided.
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { getFinalReport } from "@/server/interview-controller";

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing required query parameter: sessionId",
        },
        { status: 400 }
      );
    }

    const { feedback, questionHistory } = await getFinalReport(sessionId);

    return NextResponse.json(
      { status: "completed", feedback, questionHistory },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/interview/report]", error);

    const isNotFound =
      error instanceof Error && error.message.includes("not found");

    return NextResponse.json(
      {
        status: "error",
        error: isNotFound ? "Session not found" : "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
