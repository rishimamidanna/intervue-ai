/**
 * schemas/candidate-intelligence.schema.ts
 *
 * Zod validation schema for Candidate Intelligence Profile objects.
 *
 * Owner: Member 2 (Data + RAG)
 */

import { z } from "zod";

export const CandidateStrengthSchema = z.object({
  topic: z.string().min(1, "Strength topic is required"),
  day: z.number().int().min(1).optional(),
  evidence: z.string().min(1, "Evidence description is required"),
  reason: z.string().min(1, "Explainable reason is required"),
});

export const VerificationSignalSchema = z.enum([
  "failed_mission",
  "skipped_topic",
  "high_attempts",
  "incomplete_evidence",
]);

export const VerificationAreaSchema = z.object({
  topic: z.string().min(1, "Verification area topic is required"),
  day: z.number().int().min(1).optional(),
  signal: VerificationSignalSchema,
  reason: z.string().min(1, "Explainable reason is required"),
});

export const LearningProfileSchema = z.object({
  consistencyLevel: z.enum(["High", "Moderate", "Low"]),
  completionRate: z.number().min(0).max(100),
  firstTryPassRate: z.number().min(0).max(100),
  totalCommitDays: z.number().int().min(0),
  summary: z.string().min(1, "Learning profile summary is required"),
});

export const RecommendedFocusTopicSchema = z.object({
  day: z.number().int().min(1),
  topic: z.string().min(1, "Focus topic is required"),
  priority: z.enum(["High", "Medium", "Low"]),
  priorityScore: z.number().min(0),
  reason: z.string().min(1, "Explainable reason is required"),
});

export const CandidateIntelligenceProfileSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
  role: z.string().min(1, "role is required"),
  experience: z.number().min(0),
  education: z.string(),
  strengths: z.array(CandidateStrengthSchema),
  verificationAreas: z.array(VerificationAreaSchema),
  learningProfile: LearningProfileSchema,
  recommendedFocus: z.array(RecommendedFocusTopicSchema),
  generatedAt: z.string(),
});
