/**
 * schemas/feedback.schema.ts
 *
 * Zod validation schema for FinalFeedback.
 * Validates the complete interview report before it is stored or served.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { z } from "zod";

const StrengthEntrySchema = z.object({
  topic: z.string().min(1),
  description: z.string().min(1),
  evidence: z.array(z.string()),
});

const GapEntrySchema = z.object({
  topic: z.string().min(1),
  description: z.string().min(1),
  evidence: z.array(z.string()),
  curriculumDays: z.array(z.number().int().min(1).max(31)),
});

const RecoveryItemSchema = z.object({
  priority: z.number().int().min(1),
  topic: z.string().min(1),
  action: z.string().min(1),
  resources: z.array(z.string()),
});

const TopicKnowledgeSchema = z.object({
  topic: z.string().min(1),
  estimatedScore: z.number().min(0).max(10),
  confidence: z.enum(["low", "medium", "high"]),
  evidenceCount: z.number().int().min(0),
});

export const FinalFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  candidateId: z.string().min(1),
  generatedAt: z.string().datetime({ message: "generatedAt must be ISO 8601" }),
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(StrengthEntrySchema),
  gaps: z.array(GapEntrySchema),
  knowledgeTwin: z.array(TopicKnowledgeSchema),
  recoveryPlan: z.array(RecoveryItemSchema),
  daysCovered: z.array(z.number().int().min(1).max(31)),
  totalQuestions: z.number().int().min(1),
});

export type FinalFeedbackInput = z.input<typeof FinalFeedbackSchema>;
export type FinalFeedbackOutput = z.output<typeof FinalFeedbackSchema>;
