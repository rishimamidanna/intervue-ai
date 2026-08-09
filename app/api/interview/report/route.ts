/**
 * app/api/interview/report/route.ts
 *
 * GET /api/interview/report?sessionId=<id> — Final Report Retrieval Endpoint
 *
 * Fetches the complete Interview DNA report, overall score breakdown, strengths,
 * knowledge gaps, 4-step recovery plan, and transcript evidence.
 *
 * Contract:
 * - Query param: sessionId=<string>
 * - Output: { status: "completed", feedback: FinalFeedback, questionHistory: InterviewTurn[] }
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { getFinalReport } from "@/server/interview-controller";
import { withErrorHandler } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export const GET = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
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

  try {
    const { feedback, questionHistory } = await getFinalReport(sessionId);

    logger.info("Generated final interview report", {
      sessionId,
      overallScore: feedback.overallScore,
      turnCount: questionHistory.length,
    });

    return NextResponse.json(
      { status: "completed", feedback, questionHistory },
      { status: 200 }
    );
  } catch (error) {
    const isNotFound = error instanceof Error && error.message.includes("not found");
    if (isNotFound) {
      logger.warn("Report requested for unknown session", { sessionId });
      return NextResponse.json(
        { status: "error", error: "Session not found", message: `Session not found: ${sessionId}` },
        { status: 404 }
      );
    }
    throw error;
  }
});
