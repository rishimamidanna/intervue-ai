/**
 * server/candidate-service.ts
 *
 * Candidate Data Service
 *
 * Loads, validates, and retrieves candidate profiles from candidates.json.
 * Provides typed access to candidate data for AI and server modules.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { CandidateProfile, CandidateMember } from "@/types/candidate";
import { CandidatesArraySchema } from "@/schemas/candidate.schema";
import { safeValidate } from "@/lib/validation";

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
 * Clears the candidate cache (useful for testing or dynamic reloads).
 */
export function clearCandidateCache(): void {
  _candidateCache = null;
}
