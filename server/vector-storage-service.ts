/**
 * server/vector-storage-service.ts
 *
 * Vector Storage Architecture & Service Layer (Milestone 5.3)
 *
 * Implements the core flow:
 * Embedding Object -> Vector Storage Service -> Persistent Vector Database
 *
 * Provides a modular, pluggable vector storage engine supporting storing
 * embeddings, original chunk content, and metadata with fast O(1) ID lookups.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { VectorEmbedding, RetrievalFilter } from "@/types/rag";
import type { VectorRecord, VectorStorageStats } from "@/types/rag";
import {
  VectorRecordSchema,
  VectorStorageStatsSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { ChromaVectorStore } from "./chroma-vector-store";
import { defaultVectorDBConfig } from "@/config/vector-db.config";

// ---------------------------------------------------------------------------
// Vector Storage Abstraction Contract
// ---------------------------------------------------------------------------

/**
 * Interface contract for all replaceable vector storage engines.
 */
export interface IVectorStore {
  name: string;
  upsertRecord(record: VectorRecord): Promise<void>;
  upsertBatch(records: VectorRecord[]): Promise<void>;
  getRecordById(chunkId: string): Promise<VectorRecord | null>;
  getAllRecords(): Promise<VectorRecord[]>;
  deleteRecord(chunkId: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<VectorStorageStats>;
  queryVector?(
    queryVector: number[],
    topK?: number,
    filter?: RetrievalFilter
  ): Promise<VectorRecord[]>;
}

// ---------------------------------------------------------------------------
// In-Memory Vector Store Implementation (Default / Production-Ready Index)
// ---------------------------------------------------------------------------

/**
 * Production-ready In-Memory Vector Store implementation.
 * Stores VectorRecords indexed by chunkId for O(1) retrieval.
 */
export class InMemoryVectorStore implements IVectorStore {
  name = "in-memory-vector-store";
  private store = new Map<string, VectorRecord>();

  /**
   * Upserts a single VectorRecord.
   */
  async upsertRecord(record: VectorRecord): Promise<void> {
    const validated = strictValidate(
      VectorRecordSchema,
      record,
      `Vector Record ${record.chunkId}`
    );
    this.store.set(validated.chunkId, validated);
  }

  /**
   * Upserts a batch of VectorRecords.
   */
  async upsertBatch(records: VectorRecord[]): Promise<void> {
    for (const record of records) {
      await this.upsertRecord(record);
    }
  }

  /**
   * Retrieves a stored record by chunkId.
   */
  async getRecordById(chunkId: string): Promise<VectorRecord | null> {
    return this.store.get(chunkId) || null;
  }

  /**
   * Retrieves all stored vector records.
   */
  async getAllRecords(): Promise<VectorRecord[]> {
    return Array.from(this.store.values());
  }

  /**
   * Deletes a record by chunkId.
   */
  async deleteRecord(chunkId: string): Promise<boolean> {
    return this.store.delete(chunkId);
  }

  /**
   * Clears all stored vector records.
   */
  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Calculates and returns storage stats.
   */
  async getStats(): Promise<VectorStorageStats> {
    const records = Array.from(this.store.values());
    const dimensions = records.length > 0 ? records[0].dimensions : 0;

    const stats: VectorStorageStats = {
      totalRecords: records.length,
      dimensions,
      providerName: this.name,
      lastUpdated: new Date().toISOString(),
    };

    return strictValidate(
      VectorStorageStatsSchema,
      stats,
      "Vector Storage Stats"
    );
  }
}

// ---------------------------------------------------------------------------
// Vector Storage Service Manager
// ---------------------------------------------------------------------------

/**
 * Core Vector Storage Service Manager.
 * Accepts any `IVectorStore` implementation, allowing seamless swapping of backend vector DBs
 * (Pinecone, ChromaDB, Qdrant, pgvector, InMemory).
 */
export class VectorStorageService {
  private store: IVectorStore;

  constructor(store?: IVectorStore) {
    this.store =
      store ||
      (defaultVectorDBConfig.provider === "in-memory"
        ? new InMemoryVectorStore()
        : new ChromaVectorStore());
  }

  /**
   * Swaps the active vector storage implementation dynamically.
   */
  setStore(newStore: IVectorStore): void {
    this.store = newStore;
  }

  /**
   * Returns active store name and current storage statistics.
   */
  async getStats(): Promise<VectorStorageStats> {
    return this.store.getStats();
  }

  /**
   * Converts a VectorEmbedding object into a VectorRecord and stores it.
   *
   * @param embedding - VectorEmbedding
   * @returns Stored VectorRecord
   */
  async storeEmbedding(embedding: VectorEmbedding): Promise<VectorRecord> {
    const record: VectorRecord = {
      chunkId: embedding.chunkId,
      vector: embedding.vector,
      content: embedding.content,
      metadata: embedding.metadata,
      dimensions: embedding.dimensions,
      createdAt: embedding.createdAt || new Date().toISOString(),
    };

    await this.store.upsertRecord(record);
    return record;
  }

  /**
   * Converts a batch of VectorEmbedding objects into VectorRecords and stores them.
   *
   * @param embeddings - Array of VectorEmbedding objects
   * @returns Array of stored VectorRecord objects
   */
  async storeEmbeddings(
    embeddings: VectorEmbedding[]
  ): Promise<VectorRecord[]> {
    const records: VectorRecord[] = embeddings.map((emb) => ({
      chunkId: emb.chunkId,
      vector: emb.vector,
      content: emb.content,
      metadata: emb.metadata,
      dimensions: emb.dimensions,
      createdAt: emb.createdAt || new Date().toISOString(),
    }));

    await this.store.upsertBatch(records);
    return records;
  }

  /**
   * Retrieves a stored vector record by chunkId.
   *
   * @param chunkId - Target chunkId
   * @returns Stored VectorRecord or null if not found
   */
  async getRecord(chunkId: string): Promise<VectorRecord | null> {
    return this.store.getRecordById(chunkId);
  }

  /**
   * Retrieves all stored vector records.
   *
   * @returns Array of stored VectorRecord objects
   */
  async getAllRecords(): Promise<VectorRecord[]> {
    return this.store.getAllRecords();
  }

  /**
   * Deletes a record by chunkId.
   */
  async deleteRecord(chunkId: string): Promise<boolean> {
    return this.store.deleteRecord(chunkId);
  }

  /**
   * Clears vector storage.
   */
  async clear(): Promise<void> {
    return this.store.clear();
  }

  /**
   * Queries vector DB store for vector similarity.
   */
  async queryVector(
    queryVector: number[],
    topK?: number,
    filter?: RetrievalFilter
  ): Promise<VectorRecord[]> {
    if (this.store.queryVector) {
      return this.store.queryVector(queryVector, topK, filter);
    }
    return this.store.getAllRecords();
  }
}

/**
 * Singleton instance of VectorStorageService initialized with the default store.
 */
export const defaultVectorStorageService = new VectorStorageService();
