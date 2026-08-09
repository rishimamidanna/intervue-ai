/**
 * server/vector-insertion-pipeline.ts
 *
 * Vector Insertion Pipeline (Milestone 5.5)
 *
 * Orchestrates the end-to-end vector insertion flow:
 * Embedding Output -> Vector Insertion Pipeline -> Vector DB Insert
 *
 * Supports:
 * - Batch insertion with configurable batch sizes
 * - Full preservation of chunk IDs, vector embeddings, text content, and metadata
 * - Duplicate chunk ID resolution and tracking
 * - Detailed insertion performance & count reporting (VectorInsertionReport)
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  VectorEmbedding,
  VectorRecord,
  VectorInsertionReport,
} from "@/types/rag";
import { VectorInsertionReportSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import {
  VectorStorageService,
  defaultVectorStorageService,
} from "./vector-storage-service";
import { generateAllCurriculumEmbeddings } from "./embedding-service";

/**
 * Core Vector Insertion Pipeline Engine.
 */
export class VectorInsertionPipeline {
  private vectorStorageService: VectorStorageService;

  constructor(vectorStorageService?: VectorStorageService) {
    this.vectorStorageService =
      vectorStorageService || defaultVectorStorageService;
  }

  /**
   * Inserts a single VectorEmbedding object into the vector database.
   *
   * @param embedding - VectorEmbedding
   * @returns Stored VectorRecord
   */
  async insertEmbedding(embedding: VectorEmbedding): Promise<VectorRecord> {
    return this.vectorStorageService.storeEmbedding(embedding);
  }

  /**
   * Inserts a batch of VectorEmbedding objects into the vector database in configurable chunk sizes.
   * Safely handles duplicate chunk IDs by updating/upserting existing records.
   *
   * @param embeddings - Array of VectorEmbedding objects
   * @param batchSize - Number of embeddings per insertion sub-batch (default: 100)
   * @returns VectorInsertionReport
   */
  async insertEmbeddingsBatch(
    embeddings: VectorEmbedding[],
    batchSize = 100
  ): Promise<VectorInsertionReport> {
    const startTime = Date.now();
    const totalSubmitted = embeddings ? embeddings.length : 0;

    if (!embeddings || embeddings.length === 0) {
      const emptyReport: VectorInsertionReport = {
        totalSubmitted: 0,
        totalInserted: 0,
        duplicateCount: 0,
        batchCount: 0,
        durationMs: 0,
        timestamp: new Date().toISOString(),
      };
      return strictValidate(
        VectorInsertionReportSchema,
        emptyReport,
        "Vector Insertion Report"
      );
    }

    // Deduplication check across submitted IDs
    const seenIds = new Set<string>();
    let duplicateCount = 0;

    for (const emb of embeddings) {
      if (seenIds.has(emb.chunkId)) {
        duplicateCount++;
      } else {
        seenIds.add(emb.chunkId);
      }
    }

    // Split into sub-batches
    const batches: VectorEmbedding[][] = [];
    for (let i = 0; i < embeddings.length; i += batchSize) {
      batches.push(embeddings.slice(i, i + batchSize));
    }

    // Process sub-batches sequentially into vector storage
    let totalInserted = 0;
    for (const batch of batches) {
      const stored = await this.vectorStorageService.storeEmbeddings(batch);
      totalInserted += stored.length;
    }

    const durationMs = Date.now() - startTime;

    const report: VectorInsertionReport = {
      totalSubmitted,
      totalInserted,
      duplicateCount,
      batchCount: batches.length,
      durationMs,
      timestamp: new Date().toISOString(),
    };

    return strictValidate(
      VectorInsertionReportSchema,
      report,
      "Vector Insertion Report"
    );
  }

  /**
   * End-to-end pipeline wrapper:
   * Generates all curriculum embeddings -> Inserts them into Vector DB foundation.
   */
  async runFullCurriculumInsertionPipeline(): Promise<VectorInsertionReport> {
    const embeddings = await generateAllCurriculumEmbeddings();
    return this.insertEmbeddingsBatch(embeddings);
  }
}

/**
 * Singleton instance of default VectorInsertionPipeline.
 */
export const defaultVectorInsertionPipeline = new VectorInsertionPipeline();
