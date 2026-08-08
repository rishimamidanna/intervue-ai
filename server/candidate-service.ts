/**
 * server/candidate-service.ts
 *
 * Candidate Data & Intelligence Service
 *
 * Loads and retrieves candidate profiles from candidate data, runs candidate intelligence analysis,
 * and builds structured RAG interview contexts.
 * Delegates file loading to candidate-loader, analysis to candidate-analyzer, and context building to context-builder.
 *
 * Owner: Member 2 (Backend / API)
 */

import type { CandidateProfile, CandidateIntelligenceProfile, StructuredInterviewContext } from "@/types/candidate";
import { loadCandidates as loadCandidatesFromLoader, loadCandidateById as loadCandidateByIdFromLoader } from "@/lib/loaders/candidate-loader";
import { analyzeCandidateProfile } from "@/lib/analyzer/candidate-analyzer";
import { getRelevantKnowledgeForCandidate } from "./curriculum-service";
import { buildInterviewContext } from "@/lib/rag/context-builder";

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
 * Generates an end-to-end StructuredInterviewContext for a candidate by ID.
 * Integrates candidate profile validation, intelligence analysis, curriculum retrieval, and context synthesis.
 *
 * @param candidateId - Candidate identifier (e.g. "CAND-001")
 * @returns StructuredInterviewContext or null if candidate not found
 */
export async function getInterviewContextForCandidate(
  candidateId: string
): Promise<StructuredInterviewContext | null> {
  const candidate = await getCandidateById(candidateId);
  if (!candidate) return null;

  const profile = analyzeCandidateProfile(candidate);
  const retrievalContext = await getRelevantKnowledgeForCandidate(profile);

  return buildInterviewContext(profile, retrievalContext);
}

/**
 * Clears the candidate cache (useful for testing).
 */
export function clearCandidateCache(): void {
  _candidateCache = null;
}
