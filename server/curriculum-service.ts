/**
 * server/curriculum-service.ts
 *
 * Curriculum Data Service
 *
 * Loads and indexes the hackathon curriculum JSON. Delegates validation,
 * normalization, knowledge unit processing, and candidate retrieval to Data Loaders,
 * Processors, and Retrievers.
 * Provides typed, O(1) lookup of curriculum days and knowledge units for AI modules.
 *
 * Owner: Member 2 (Backend / API)
 */

import type { CandidateIntelligenceProfile } from "@/types/candidate";
import type { CurriculumDay, CurriculumIndex, CurriculumKnowledgeUnit, RelevantKnowledgeContext } from "@/types/curriculum";
import {
  loadCurriculum as loadCurriculumData,
  getCurriculumIndex as getIndexFromLoader,
  getCurriculumDay as getDayFromLoader,
} from "@/lib/loaders/curriculum-loader";
import { processCurriculumData } from "@/lib/processors/curriculum-processor";
import { retrieveRelevantKnowledge } from "@/lib/retrieval/curriculum-retriever";

// ---------------------------------------------------------------------------
// Data Loading Cache
// ---------------------------------------------------------------------------

let _curriculumCache: CurriculumDay[] | null = null;
let _unitsCache: CurriculumKnowledgeUnit[] | null = null;

/**
 * Loads and returns the full curriculum as an ordered array of CurriculumDay objects.
 * Data is read and validated from data/curriculum.json.
 *
 * @returns Array of CurriculumDay objects
 * @throws {Error} If the data file cannot be loaded or is invalid
 */
export async function loadCurriculum(): Promise<CurriculumDay[]> {
  if (_curriculumCache) return _curriculumCache;

  const curriculumData = await loadCurriculumData();
  _curriculumCache = curriculumData.days;
  return _curriculumCache;
}

/**
 * Returns processed curriculum knowledge units ready for search/retrieval indexing.
 *
 * @returns CurriculumKnowledgeUnit[]
 */
export async function getProcessedCurriculum(): Promise<CurriculumKnowledgeUnit[]> {
  if (_unitsCache) return _unitsCache;

  const curriculumData = await loadCurriculumData();
  _unitsCache = processCurriculumData(curriculumData);
  return _unitsCache;
}

/**
 * Retrieves the most relevant curriculum knowledge units and context for a candidate.
 *
 * @param candidateProfile - CandidateIntelligenceProfile from Milestone 1.2
 * @returns RelevantKnowledgeContext
 */
export async function getRelevantKnowledgeForCandidate(
  candidateProfile: CandidateIntelligenceProfile
): Promise<RelevantKnowledgeContext> {
  const units = await getProcessedCurriculum();
  return retrieveRelevantKnowledge(candidateProfile, units);
}

/**
 * Returns the curriculum indexed by day number for O(1) day lookups.
 *
 * @returns CurriculumIndex — Record<number, CurriculumDay>
 */
export async function getCurriculumIndex(): Promise<CurriculumIndex> {
  return getIndexFromLoader();
}

/**
 * Retrieves a single curriculum day by its day number.
 *
 * @param day - The day number (1–31)
 * @returns CurriculumDay or undefined if not found
 */
export async function getCurriculumDay(
  day: number
): Promise<CurriculumDay | undefined> {
  const result = await getDayFromLoader(day);
  return result ?? undefined;
}

/**
 * Clears the curriculum cache (useful for testing).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
  _unitsCache = null;
}
