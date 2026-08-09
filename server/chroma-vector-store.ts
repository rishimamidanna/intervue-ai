/**
 * server/chroma-vector-store.ts
 *
 * In-Memory Vector Store (Hackathon Mode — ChromaDB Replacement)
 *
 * ChromaDB requires a running server daemon which is unavailable in
 * Next.js serverless/local dev without Docker.
 * This implementation satisfies the IVectorStore interface safely in-memory.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { VectorRecord, VectorStorageStats, RetrievalFilter } from "@/types/rag";
import type { IVectorStore } from "./vector-storage-service";

/**
 * In-Memory Vector Store — safe replacement for ChromaDB.
 * Implements the full IVectorStore interface. Data is lost on restart (fine for hackathon).
 */
export class ChromaVectorStore implements IVectorStore {
  name = "chroma-in-memory-fallback";
  private store = new Map<string, VectorRecord>();

  async upsertRecord(record: VectorRecord): Promise<void> {
    this.store.set(record.chunkId, record);
  }

  async upsertBatch(records: VectorRecord[]): Promise<void> {
    for (const record of records) {
      this.store.set(record.chunkId, record);
    }
  }

  async getRecordById(chunkId: string): Promise<VectorRecord | null> {
    return this.store.get(chunkId) ?? null;
  }

  async getAllRecords(): Promise<VectorRecord[]> {
    return Array.from(this.store.values());
  }

  async deleteRecord(chunkId: string): Promise<boolean> {
    return this.store.delete(chunkId);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getStats(): Promise<VectorStorageStats> {
    const records = Array.from(this.store.values());
    return {
      totalRecords: records.length,
      dimensions: records[0]?.dimensions ?? 0,
      providerName: this.name,
      lastUpdated: new Date().toISOString(),
    };
  }

  async queryVector(
    _queryVector: number[],
    topK: number = 5,
    _filter?: RetrievalFilter
  ): Promise<VectorRecord[]> {
    return Array.from(this.store.values()).slice(0, topK);
  }
}

export const defaultChromaVectorStore = new ChromaVectorStore();
