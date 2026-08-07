/**
 * schemas/evaluation.schema.ts
 *
 * Zod validation schema for AnswerEvaluation.
 * Ensures LLM-produced evaluations are within valid numeric ranges and
 * include all required fields before updating interview state.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { z } from "zod";

const ScoreSchema = z
  .number()
  .min(0, "Score must be >= 0")
  .max(10, "Score must be <= 10");

const NextActionSchema = z.enum([
  "follow_up",
  "probe",
  "new_topic",
  "increase_difficulty",
  "decrease_difficulty",
  "cross_concept",
  "contradiction",
]);

export const AnswerEvaluationSchema = z.object({
  correctness: ScoreSchema,
  reasoning: ScoreSchema,
  depth: ScoreSchema,
  communication: ScoreSchema,
  engineering: ScoreSchema,
  coveredConcepts: z.array(z.string()),
  missingConcepts: z.array(z.string()),
  misconceptions: z.array(z.string()),
  nextAction: NextActionSchema,
});

export type AnswerEvaluationInput = z.input<typeof AnswerEvaluationSchema>;
export type AnswerEvaluationOutput = z.output<typeof AnswerEvaluationSchema>;
