/**
 * server/retrieval-planner.ts
 *
 * Agentic Retrieval Planner Layer (Milestone 7.16)
 *
 * An intelligent planning layer that analyzes query intent, candidate profile details,
 * and curriculum taxonomy to design the optimal retrieval strategy BEFORE executing search.
 *
 * Flow:
 *   Question + Candidate Profile → Retrieval Planner → Retrieval Strategy → Adaptive Search execution
 *
 * Decisions Made:
 * - topK value (dynamically sized based on query depth, complexity, and profile targets)
 * - semantic search usage (leveraged for conceptual/comparative analysis)
 * - BM25 usage (leveraged for syntax, exact terms, and factual lookups)
 * - metadataFilter usage (enabled if target topics are matched in query or profile)
 * - memoryRetrieval usage (enabled to personalize context for candidate weaknesses)
 * - difficulty level selection (Beginner, Intermediate, Advanced)
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  RetrievalPlannerDecision,
  RetrievalStrategy,
  RetrievalOptions,
  RetrievedChunk,
} from "@/types/rag";
import type { CandidateProfile, CandidateIntelligenceProfile } from "@/types/candidate";
import { RetrievalPlannerDecisionSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { defaultQueryAnalyzer } from "./query-analyzer";
import { defaultRetrievalService } from "./retrieval-service";

export class AgenticRetrievalPlanner {
  /**
   * Plans the optimal RAG retrieval strategy for a query and candidate profile.
   *
   * @param query - Input search query
   * @param candidateProfile - Optional CandidateProfile or CandidateIntelligenceProfile
   * @returns RetrievalPlannerDecision
   */
  async plan(
    query: string,
    candidateProfile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>
  ): Promise<RetrievalPlannerDecision> {
    const rawProfile = (candidateProfile || {}) as Record<string, unknown>;
    const weakAreas: string[] = [];
    if (Array.isArray(rawProfile.weakAreas)) {
      weakAreas.push(...rawProfile.weakAreas.map(String));
    }
    if (Array.isArray(rawProfile.previousWeakTopics)) {
      weakAreas.push(...rawProfile.previousWeakTopics.map(String));
    }

    const reasoning: string[] = [];

    // 1. Analyze Query Intent & Topic
    const intentAnalysis = await defaultQueryAnalyzer.analyze(query);

    // 2. Decide Semantic & BM25 usage
    let semantic = true;
    let bm25 = true;

    if (intentAnalysis.intent === "conceptual" || intentAnalysis.intent === "comparison") {
      semantic = true;
      reasoning.push("Technical concept comparison/conceptual query: prioritizing high-dimensional semantic search.");
    }

    if (intentAnalysis.intent === "factual" || intentAnalysis.intent === "procedural") {
      bm25 = true;
      reasoning.push("Factual/procedural query: enabling sparse lexical BM25 matching to capture exact syntax and keyword terms.");
    }

    // 3. Decide Metadata Filtering
    let metadataFilter = false;
    if (intentAnalysis.topic && intentAnalysis.topic !== "General Enterprise AI") {
      metadataFilter = true;
      reasoning.push(`Specific curriculum topic "${intentAnalysis.topic}" identified: enabling structured metadata filtering.`);
    }

    // 4. Decide Memory Retrieval Requirement
    let memoryRetrieval = false;
    const matchedWeakArea = weakAreas.find(
      (wa) =>
        query.toLowerCase().includes(wa.toLowerCase()) ||
        intentAnalysis.keywords.some((k) => wa.toLowerCase().includes(k))
    );

    if (matchedWeakArea) {
      memoryRetrieval = true;
      metadataFilter = true;
      reasoning.push(`Candidate weakness in "${matchedWeakArea}" detected in query context: enabling personalized memory-enhanced retrieval.`);
    } else if (candidateProfile && weakAreas.length > 0) {
      memoryRetrieval = true;
      reasoning.push("Candidate profile available with weak areas: prioritizing memory retrieval to personalize context.");
    }

    // 5. Decide Difficulty level
    let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Intermediate";
    if (
      intentAnalysis.difficulty === "Beginner" ||
      intentAnalysis.difficulty === "Intermediate" ||
      intentAnalysis.difficulty === "Advanced"
    ) {
      difficulty = intentAnalysis.difficulty;
      reasoning.push(`Query content classified as ${difficulty} difficulty.`);
    } else if (typeof rawProfile.experienceLevel === "string") {
      const lvl = rawProfile.experienceLevel.toLowerCase();
      if (lvl.includes("begin")) {
        difficulty = "Beginner";
      } else if (lvl.includes("sen") || lvl.includes("adv")) {
        difficulty = "Advanced";
      }
      reasoning.push(`Adopting experience-level difficulty: ${difficulty}.`);
    }

    // 6. Decide topK value
    let topK = 5;
    if (intentAnalysis.requiredDepth === "deep-dive" || difficulty === "Advanced") {
      topK = 8;
      reasoning.push(`Advanced difficulty or deep-dive depth requested: expanding context pool size to topK=${topK}.`);
    } else if (intentAnalysis.requiredDepth === "overview") {
      topK = 3;
      reasoning.push(`Brief overview query intent: reducing context pool size to topK=${topK} to avoid noise.`);
    } else {
      reasoning.push(`Standard query complexity: adopting baseline topK=${topK}.`);
    }

    const strategy: RetrievalStrategy = {
      semantic,
      bm25,
      metadataFilter,
      topK,
      memoryRetrieval,
      difficulty,
    };

    const decision: RetrievalPlannerDecision = {
      query,
      strategy,
      reasoning,
    };

    return strictValidate(
      RetrievalPlannerDecisionSchema,
      decision,
      "Retrieval Planner Decision"
    );
  }

  /**
   * Executes adaptive RAG retrieval guided by the planner strategy decision.
   *
   * @param query - Input search query
   * @param candidateProfile - Optional profile for personalization
   * @param baseOptions - Optional custom overrides
   * @returns Object containing planner decision and retrieved results
   */
  async executePlannedSearch(
    query: string,
    candidateProfile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>,
    baseOptions?: RetrievalOptions
  ): Promise<{ decision: RetrievalPlannerDecision; results: RetrievedChunk[] }> {
    const decision = await this.plan(query, candidateProfile);
    const { strategy } = decision;

    const options: RetrievalOptions = {
      topK: baseOptions?.topK ?? strategy.topK,
      candidateProfile: candidateProfile as CandidateProfile,
      ...baseOptions,
    };

    // Apply metadata topic filter if decided
    if (strategy.metadataFilter) {
      const intent = await defaultQueryAnalyzer.analyze(query);
      if (intent.topic && intent.topic !== "General Enterprise AI") {
        let skillCategory: string | undefined;
        const topicLower = intent.topic.toLowerCase();

        if (topicLower.includes("embedding") || topicLower.includes("database") || topicLower.includes("similarity")) {
          skillCategory = "RAG Foundations";
        } else if (topicLower.includes("bm25") || topicLower.includes("hybrid") || topicLower.includes("rerank")) {
          skillCategory = "RAG Advanced";
        } else if (topicLower.includes("evaluation") || topicLower.includes("ragas")) {
          skillCategory = "Evaluation & Testing";
        } else if (topicLower.includes("agent") || topicLower.includes("workflow")) {
          skillCategory = "AI Agents & Tool Use";
        }

        if (skillCategory) {
          options.filter = {
            ...options.filter,
            skillCategory,
          };
        }
      }
    }

    // Configure retrieval provider based on strategy decision
    const currentProviderInfo = defaultRetrievalService.getActiveProviderInfo();

    if (strategy.memoryRetrieval && candidateProfile) {
      defaultRetrievalService.setProvider("candidate-aware");
    } else if (strategy.semantic && strategy.bm25) {
      defaultRetrievalService.setProvider("hybrid");
    } else if (strategy.semantic) {
      defaultRetrievalService.setProvider("semantic");
    } else if (strategy.bm25) {
      defaultRetrievalService.setProvider("bm25");
    }

    try {
      const response = await defaultRetrievalService.retrieve(query, options);
      return {
        decision,
        results: response.results,
      };
    } finally {
      // Restore previous provider
      defaultRetrievalService.setProvider(currentProviderInfo.name);
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultRetrievalPlanner = new AgenticRetrievalPlanner();
