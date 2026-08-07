/**
 * schemas/api.schema.ts
 *
 * Zod validation schemas for the Official Hackathon API (POST /api/interview).
 * Validates incoming Start and Conversation turn requests safely.
 *
 * Owner: Member 3 (AI / Prompt Engineering) / Member 2 (Backend / API)
 */

import { z } from "zod";

export const CandidateMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  jobRole: z.string(),
  yearsExperience: z.number(),
  education: z.string(),
  status: z.string(),
});

export const CandidateMissionSchema = z.object({
  day: z.number(),
  title: z.string(),
  passed: z.boolean().optional(),
  attempts: z.number().optional(),
  skipped: z.boolean().optional(),
});

export const CandidateSignalsSchema = z.object({
  commitDays: z.number(),
  missionsCompleted: z.number(),
  missionsFirstTry: z.number(),
});

export const CandidateProfileSchema = z.object({
  member: CandidateMemberSchema,
  missions: z.array(CandidateMissionSchema),
  signals: CandidateSignalsSchema,
});

export const StartInterviewRequestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  candidate: CandidateProfileSchema,
});

export const ConversationTurnRequestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  message: z.string().min(1, "message is required"),
});
