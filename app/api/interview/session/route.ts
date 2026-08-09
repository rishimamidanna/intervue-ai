/**
 * app/api/interview/session/route.ts
 *
 * GET /api/interview/session?sessionId=<id> — Active Session Restoration Endpoint
 *
 * Checks and restores active interview session state from server store, returning
 * the latest question, evaluation history, progress, difficulty, and Knowledge Twin state.
 *
 * Owner: Member 2 (Backend / API)
 */

import { NextRequest, NextResponse } from "next/server";
import { getState } from "@/server/interview-state";
import { calculateFinalScore } from "@/lib/scoring";
import { withErrorHandler } from "@/lib/api-response";
import { MIN_INTERVIEW_QUESTIONS, MIN_CURRICULUM_DAYS } from "@/lib/constants";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({
      hasSession: false,
      message: "No sessionId provided.",
    });
  }

  const state = await getState(sessionId);
  if (!state || !state.questionHistory || state.questionHistory.length === 0) {
    logger.info("[API /api/interview/session] Session not found or empty", { sessionId });
    return NextResponse.json({
      hasSession: false,
      message: `Active session not found for ID: ${sessionId}`,
    });
  }

  const turns = state.questionHistory;
  const lastTurn = turns[turns.length - 1];

  const isCompleted =
    (state.questionCount || turns.length) >= MIN_INTERVIEW_QUESTIONS &&
    (state.daysCovered || []).length >= MIN_CURRICULUM_DAYS;

  const lastEvaluation =
    turns.length > 1 && turns[turns.length - 2].evaluation?.correctness !== undefined
      ? turns[turns.length - 2].evaluation
      : lastTurn.evaluation?.correctness !== undefined && lastTurn.evaluation?.correctness > 0
      ? lastTurn.evaluation
      : null;

  logger.info("[API /api/interview/session] Successfully restored active session", {
    sessionId,
    questionCount: turns.length,
    currentTopic: lastTurn.question?.topic,
    difficulty: state.difficulty,
  });

  return NextResponse.json({
    hasSession: true,
    sessionId: state.sessionId,
    status: isCompleted ? "completed" : "interviewing",
    currentQuestion: state.currentQuestion || lastTurn.question,
    lastEvaluation,
    progress: {
      questionCount: Math.min(8, Math.max(state.questionCount || 0, turns.length) + (isCompleted ? 0 : 1)),
      daysCovered: state.daysCovered?.length > 0 ? state.daysCovered : [lastTurn.question?.curriculumDay || 1],
      currentDifficulty: state.difficulty ?? lastTurn.question?.difficulty ?? 2,
      minimumRequirementsMet: isCompleted,
    },
    finalScore: state.finalScore || (isCompleted ? calculateFinalScore(turns.map((t) => t.evaluation)) : undefined),
    questionHistory: turns,
    knowledgeTwin: state.knowledgeTwin || [],
    difficulty: state.difficulty || 2,
  });
});
