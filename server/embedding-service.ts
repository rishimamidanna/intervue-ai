/**
 * server/embedding-service.ts
 *
 * Embedding Architecture & Provider Abstraction Engine (Milestone 5.1)
 *
 * Implements the core flow:
 * Chunk -> Embedding Service -> Vector Representation
 *
 * Provides a clean interface abstraction supporting pluggable and replaceable
 * embedding providers (Deterministic Mock, OpenAI, Cohere, Local Transformers).
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  CurriculumChunk,
  VectorEmbedding,
  EmbeddingConfig,
} from "@/types/rag";
import { VectorEmbeddingSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Provider Abstraction Contract
// ---------------------------------------------------------------------------

/**
 * Interface contract for all embedding providers.
 */
export interface IEmbeddingProvider {
  name: string;
  config: EmbeddingConfig;
  embedChunk(chunk: CurriculumChunk): Promise<VectorEmbedding>;
  embedBatch(chunks: CurriculumChunk[]): Promise<VectorEmbedding[]>;
}

// ---------------------------------------------------------------------------
// Deterministic Embedding Provider (Default / Offline)
// ---------------------------------------------------------------------------

/**
 * Deterministic Embedding Provider.
 * Generates normalized 384-dimensional float vector representations deterministically
 * without requiring external LLM APIs or downloading local weight models.
 */
export class DeterministicEmbeddingProvider implements IEmbeddingProvider {
  name = "deterministic-embedding-provider";
  config: EmbeddingConfig;

  constructor(dimensions: number = 384, model: string = "deterministic-384-v1") {
    this.config = {
      provider: "mock",
      model,
      dimensions,
      batchSize: 16,
    };
  }

  /**
   * Generates a validated vector embedding for a single CurriculumChunk.
   */
  async embedChunk(chunk: CurriculumChunk): Promise<VectorEmbedding> {
    const seed = `${chunk.chunkId}:${chunk.concept}:${chunk.content}`;
    const vector = this.generateNormalizedVector(seed, this.config.dimensions);

    const rawEmbedding: VectorEmbedding = {
      chunkId: chunk.chunkId,
      vector,
      dimensions: this.config.dimensions,
      modelName: this.config.model,
      metadata: chunk.metadata,
      createdAt: new Date().toISOString(),
    };

    return strictValidate(
      VectorEmbeddingSchema,
      rawEmbedding,
      `Vector Embedding for ${chunk.chunkId}`
    );
  }

  /**
   * Generates vector embeddings for a batch of CurriculumChunks.
   */
  async embedBatch(chunks: CurriculumChunk[]): Promise<VectorEmbedding[]> {
    return Promise.all(chunks.map((chunk) => this.embedChunk(chunk)));
  }

  /**
   * Mathematical hash algorithm to derive a normalized unit vector of dimension `dims`.
   */
  private generateNormalizedVector(seed: string, dims: number): number[] {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const rawVector: number[] = [];
    let normSq = 0;

    for (let i = 0; i < dims; i++) {
      const val = Math.sin(hash + i * 0.1337);
      rawVector.push(val);
      normSq += val * val;
    }

    const norm = Math.sqrt(normSq) || 1;
    return rawVector.map((val) => Number((val / norm).toFixed(6)));
  }
}

// ---------------------------------------------------------------------------
// Embedding Service Manager
// ---------------------------------------------------------------------------

/**
 * Core Embedding Service Orchestrator.
 * Accepts any `IEmbeddingProvider` implementation, allowing seamless swapping of models
 * and providers in production environments.
 */
export class EmbeddingService {
  private provider: IEmbeddingProvider;

  constructor(provider?: IEmbeddingProvider) {
    this.provider = provider || new DeterministicEmbeddingProvider();
  }

  /**
   * Swaps the active embedding provider dynamically.
   */
  setProvider(newProvider: IEmbeddingProvider): void {
    this.provider = newProvider;
  }

  /**
   * Returns current active provider name and configuration.
   */
  getActiveProviderInfo(): { name: string; config: EmbeddingConfig } {
    return {
      name: this.provider.name,
      config: this.provider.config,
    };
  }

  /**
   * Converts a single CurriculumChunk into a VectorEmbedding.
   */
  async embed(chunk: CurriculumChunk): Promise<VectorEmbedding> {
    return this.provider.embedChunk(chunk);
  }

  /**
   * Converts a batch of CurriculumChunks into an array of VectorEmbeddings.
   */
  async embedBatch(chunks: CurriculumChunk[]): Promise<VectorEmbedding[]> {
    return this.provider.embedBatch(chunks);
  }
}

/**
 * Singleton instance of EmbeddingService initialized with the default provider.
 */
export const defaultEmbeddingService = new EmbeddingService();
