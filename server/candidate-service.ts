/**
 * server/candidate-service.ts
 *
 * Candidate Data Service
 *
 * Loads and retrieves candidate profiles from the hackathon candidate data.
 * Delegates file loading and validation to the Data Loading Layer (lib/loaders/candidate-loader).
 * Provides typed access to candidate data for AI and server modules.
 *
 * Owner: Member 2 (Backend / API)
 */

import type { CandidateProfile } from "@/types/candidate";
import { loadCandidates as loadCandidatesFromLoader, loadCandidateById as loadCandidateByIdFromLoader } from "@/lib/loaders/candidate-loader";

// ---------------------------------------------------------------------------
// Data Loading Cache
// ---------------------------------------------------------------------------

let _candidateCache: CandidateProfile[] | null = null;

/**
 * Loads all candidate profiles from data/candidates.json via candidate loader.
 * Validates required fields using Zod schemas.
 *
 * @returns Array of CandidateProfile objects
 * @throws {Error} If the data cannot be loaded or fails validation
 */
export async function loadCandidates(): Promise<CandidateProfile[]> {
  if (_candidateCache) return _candidateCache;

  _candidateCache = await loadCandidatesFromLoader();
  return _candidateCache;
}

/**
 * Retrieves a single candidate profile by candidateId.
 *
 * @param candidateId - The candidate identifier (e.g. "CAND-001")
 * @returns CandidateProfile or null if not found
 */
export async function getCandidateById(
  candidateId: string
): Promise<CandidateProfile | null> {
  if (_candidateCache) {
    return _candidateCache.find((c) => c.member.id === candidateId) ?? null;
  }
  return loadCandidateByIdFromLoader(candidateId);
}

/**
 * Clears the candidate cache (useful for testing).
 */
export function clearCandidateCache(): void {
  _candidateCache = null;
}
