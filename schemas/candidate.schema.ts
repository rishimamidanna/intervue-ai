/**
 * schemas/candidate.schema.ts
 *
 * Zod validation schema for Candidate Profile data.
 * Ensures candidate objects loaded from candidates.json adhere to required data structures.
 *
 * Owner: Member 2 (Data + RAG)
 */

import { z } from "zod";

/**
 * Individual candidate mission attempt state.
 * Important: passed=false and skipped=true represent distinct mission states.
 */
export const CandidateMissionSchema = z.object({
  day: z.number().int().min(1, "Mission day must be a positive integer"),
  title: z.string().min(1, "Mission title is required"),
  attempts: z.number().int().min(0, "Attempts must be a non-negative integer").default(0),
  passed: z.boolean(),
  skipped: z.boolean(),
});

export const CandidateSignalsSchema = z
  .object({
    commitDays: z.number().int().min(0).default(0),
    missionsCompleted: z.number().int().min(0).default(0),
    missionsFirstTry: z.number().int().min(0).default(0),
  })
  .passthrough();

export const CandidateMemberSchema = z.object({
  id: z.string().min(1, "Member id is required"),
  name: z.string().optional(),
  jobRole: z.string().min(1, "Member jobRole is required"),
  yearsExperience: z.number().min(0, "yearsExperience must be non-negative"),
  education: z.string().optional(),
  status: z.string().optional(),
});

export const CandidateProfileSchema = z
  .object({
    id: z.string().min(1, "Candidate id is required").optional(),
    role: z.string().min(1, "Candidate role is required").optional(),
    experience: z.number().min(0, "Experience must be non-negative").optional(),
    missions: z.array(CandidateMissionSchema),
    attempts: z.number().int().min(0).optional(),
    passed: z.boolean().optional(),
    skipped: z.boolean().optional(),
    signals: CandidateSignalsSchema.optional(),
    member: CandidateMemberSchema.optional(),
  })
  .passthrough();

export const CandidatesArraySchema = z
  .array(CandidateProfileSchema)
  .refine(
    (candidates) => {
      const ids = new Set<string>();
      for (const c of candidates) {
        const id = c.id ?? c.member?.id;
        if (id) {
          if (ids.has(id)) return false;
          ids.add(id);
        }
      }
      return true;
    },
    { message: "Candidate IDs must be unique across candidate profiles" }
  );
