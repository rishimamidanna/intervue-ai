/**
 * server/candidate-service.ts
 *
 * Candidate Data Service
 *
 * Loads, validates, and retrieves candidate profiles from candidates.json.
 * Provides typed access to candidate data and intelligence profiles.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { CandidateProfile, CandidateMember, CandidateIntelligenceProfile } from "@/types/candidate";
import { CandidatesArraySchema } from "@/schemas/candidate.schema";
import { safeValidate } from "@/lib/validation";
import { analyzeCandidateIntelligence } from "./candidate-intelligence";
import { loadCurriculum } from "./curriculum-service";

// ---------------------------------------------------------------------------
// Data Loading & Caching
// ---------------------------------------------------------------------------

let _candidateCache: CandidateProfile[] | null = null;

/**
 * Loads and validates all candidate profiles from data/candidates.json.
 * Normalizes top-level candidate properties and nested member details.
 *
 * @returns Array of CandidateProfile objects
 * @throws {Error} If the data cannot be loaded or fails schema validation
 */
export async function loadCandidates(): Promise<CandidateProfile[]> {
  if (_candidateCache) return _candidateCache;

  let raw: unknown;
  try {
    raw = (await import("@/data/candidates.json")).default;
  } catch (err) {
    throw new Error(
      `Failed to load candidates.json: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const result = safeValidate(CandidatesArraySchema, raw);
  if (!result.success) {
    throw new Error(
      `Candidate data validation failed:\n${result.errors.join("\n")}`
    );
  }

  _candidateCache = result.data.map((c) => {
    const id = c.id ?? c.member?.id ?? "unknown";
    const role = c.role ?? c.member?.jobRole ?? "Software Engineer";
    const experience = c.experience ?? c.member?.yearsExperience ?? 0;

    const member: CandidateMember = c.member ?? {
      id,
      jobRole: role,
      yearsExperience: experience,
    };

    return {
      ...c,
      id,
      role,
      experience,
      member,
    };
  });

  return _candidateCache;
}

/**
 * Retrieves a single candidate profile by candidate identifier.
 * Matches against root candidate id or candidate member.id.
 *
 * @param candidateId - The candidate identifier
 * @returns CandidateProfile or null if not found
 */
export async function getCandidateById(
  candidateId: string
): Promise<CandidateProfile | null> {
  const candidates = await loadCandidates();
  return (
    candidates.find(
      (c) => c.id === candidateId || c.member?.id === candidateId
    ) ?? null
  );
}

/**
 * Retrieves the generated Candidate Intelligence Profile for a given candidate ID.
 *
 * @param candidateId - The candidate identifier
 * @returns CandidateIntelligenceProfile or null if candidate not found
 */
export async function getCandidateIntelligenceProfile(
  candidateId: string
): Promise<CandidateIntelligenceProfile | null> {
  const candidate = await getCandidateById(candidateId);
  if (!candidate) return null;

  let curriculum;
  try {
    curriculum = await loadCurriculum();
  } catch {
    curriculum = undefined;
  }

  return analyzeCandidateIntelligence(candidate, curriculum);
}

/**
 * Clears the candidate cache (useful for testing or dynamic reloads).
 */
export function clearCandidateCache(): void {
  _candidateCache = null;
}
