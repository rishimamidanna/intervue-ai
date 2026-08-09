/**
 * server/knowledge-gap-detector.ts
 *
 * Knowledge Gap Detection Layer (Milestone 7.19)
 *
 * Analyzes candidate answers against question intent and retrieval context,
 * checks candidate memory history for repeating issues, and identifies
 * foundational knowledge gaps and remedial recommendations.
 *
 * Flow:
 *   Candidate Answer + Retrieval Context + Memory → Knowledge Gap Detector → Structured Gaps
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  KnowledgeGap,
  KnowledgeGapResponse,
  LightweightGapInput,
  LightweightGapOutput,
} from "@/types/rag";
import { KnowledgeGapResponseSchema, LightweightGapOutputSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { defaultQueryAnalyzer } from "./query-analyzer";
import { defaultInterviewMemoryRAG } from "./interview-memory";

export class KnowledgeGapDetector {
  /**
   * Detects missing knowledge after a candidate answers an interview question.
   *
   * @param candidateId - Active candidate identifier
   * @param question - Interview question asked
   * @param answer - Candidate response text
   * @param retrievalContext - Optional RAG context chunks or references provided
   * @returns KnowledgeGapResponse containing identified gaps
   */
  async detectGaps(
    candidateId: string,
    question: string,
    answer: string,
    retrievalContext?: string
  ): Promise<KnowledgeGapResponse> {
    const intent = await defaultQueryAnalyzer.analyze(question);
    const skill = intent.topic || "General Enterprise AI";
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedQuestion = question.trim().toLowerCase();

    const gapsDetected: KnowledgeGap[] = [];

    // Load candidate's memory to check for recurring weaknesses
    const memory = await defaultInterviewMemoryRAG.getOrCreateMemory(candidateId);
    const isExistingWeakArea = memory.weakAreas.some(
      (wa) =>
        wa.toLowerCase() === skill.toLowerCase() ||
        skill.toLowerCase().includes(wa.toLowerCase()) ||
        wa.toLowerCase().includes(skill.toLowerCase()) ||
        normalizedQuestion.includes(wa.toLowerCase())
    );

    // Heuristic Rules for Gap Detection
    const isShortAnswer = normalizedAnswer.length < 35;
    const indicatesIgnorance = /\b(don't know|no idea|forget|forgot|not sure|unsure|skip|pass)\b/i.test(normalizedAnswer);

    // Keyword relevance check: does the candidate omit critical keywords from the retrievalContext or intent?
    const missingKeywords: string[] = [];
    if (intent.keywords.length > 0) {
      for (const kw of intent.keywords.slice(0, 3)) {
        if (!normalizedAnswer.includes(kw.toLowerCase())) {
          if (!retrievalContext || retrievalContext.toLowerCase().includes(kw.toLowerCase())) {
            missingKeywords.push(kw);
          }
        }
      }
    }

    if (isShortAnswer || indicatesIgnorance) {
      // 1. High/Medium Severity Gap
      const severity = isExistingWeakArea ? "high" : "medium";
      const gap = indicatesIgnorance
        ? `Candidate acknowledged lack of understanding or forgot details for "${skill}".`
        : `Answer is too brief to demonstrate operational understanding of "${skill}".`;

      const recommendation = isExistingWeakArea
        ? `Ask prerequisite question or foundational concept regarding "${skill}" to debug understanding.`
        : `Ask related beginner concept question to reinforce foundations of "${skill}".`;

      gapsDetected.push({
        skill,
        gap,
        severity,
        recommendation,
      });
    } else if (missingKeywords.length > 0) {
      // 2. Low Severity Gap: Omission of core terms
      const severity = "low";
      const gap = `Answer omitted critical concepts: [${missingKeywords.join(", ")}].`;
      const recommendation = `Provide brief explanatory feedback on [${missingKeywords.join(", ")}] and proceed.`;

      gapsDetected.push({
        skill,
        gap,
        severity,
        recommendation,
      });
    } else {
      // 3. No gap detected
      gapsDetected.push({
        skill,
        gap: "No knowledge gap detected. Candidate response matches topic criteria.",
        severity: "none",
        recommendation: "Proceed to next level or concept.",
      });
    }

    const response: KnowledgeGapResponse = {
      candidateId,
      gapsDetected,
    };

    return strictValidate(
      KnowledgeGapResponseSchema,
      response,
      "Knowledge Gap Response"
    );
  }
}

/**
 * Milestone 7.33 — Lightweight Concept Knowledge Gap Detection.
 * Compares expected concepts against candidate answer, outputs missing/covered concepts & severity,
 * and updates candidate memory store if candidateId is supplied.
 *
 * @param input - LightweightGapInput (question, expectedConcepts, candidateAnswer)
 * @param candidateId - Optional candidate ID to save detected gaps into persistent memory
 * @returns LightweightGapOutput (missingConcepts, coveredConcepts, severity)
 */
export async function detectLightweightKnowledgeGaps(
  input: LightweightGapInput,
  candidateId?: string
): Promise<LightweightGapOutput> {
  const { expectedConcepts, candidateAnswer } = input;
  const normalizedAnswer = (candidateAnswer || "").trim().toLowerCase();

  const coveredConcepts: string[] = [];
  const missingConcepts: string[] = [];

  for (const concept of expectedConcepts) {
    const normConcept = concept.trim().toLowerCase();
    const terms = normConcept.split(/\s+/).filter((t) => t.length > 2);

    const isCovered =
      normalizedAnswer.includes(normConcept) ||
      (terms.length > 0 && terms.some((term) => normalizedAnswer.includes(term)));

    if (isCovered && normalizedAnswer.length > 0) {
      coveredConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  }

  let severity: "low" | "medium" | "high" = "low";
  if (expectedConcepts.length > 0) {
    if (missingConcepts.length === expectedConcepts.length) {
      severity = "high";
    } else if (missingConcepts.length > 0) {
      severity = "medium";
    } else {
      severity = "low";
    }
  }

  const rawOutput: LightweightGapOutput = {
    missingConcepts,
    coveredConcepts,
    severity,
  };

  if (candidateId) {
    const correctnessScore = severity === "high" ? 2 : severity === "medium" ? 5 : 9;
    await defaultInterviewMemoryRAG.updateCandidateLearningMemory(
      candidateId,
      { topic: input.question || "General" },
      {
        coveredConcepts,
        missingConcepts,
        misconceptions: [],
        correctness: correctnessScore,
      }
    );
  }

  return strictValidate(
    LightweightGapOutputSchema,
    rawOutput,
    "Lightweight Gap Output"
  );
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultKnowledgeGapDetector = new KnowledgeGapDetector();
