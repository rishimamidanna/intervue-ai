/**
 * app/api/interview/answer/route.ts
 *
 * POST /api/interview/answer — Internal development route
 *
 * ⚠️  NOTICE: The public hackathon API contract must be adapted to the
 * official Technical Specification before submission. This route is an
 * INTERNAL development scaffold. Field names, HTTP methods, and response
 * shapes must be reconciled with the external spec when it is provided.
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processAnswer } from "@/server/interview-controller";

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------

const AnswerRequestSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
  questionId: z.string().min(1, "questionId is required"),
  answer: z.string().min(1, "answer must not be empty"),
});

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parseResult = AnswerRequestSchema.safeParse(body);

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

    const { sessionId, questionId, answer } = parseResult.data;

    const response = await processAnswer(sessionId, questionId, answer);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[POST /api/interview/answer]", error);

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
