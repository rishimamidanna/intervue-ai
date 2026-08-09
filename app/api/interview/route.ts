/**
 * app/api/interview/route.ts
 *
 * POST /api/interview — OFFICIAL HACKATHON EVALUATOR ENDPOINT
 *
 * Unified single endpoint supporting:
 * 1. Interview Initialization ({ sessionId, candidate: CandidateProfile })
 * 2. Conversation Turns ({ sessionId, message: string })
 *
 * Contracts:
 * - Start Payload: { sessionId, candidate: { member, missions, signals } }
 * - Turn Payload: { sessionId, message: string }
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  StartInterviewRequestSchema,
  ConversationTurnRequestSchema,
} from "@/schemas/api.schema";
import {
  initializeInterview,
  handleConversationTurn,
} from "@/server/interview-controller";
import { sessionExists } from "@/server/session-manager";
import { withErrorHandler } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload in request body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;

  // 1. START REQUEST
  if ("candidate" in payload) {
    const parseResult = StartInterviewRequestSchema.safeParse(payload);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid start request payload",
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { sessionId, candidate } = parseResult.data;
    const response = await initializeInterview(sessionId, candidate);

    logger.info("Official API interview initialized", { sessionId, candidateId: candidate.member.id });
    return NextResponse.json(response, { status: 200 });
  }

  // 2. CONVERSATION TURN REQUEST
  if ("message" in payload) {
    const parseResult = ConversationTurnRequestSchema.safeParse(payload);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid conversation turn request payload",
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { sessionId, message } = parseResult.data;

    if (!(await sessionExists(sessionId))) {
      logger.warn("Official API turn requested for unknown session", { sessionId });
      return NextResponse.json(
        { error: `Session not found: ${sessionId}` },
        { status: 404 }
      );
    }

    const response = await handleConversationTurn(sessionId, message);
    logger.info("Official API turn processed", { sessionId, done: response.done });
    return NextResponse.json(response, { status: 200 });
  }

  return NextResponse.json(
    { error: "Request must contain either 'candidate' (for start) or 'message' (for turn)" },
    { status: 400 }
  );
});
