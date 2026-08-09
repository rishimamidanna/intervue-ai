/**
 * app/api/interview/answer/route.ts
 *
 * POST /api/interview/answer — Answer Submission & Turn Processing Endpoint
 *
 * Receives candidate answer, executes evaluation guardrails + LLM scoring,
 * updates Knowledge Twin, determines adaptive next action, and returns next question.
 *
 * Contract:
 * - Input: { sessionId: string, questionId: string, answer: string }
 * - Output: { status: "interviewing" | "completed", evaluation: AnswerEvaluation, nextQuestion: InterviewQuestion | null, progress: InterviewProgress }
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processAnswer } from "@/server/interview-controller";
import { withErrorHandler } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AnswerRequestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  questionId: z.string().min(1, "questionId is required"),
  answer: z.string().min(1, "answer must not be empty"),
});

export const POST = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
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

  try {
    const response = await processAnswer(sessionId, questionId, answer);
    logger.info("Processed interview answer turn", {
      sessionId,
      questionId,
      status: response.status,
      questionCount: response.progress.questionCount,
    });

    const isCompleted = response.status === "completed" || response.nextQuestion === null || response.progress.questionCount > 8;

    const formattedNextQuestion = response.nextQuestion
      ? {
          ...response.nextQuestion,
          question: response.nextQuestion.text,
          concepts: response.nextQuestion.expectedConcepts,
        }
      : null;

    return NextResponse.json({
      ...response,
      success: true,
      status: isCompleted ? "completed" : response.status,
      done: isCompleted,
      completed: isCompleted,
      reportReady: isCompleted,
      nextQuestion: formattedNextQuestion,
      progress: {
        ...response.progress,
        currentQuestion: response.progress.questionCount,
        totalQuestions: 8,
      },
      message: isCompleted ? "Interview completed" : "Answer evaluated",
    }, { status: 200 });
  } catch (error) {
    const isNotFound = error instanceof Error && error.message.includes("not found");
    if (isNotFound) {
      logger.warn("Answer submission session not found", { sessionId });
      return NextResponse.json(
        { status: "error", error: "Session not found", message: `Session not found: ${sessionId}` },
        { status: 404 }
      );
    }
    throw error;
  }
});
