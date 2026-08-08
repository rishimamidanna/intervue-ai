/**
 * server/embedding-service.ts
 *
 * Embedding Architecture & Embedding Generator Engine (Milestone 5.1 & 5.2)
 *
 * Implements the core flow:
 * Chunk -> Embedding Service -> Vector Representation
 *
 * Connects validated curriculum chunks to a deterministic embedding provider,
 * generating strongly typed VectorEmbedding objects preserving chunkId, original content,
 * vector array, and metadata reference.
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
import { generateAllCurriculumChunks, getChunksByDay } from "./chunking-service";

// ---------------------------------------------------------------------------
// In-Memory Embeddings Cache
// ---------------------------------------------------------------------------

let _embeddingsCache: VectorEmbedding[] | null = null;

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
 * from chunk content without requiring external LLM APIs or downloading local weight models.
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
      content: chunk.content,
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
    _embeddingsCache = null;
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

// ---------------------------------------------------------------------------
// High-Level Embedding Generation Pipeline (Milestone 5.2)
// ---------------------------------------------------------------------------

/**
 * Generates a VectorEmbedding object for a single CurriculumChunk using defaultEmbeddingService.
 *
 * @param chunk - CurriculumChunk
 * @returns VectorEmbedding
 */
export async function generateChunkEmbedding(
  chunk: CurriculumChunk
): Promise<VectorEmbedding> {
  return defaultEmbeddingService.embed(chunk);
}

/**
 * Generates VectorEmbeddings for all validated curriculum chunks.
 * Caches generated embeddings in memory.
 *
 * @returns Array of VectorEmbedding objects
 */
export async function generateAllCurriculumEmbeddings(): Promise<
  VectorEmbedding[]
> {
  if (_embeddingsCache) return _embeddingsCache;

  const chunks = await generateAllCurriculumChunks();
  _embeddingsCache = await defaultEmbeddingService.embedBatch(chunks);
  return _embeddingsCache;
}

/**
 * Retrieves generated VectorEmbeddings for a specific curriculum day.
 *
 * @param day - Day number (1-indexed)
 * @returns Array of VectorEmbedding objects
 */
export async function getEmbeddingsByDay(
  day: number
): Promise<VectorEmbedding[]> {
  const dayChunks = await getChunksByDay(day);
  return defaultEmbeddingService.embedBatch(dayChunks);
}

/**
 * Retrieves VectorEmbedding by chunk ID.
 *
 * @param chunkId - Target chunk ID
 * @returns VectorEmbedding or undefined
 */
export async function getEmbeddingByChunkId(
  chunkId: string
): Promise<VectorEmbedding | undefined> {
  const allEmbeddings = await generateAllCurriculumEmbeddings();
  return allEmbeddings.find((emb) => emb.chunkId === chunkId);
}

/**
 * Clears the in-memory embeddings cache.
 */
export function clearEmbeddingCache(): void {
  _embeddingsCache = null;
}
