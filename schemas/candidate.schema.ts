/**
 * schemas/candidate.schema.ts
 *
 * Zod validation schema for candidate profiles and candidate JSON data datasets.
 * Ensures data integrity when loading raw JSON files before passing objects to AI and server modules.
 *
 * Owner: Shared (Data & Backend Layer)
 */

import { z } from "zod";

export const CandidateMemberSchema = z.object({
  id: z.string().min(1, "Candidate ID must not be empty"),
  name: z.string().min(1, "Candidate name must not be empty"),
  jobRole: z.string().min(1, "Job role must not be empty"),
  yearsExperience: z.number().min(0, "Years of experience must be non-negative"),
  education: z.string().min(1, "Education must not be empty"),
  status: z.string().min(1, "Status must not be empty"),
});

export const CandidateMissionSchema = z.object({
  day: z.number().int().min(1, "Mission day must be at least 1").max(31, "Mission day must be at most 31"),
  title: z.string().min(1, "Mission title must not be empty"),
  passed: z.boolean().optional(),
  attempts: z.number().int().min(0, "Mission attempts must be non-negative").optional(),
  skipped: z.boolean().optional(),
});

export const CandidateSignalsSchema = z.object({
  commitDays: z.number().int().min(0, "Commit days must be non-negative"),
  missionsCompleted: z.number().int().min(0, "Missions completed must be non-negative"),
  missionsFirstTry: z.number().int().min(0, "Missions first try must be non-negative"),
});

export const CandidateProfileSchema = z.object({
  member: CandidateMemberSchema,
  missions: z.array(CandidateMissionSchema),
  signals: CandidateSignalsSchema,
});

export const CandidatesDataSchema = z.object({
  candidates: z.array(CandidateProfileSchema).min(1, "Candidates list must contain at least 1 profile"),
});

export type CandidateMemberInput = z.input<typeof CandidateMemberSchema>;
export type CandidateProfileInput = z.input<typeof CandidateProfileSchema>;
export type CandidatesDataInput = z.input<typeof CandidatesDataSchema>;
