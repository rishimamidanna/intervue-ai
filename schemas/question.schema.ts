/**
 * schemas/question.schema.ts
 *
 * Zod validation schema for InterviewQuestion.
 * Used to validate structured LLM output before it enters application state.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { z } from "zod";

const DifficultyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const InterviewQuestionSchema = z.object({
  id: z.string().min(1, "Question ID must not be empty"),
  text: z.string().min(10, "Question text is too short"),
  topic: z.string().min(1, "Topic must not be empty"),
  curriculumDay: z.number().int().min(1).max(31),
  difficulty: DifficultyLevelSchema,
  reason: z.string().min(1, "Reason must be provided"),
  expectedConcepts: z.array(z.string()).min(1, "At least one expected concept required"),
});

export type InterviewQuestionInput = z.input<typeof InterviewQuestionSchema>;
export type InterviewQuestionOutput = z.output<typeof InterviewQuestionSchema>;
