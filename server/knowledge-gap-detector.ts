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
} from "@/types/rag";
import { KnowledgeGapResponseSchema } from "@/schemas/rag.schema";
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

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultKnowledgeGapDetector = new KnowledgeGapDetector();
