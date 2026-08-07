/**
 * app/api/interview/route.ts
 *
 * POST /api/interview — OFFICIAL HACKATHON EVALUATOR ENDPOINT
 *
 * Handles both START requests ({ sessionId, candidate }) and
 * CONVERSATION turn requests ({ sessionId, message }).
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // 1. Detect request type & validate
    if ("candidate" in payload) {
      // START REQUEST
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
      return NextResponse.json(response, { status: 200 });
    }

    if ("message" in payload) {
      // CONVERSATION TURN REQUEST
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

      if (!sessionExists(sessionId)) {
        return NextResponse.json(
          { error: `Session not found: ${sessionId}` },
          { status: 404 }
        );
      }

      const response = await handleConversationTurn(sessionId, message);
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      { error: "Request must contain either 'candidate' (for start) or 'message' (for turn)" },
      { status: 400 }
    );
  } catch (error) {
    // Log error internally for debugging without exposing stack trace to client
    console.error("[POST /api/interview]", error);

    return NextResponse.json(
      { error: "An error occurred while processing the interview request" },
      { status: 500 }
    );
  }
}
