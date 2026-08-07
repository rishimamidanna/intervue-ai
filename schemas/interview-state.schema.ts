/**
 * schemas/interview-state.schema.ts
 *
 * Zod validation schema for InterviewState.
 * Validates the full server-side session state structure to prevent
 * malformed data from corrupting the interview pipeline.
 *
 * Owner: Member 2 (Backend / API)
 */

import { z } from "zod";
import { InterviewQuestionSchema } from "./question.schema";
import { AnswerEvaluationSchema } from "./evaluation.schema";

const DifficultyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);

const TopicKnowledgeSchema = z.object({
  topic: z.string().min(1),
  estimatedScore: z.number().min(0).max(10),
  confidence: ConfidenceLevelSchema,
  evidenceCount: z.number().int().min(0),
});

const InterviewTurnSchema = z.object({
  question: InterviewQuestionSchema,
  answer: z.string(),
  evaluation: AnswerEvaluationSchema,
});

export const InterviewStateSchema = z.object({
  sessionId: z.string().min(1, "sessionId must not be empty"),
  candidateId: z.string().min(1),
  questionCount: z.number().int().min(0),
  daysCovered: z.array(z.number().int().min(1).max(31)),
  currentTopic: z.string(),
  difficulty: DifficultyLevelSchema,
  strengths: z.array(z.string()),
  knowledgeGaps: z.array(z.string()),
  misconceptions: z.array(z.string()),
  candidateClaims: z.array(z.string()),
  contradictions: z.array(z.string()),
  knowledgeTwin: z.array(TopicKnowledgeSchema),
  questionHistory: z.array(InterviewTurnSchema),
});

export type InterviewStateInput = z.input<typeof InterviewStateSchema>;
export type InterviewStateOutput = z.output<typeof InterviewStateSchema>;
