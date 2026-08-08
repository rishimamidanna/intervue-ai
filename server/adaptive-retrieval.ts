/**
 * server/adaptive-retrieval.ts
 *
 * Adaptive Retrieval Engine (Milestone 7.12)
 *
 * Dynamically adjusts retrieval top-k strategy based on retrieval confidence analysis.
 * Integrates with existing confidence scoring (server/retrieval-confidence.ts).
 *
 * Flow:
 *   Retrieval → Confidence Analysis → Dynamic Retrieval Strategy
 *
 * Rules:
 *   - High confidence  → Retrieve fewer chunks (e.g. 3) to minimize noise and context bloat.
 *   - Medium confidence → Retrieve standard chunks (e.g. 5) for balanced context.
 *   - Low confidence   → Retrieve more chunks (e.g. 8) to maximize context recall.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  RetrievalOptions,
  RetrievalConfidenceAnalysis,
  AdaptiveRetrievalConfig,
  AdaptiveRetrievalStrategy,
  AdaptiveRetrievalResponse,
} from "@/types/rag";
import {
  AdaptiveRetrievalStrategySchema,
  AdaptiveRetrievalResponseSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { analyzeRetrievalConfidence } from "./retrieval-confidence";
import { performHybridSearch } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Configuration & Interfaces
// ---------------------------------------------------------------------------

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveRetrievalConfig = {
  highConfidenceTopK: 3,
  mediumConfidenceTopK: 5,
  lowConfidenceTopK: 8,
  initialCandidateK: 10,
};

export interface IAdaptiveStrategyProvider {
  name: string;
  determineStrategy(
    analysis: RetrievalConfidenceAnalysis,
    config: AdaptiveRetrievalConfig
  ): AdaptiveRetrievalStrategy;
}

// ---------------------------------------------------------------------------
// Default Adaptive Strategy Provider
// ---------------------------------------------------------------------------

export class DefaultAdaptiveStrategyProvider implements IAdaptiveStrategyProvider {
  name = "default-adaptive-strategy-provider-v1";

  determineStrategy(
    analysis: RetrievalConfidenceAnalysis,
    config: AdaptiveRetrievalConfig
  ): AdaptiveRetrievalStrategy {
    let selectedTopK: number;
    let reasoning: string;

    switch (analysis.confidence) {
      case "high":
        selectedTopK = config.highConfidenceTopK;
        reasoning = `High retrieval confidence (score: ${analysis.confidenceScore}); retrieving fewer (${config.highConfidenceTopK}) focused chunks to minimize context noise.`;
        break;

      case "medium":
        selectedTopK = config.mediumConfidenceTopK;
        reasoning = `Medium retrieval confidence (score: ${analysis.confidenceScore}); retrieving standard (${config.mediumConfidenceTopK}) chunks for balanced context.`;
        break;

      case "low":
      default:
        selectedTopK = config.lowConfidenceTopK;
        reasoning = `Low retrieval confidence (score: ${analysis.confidenceScore}); retrieving more (${config.lowConfidenceTopK}) chunks to maximize context recall.`;
        break;
    }

    const strategy: AdaptiveRetrievalStrategy = {
      confidence: analysis.confidence,
      selectedTopK,
      reasoning,
    };

    return strictValidate(
      AdaptiveRetrievalStrategySchema,
      strategy,
      "Adaptive Retrieval Strategy"
    );
  }
}

// ---------------------------------------------------------------------------
// Adaptive Retriever Engine
// ---------------------------------------------------------------------------

export class AdaptiveRetriever {
  private config: AdaptiveRetrievalConfig;
  private strategyProvider: IAdaptiveStrategyProvider;

  constructor(
    config?: Partial<AdaptiveRetrievalConfig>,
    strategyProvider?: IAdaptiveStrategyProvider
  ) {
    this.config = { ...DEFAULT_ADAPTIVE_CONFIG, ...config };
    this.strategyProvider = strategyProvider || new DefaultAdaptiveStrategyProvider();
  }

  /**
   * Sets active strategy provider (modular strategy pattern).
   */
  setStrategyProvider(provider: IAdaptiveStrategyProvider): void {
    this.strategyProvider = provider;
  }

  /**
   * Updates configuration.
   */
  setConfig(config: Partial<AdaptiveRetrievalConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Returns current provider info and active configuration.
   */
  getInfo(): { strategyProviderName: string; config: AdaptiveRetrievalConfig } {
    return {
      strategyProviderName: this.strategyProvider.name,
      config: { ...this.config },
    };
  }

  /**
   * Executes adaptive retrieval:
   * 1. Fetches candidate pool (initialCandidateK)
   * 2. Evaluates confidence analysis
   * 3. Determines dynamic top-k strategy
   * 4. Returns adaptively sized result set
   *
   * @param query - Input search query
   * @param options - Base retrieval options
   * @param configOverride - Optional per-call config overrides
   * @returns AdaptiveRetrievalResponse
   */
  async retrieveAdaptive(
    query: string,
    options?: RetrievalOptions,
    configOverride?: Partial<AdaptiveRetrievalConfig>
  ): Promise<AdaptiveRetrievalResponse> {
    const startTime = Date.now();
    const activeConfig = { ...this.config, ...configOverride };

    // 1. Initial Retrieval Pass — fetch candidate pool
    const initialTopK = activeConfig.initialCandidateK;
    const candidates: RetrievedChunk[] = await performHybridSearch(query, {
      ...options,
      topK: initialTopK,
    });

    // 2. Confidence Analysis using existing confidence analyzer (Milestone 7.4)
    const confidenceAnalysis = analyzeRetrievalConfidence(candidates);

    // 3. Determine Dynamic Strategy
    const strategy = this.strategyProvider.determineStrategy(
      confidenceAnalysis,
      activeConfig
    );

    // 4. Adaptively select top-k results
    const adaptivelySelectedResults = candidates.slice(0, strategy.selectedTopK);
    const durationMs = Date.now() - startTime;

    const rawResponse: AdaptiveRetrievalResponse = {
      query,
      strategy,
      confidenceAnalysis,
      results: adaptivelySelectedResults,
      totalRetrieved: adaptivelySelectedResults.length,
      durationMs,
      config: activeConfig,
    };

    return strictValidate(
      AdaptiveRetrievalResponseSchema,
      rawResponse,
      "Adaptive Retrieval Response"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultAdaptiveRetriever = new AdaptiveRetriever();
