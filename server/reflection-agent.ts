/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * server/reflection-agent.ts
 *
 * Self-Evaluation Reflection Agent Layer (Milestone 7.29)
 *
 * Implements an autonomous reflection layer checking answer quality (groundedness,
 * completeness, relevance, and interview appropriateness) before returning context or answers.
 *
 * Flow:
 *   Generated Answer + Context + Profile → Reflection Agent → Quality Evaluation Result
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  RetrievedChunk,
  ReflectionEvaluationResult,
  ReflectionEvaluationChecks,
} from "@/types/rag";
import type { CandidateProfile, CandidateIntelligenceProfile } from "@/types/candidate";
import { ReflectionEvaluationResultSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { defaultHallucinationGuard } from "./hallucination-guard";
import { defaultQueryAnalyzer } from "./query-analyzer";

export class ReflectionAgent {
  private groundednessWeight = 0.4;
  private relevanceWeight = 0.3;
  private completenessWeight = 0.3;

  /**
   * Configures weights dynamically.
   */
  configureWeights(weights: {
    groundedness?: number;
    relevance?: number;
    completeness?: number;
  }): void {
    if (weights.groundedness !== undefined) this.groundednessWeight = weights.groundedness;
    if (weights.relevance !== undefined) this.relevanceWeight = weights.relevance;
    if (weights.completeness !== undefined) this.completenessWeight = weights.completeness;

    // Normalize weights to sum to 1.0
    const total = this.groundednessWeight + this.relevanceWeight + this.completenessWeight;
    if (total > 0) {
      this.groundednessWeight /= total;
      this.relevanceWeight /= total;
      this.completenessWeight /= total;
    }
  }

  /**
   * Reflects upon and evaluates a generated response.
   *
   * @param question - Original interview question asked
   * @param answer - Generated answer response text
   * @param context - Reference retrieval context chunks or string
   * @param candidateProfile - Optional profile for interview quality checks
   * @returns ReflectionEvaluationResult Zod-validated payload
   */
  async reflect(
    question: string,
    answer: string,
    context: string | RetrievedChunk[],
    candidateProfile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>
  ): Promise<ReflectionEvaluationResult> {
    const improvements: string[] = [];
    const normalizedAnswer = answer.toLowerCase().trim();

    // 1. Groundedness Evaluation
    const groundednessAudit = defaultHallucinationGuard.verify(answer, context);
    const grounded = groundednessAudit.supported;
    if (!grounded) {
      const missing = groundednessAudit.unsupportedClaims.join(", ");
      improvements.push(`Groundedness audit failed. Ground answer claims in reference context. Unsupported claims detected: ${missing}`);
    }

    // 2. Completeness Evaluation (Keyword Coverage)
    const intent = await defaultQueryAnalyzer.analyze(question);
    const expectedKeywords = intent.keywords.slice(0, 4);

    let hits = 0;
    const missingKeywords: string[] = [];
    for (const kw of expectedKeywords) {
      if (normalizedAnswer.includes(kw.toLowerCase())) {
        hits++;
      } else {
        missingKeywords.push(kw);
      }
    }

    const keywordRatio = expectedKeywords.length > 0 ? hits / expectedKeywords.length : 1.0;
    const complete = keywordRatio >= 0.5 && normalizedAnswer.length >= 35;
    if (!complete) {
      improvements.push(`Completeness check failed. Include missing key concepts: [${missingKeywords.join(", ")}].`);
    }

    // 3. Relevance Evaluation
    // Checks if the answer contains any of the query keywords
    const relevant = expectedKeywords.some((kw) => normalizedAnswer.includes(kw.toLowerCase()));
    if (!relevant) {
      improvements.push("Relevance check failed. Make sure the response directly addresses the question query.");
    }

    // 4. Interview Quality Evaluation
    let scoreDeduction = 0.0;
    if (candidateProfile) {
      const rawProfile = candidateProfile as Record<string, any>;
      const level = rawProfile.experienceLevel || rawProfile.level || "Intermediate";

      if (level === "Advanced" && normalizedAnswer.length < 50) {
        scoreDeduction = 0.1;
        improvements.push("Interview quality warning: Response depth is too simplistic for an Advanced candidate.");
      }
    }

    // Calculate Quality score
    let answerQuality = 0.0;
    if (grounded) answerQuality += this.groundednessWeight;
    if (complete) answerQuality += this.completenessWeight;
    if (relevant) answerQuality += this.relevanceWeight;

    answerQuality = Number(Math.max(0, Math.min(1.0, answerQuality - scoreDeduction)).toFixed(2));

    const checks: ReflectionEvaluationChecks = {
      grounded,
      complete,
      relevant,
    };

    const result: ReflectionEvaluationResult = {
      answerQuality,
      checks,
      improvements,
    };

    return strictValidate(
      ReflectionEvaluationResultSchema,
      result,
      "Reflection Evaluation Result"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultReflectionAgent = new ReflectionAgent();
