/**
 * server/candidate-service.ts
 *
 * Candidate Data Service
 *
 * Loads and retrieves candidate profiles from the hackathon candidate data.
 * Provides typed access to candidate data for the AI modules.
 *
 * Owner: Member 2 (Backend / API)
 *
 * TODO: After receiving the official hackathon candidates.json:
 *   1. Update CandidateProfile type in types/candidate.ts to match actual schema
 *   2. Replace data/candidates.json with the real candidate data
 *   3. Implement any required data transformation here
 */

import type { CandidateProfile } from "@/types/candidate";

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

let _candidateCache: CandidateProfile[] | null = null;

/**
 * Loads all candidate profiles from data/candidates.json.
 *
 * @returns Array of CandidateProfile objects
 * @throws {Error} If the data cannot be loaded
 */
export async function loadCandidates(): Promise<CandidateProfile[]> {
  if (_candidateCache) return _candidateCache;

  const raw = (await import("@/data/candidates.json")).default as unknown;

  // Handle both array format (scaffold) and real object format { candidates: [...] }
  let candidates: CandidateProfile[];
  if (Array.isArray(raw)) {
    candidates = raw as CandidateProfile[];
  } else if (raw && typeof raw === "object" && "candidates" in raw) {
    candidates = (raw as { candidates: CandidateProfile[] }).candidates;
  } else {
    throw new Error("candidates.json must be an array or an object with a 'candidates' array");
  }

  _candidateCache = candidates;
  return _candidateCache;
}

/**
 * Retrieves a single candidate profile by candidateId.
 *
 * @param candidateId - The candidate identifier
 * @returns CandidateProfile or null if not found
 */
export async function getCandidateById(
  candidateId: string
): Promise<CandidateProfile | null> {
  const candidates = await loadCandidates();
  return candidates.find((c) => c.member?.id === candidateId) ?? null;
}

/**
 * Clears the candidate cache (useful for testing).
 */
export function clearCandidateCache(): void {
  _candidateCache = null;
}
