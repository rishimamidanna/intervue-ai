/**
 * app/api/interview/reset/route.ts
 *
 * POST /api/interview/reset — Session Reset Endpoint
 *
 * Resets candidate session state and returns a brand-new active interview starting at Question 1.
 *
 * Contract:
 * - Input: { candidateId?: string }
 * - Output: { status: "interviewing", sessionId: string, question: InterviewQuestion, progress: InterviewProgress }
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initializeInternalInterview } from "@/server/interview-controller";
import { withErrorHandler } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const ResetRequestSchema = z.object({
  candidateId: z.string().optional(),
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const POST = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  let candidateId = "candidate_1";
  try {
    const body = await request.json();
    const parseResult = ResetRequestSchema.safeParse(body);
    if (parseResult.success && parseResult.data.candidateId) {
      candidateId = parseResult.data.candidateId;
    }
  } catch {
    // Body optional on reset
  }

  const response = await initializeInternalInterview(candidateId, undefined, true);

  logger.info("Reset interview session completed", {
    candidateId,
    newSessionId: response.sessionId,
  });

  return NextResponse.json(response, { status: 200 });
});
