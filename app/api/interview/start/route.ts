/**
 * app/api/interview/start/route.ts
 *
 * POST /api/interview/start — Session Initialization Endpoint
 *
 * Initializes a new interview session for a candidate, creating the Knowledge Twin,
 * interview strategy plan, and serving opening Question 1.
 *
 * Contract:
 * - Input: { candidateId: string }
 * - Output: { status: "interviewing", sessionId: string, question: InterviewQuestion }
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initializeInternalInterview } from "@/server/interview-controller";
import { withErrorHandler } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const StartRequestSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
});

export const POST = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
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

  logger.info("Interview session initialized successfully", {
    candidateId,
    sessionId: response.sessionId,
  });

  return NextResponse.json(response, { status: 200 });
});
