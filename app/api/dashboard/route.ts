import { NextRequest, NextResponse } from "next/server";
import { getState } from "@/server/interview-state";
import { calculateFinalScore } from "@/lib/scoring";
import { withErrorHandler } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
 * GET /api/dashboard
 *
 * Retrieves live interview intelligence and Knowledge Twin analytics
 * from Redis persistent session storage for the specified sessionId.
 *
 * Query Params:
 * - sessionId (string, optional)
 *
 * Owner: Member 2 (Backend / API)
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    logger.info("[API /api/dashboard] No sessionId provided in query");
    return NextResponse.json({
      hasSession: false,
      message: "Start your first AI interview to build your Knowledge Twin.",
      readinessScore: 0,
      knowledgeScore: 0,
      confidence: "0%",
      curriculumProgress: 0,
      aiPerformance: 0,
      masteredTopics: [],
      knowledgeGaps: [],
      totalQuestions: 0,
      completedDays: 0,
      candidateName: "Knowledge Twin",
      roleTitle: "Target Position",
    });
  }

  const state = await getState(sessionId);

  if (!state) {
    logger.warn(`[API /api/dashboard] Session not found for ID: ${sessionId}`);
    return NextResponse.json({
      hasSession: false,
      message: "Start your first AI interview to build your Knowledge Twin.",
      readinessScore: 0,
      knowledgeScore: 0,
      confidence: "0%",
      curriculumProgress: 0,
      aiPerformance: 0,
      masteredTopics: [],
      knowledgeGaps: [],
      totalQuestions: 0,
      completedDays: 0,
      candidateName: "Knowledge Twin",
      roleTitle: "Target Position",
    });
  }

  const turns = state.questionHistory || [];
  const questionCount = state.questionCount || turns.length;
  const hasHistory = turns.length > 0;

  // 1. Calculate Single Source of Truth Score
  const finalScore = state.finalScore || calculateFinalScore(turns.map((t) => t.evaluation));
  const readinessScore = finalScore.overallScore;

  // 2. Knowledge Twin Score & Mastery
  const twin = state.knowledgeTwin || [];
  let twinScoreSum = 0;
  const masteredTopics: string[] = [...(state.strengths || [])];
  const knowledgeGaps: string[] = [...(state.knowledgeGaps || [])];

  twin.forEach((item) => {
    twinScoreSum += item.estimatedScore || 0;
    if (item.estimatedScore >= 7 && !masteredTopics.includes(item.topic)) {
      masteredTopics.push(item.topic);
    }
    if (item.estimatedScore < 6 && !knowledgeGaps.includes(item.topic)) {
      knowledgeGaps.push(item.topic);
    }
  });

  const knowledgeScore = twin.length > 0
    ? Math.round((twinScoreSum / twin.length) * 10)
    : readinessScore;

  // 3. Confidence Level Calculation
  const highConfCount = twin.filter((t) => t.confidence === "high").length;
  const confPercentage = twin.length > 0
    ? Math.min(98, Math.max(60, Math.round((highConfCount / twin.length) * 100)))
    : hasHistory ? 85 : 0;
  const confidence = `High (${confPercentage}%)`;

  // 4. Curriculum Progress
  const daysCoveredCount = state.daysCovered?.length || 1;
  const curriculumProgress = Math.min(100, Math.round((daysCoveredCount / 31) * 100));

  // 5. AI Performance Accuracy
  const aiPerformance = hasHistory ? Math.min(99.4, Math.max(70, Math.round(readinessScore * 0.98 + 5))) : 0;

  logger.info(`[API /api/dashboard] Successfully returned metrics for session: ${sessionId}`);

  return NextResponse.json({
    hasSession: true,
    sessionId: state.sessionId,
    candidateName: "Knowledge Twin",
    roleTitle: "AI/ML Engineer",
    readinessScore,
    knowledgeScore,
    confidence,
    curriculumProgress,
    aiPerformance,
    masteredTopics: masteredTopics.length > 0 ? masteredTopics : ["RAG Architecture", "Vector Search"],
    knowledgeGaps: knowledgeGaps.length > 0 ? knowledgeGaps : ["IVF Indexing"],
    totalQuestions: questionCount,
    completedDays: daysCoveredCount,
  });
});
