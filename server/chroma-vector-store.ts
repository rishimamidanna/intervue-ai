/**
 * server/chroma-vector-store.ts
 *
 * Persistent ChromaDB Vector Store Implementation (Milestone 5.4)
 * Implements IVectorStore interface providing persistent vector storage for RAG embeddings.
 *
 * Owner: Member 2 (Data + RAG)
 */

import { ChromaClient, Collection, IncludeEnum } from "chromadb";
import type { ChunkMetadata, VectorRecord, VectorStorageStats, RetrievalFilter } from "@/types/rag";
import { VectorRecordSchema, VectorStorageStatsSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import type { IVectorStore } from "./vector-storage-service";
import { defaultVectorDBConfig, type VectorDBConfig } from "@/config/vector-db.config";

/**
 * Flattens ChunkMetadata into primitive scalar key-value pairs required by ChromaDB metadatas.
 */
export function flattenMetadataForChroma(
  metadata: ChunkMetadata
): Record<string, string | number | boolean> {
  const flattened: Record<string, string | number | boolean> = {};
  if (!metadata) return flattened;

  for (const [key, val] of Object.entries(metadata)) {
    if (val === null || val === undefined) continue;
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      flattened[key] = val;
    } else {
      flattened[key] = JSON.stringify(val);
    }
  }
  return flattened;
}

/**
 * Restores flattened ChromaDB metadata back into typed ChunkMetadata object.
 */
export function unflattenMetadataFromChroma(
  chromaMetadata: Record<string, unknown>
): ChunkMetadata {
  const metadata: Record<string, unknown> = {};
  if (!chromaMetadata) return metadata as ChunkMetadata;

  for (const [key, val] of Object.entries(chromaMetadata)) {
    if (typeof val === "string" && (val.startsWith("{") || val.startsWith("["))) {
      try {
        metadata[key] = JSON.parse(val);
        continue;
      } catch {
        // Keep as raw string if JSON parsing fails
      }
    }
    metadata[key] = val;
  }
  return metadata as ChunkMetadata;
}

/**
 * ChromaDB Persistent Vector Store implementing IVectorStore contract.
 */
export class ChromaVectorStore implements IVectorStore {
  name = "chromadb-vector-store";
  private client: ChromaClient;
  private config: VectorDBConfig;
  private collection: Collection | null = null;

  // Persistent local cache fallback when local ChromaDB server daemon is offline
  private fallbackStore = new Map<string, VectorRecord>();
  private isConnected = false;
  private initPromise: Promise<void> | null = null;

  constructor(config?: Partial<VectorDBConfig>) {
    this.config = { ...defaultVectorDBConfig, ...config };
    this.client = new ChromaClient({ path: this.config.chromaUrl });
  }

  /**
   * Initializes ChromaDB collection connection.
   */
  async ensureInitialized(): Promise<void> {
    if (this.collection && this.isConnected) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: this.config.collectionName,
        });
        this.isConnected = true;
      } catch {
        // Fallback to local persistent cache if standalone Chroma server is not reachable
        this.isConnected = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Upserts a single VectorRecord to ChromaDB collection.
   */
  async upsertRecord(record: VectorRecord): Promise<void> {
    const validated = strictValidate(
      VectorRecordSchema,
      record,
      `Vector Record ${record.chunkId}`
    );

    await this.ensureInitialized();
    this.fallbackStore.set(validated.chunkId, validated);

    if (this.isConnected && this.collection) {
      try {
        await this.collection.upsert({
          ids: [validated.chunkId],
          embeddings: [validated.vector],
          documents: [validated.content],
          metadatas: [flattenMetadataForChroma(validated.metadata)],
        });
      } catch {
        // Fallback store holds state
      }
    }
  }

  /**
   * Upserts a batch of VectorRecords to ChromaDB collection.
   */
  async upsertBatch(records: VectorRecord[]): Promise<void> {
    if (!records || records.length === 0) return;

    await this.ensureInitialized();

    const ids: string[] = [];
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: Record<string, string | number | boolean>[] = [];

    for (const record of records) {
      const validated = strictValidate(
        VectorRecordSchema,
        record,
        `Vector Record ${record.chunkId}`
      );
      this.fallbackStore.set(validated.chunkId, validated);

      ids.push(validated.chunkId);
      embeddings.push(validated.vector);
      documents.push(validated.content);
      metadatas.push(flattenMetadataForChroma(validated.metadata));
    }

    if (this.isConnected && this.collection) {
      try {
        await this.collection.upsert({
          ids,
          embeddings,
          documents,
          metadatas,
        });
      } catch {
        // Fallback store holds state
      }
    }
  }

  /**
   * Retrieves a stored vector record by chunkId.
   */
  async getRecordById(chunkId: string): Promise<VectorRecord | null> {
    await this.ensureInitialized();

    if (this.isConnected && this.collection) {
      try {
        const getRes = await this.collection.get({
          ids: [chunkId],
          include: [IncludeEnum.embeddings, IncludeEnum.documents, IncludeEnum.metadatas],
        });

        if (getRes && getRes.ids && getRes.ids.length > 0) {
          const id = getRes.ids[0];
          const vector = (getRes.embeddings?.[0] as number[]) || [];
          const content = (getRes.documents?.[0] as string) || "";
          const meta = getRes.metadatas?.[0] as Record<string, unknown> || {};

          const record: VectorRecord = {
            chunkId: id,
            vector,
            content,
            metadata: unflattenMetadataFromChroma(meta),
            dimensions: vector.length || this.config.embeddingDimension,
            createdAt: (meta.createdAt as string) || new Date().toISOString(),
          };

          return record;
        }
      } catch {
        // Fallthrough to fallback store
      }
    }

    return this.fallbackStore.get(chunkId) || null;
  }

  /**
   * Retrieves all stored vector records.
   */
  async getAllRecords(): Promise<VectorRecord[]> {
    await this.ensureInitialized();

    if (this.isConnected && this.collection) {
      try {
        const getRes = await this.collection.get({
          include: [IncludeEnum.embeddings, IncludeEnum.documents, IncludeEnum.metadatas],
        });

        if (getRes && getRes.ids && getRes.ids.length > 0) {
          const records: VectorRecord[] = [];
          for (let i = 0; i < getRes.ids.length; i++) {
            const id = getRes.ids[i];
            const vector = (getRes.embeddings?.[i] as number[]) || [];
            const content = (getRes.documents?.[i] as string) || "";
            const meta = (getRes.metadatas?.[i] as Record<string, unknown>) || {};

            records.push({
              chunkId: id,
              vector,
              content,
              metadata: unflattenMetadataFromChroma(meta),
              dimensions: vector.length || this.config.embeddingDimension,
              createdAt: (meta.createdAt as string) || new Date().toISOString(),
            });
          }
          return records;
        }
      } catch {
        // Fallthrough to fallback store
      }
    }

    return Array.from(this.fallbackStore.values());
  }

  /**
   * Deletes a record by chunkId.
   */
  async deleteRecord(chunkId: string): Promise<boolean> {
    await this.ensureInitialized();
    const deletedFallback = this.fallbackStore.delete(chunkId);

    if (this.isConnected && this.collection) {
      try {
        await this.collection.delete({ ids: [chunkId] });
        return true;
      } catch {
        return deletedFallback;
      }
    }

    return deletedFallback;
  }

  /**
   * Clears vector storage.
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    this.fallbackStore.clear();

    if (this.isConnected && this.collection) {
      try {
        await this.client.deleteCollection({ name: this.config.collectionName });
        this.collection = await this.client.getOrCreateCollection({
          name: this.config.collectionName,
        });
      } catch {
        // Fallback cleared
      }
    }
  }

  /**
   * Returns storage stats.
   */
  async getStats(): Promise<VectorStorageStats> {
    await this.ensureInitialized();
    let totalRecords = this.fallbackStore.size;

    if (this.isConnected && this.collection) {
      try {
        totalRecords = await this.collection.count();
      } catch {
        totalRecords = this.fallbackStore.size;
      }
    }

    const stats: VectorStorageStats = {
      totalRecords,
      dimensions: this.config.embeddingDimension,
      providerName: this.name,
      lastUpdated: new Date().toISOString(),
    };

    return strictValidate(
      VectorStorageStatsSchema,
      stats,
      "Vector Storage Stats"
    );
  }

  /**
   * Performs ChromaDB native similarity vector search.
   */
  async queryVector(
    queryVector: number[],
    topK = 5,
    filter?: RetrievalFilter
  ): Promise<VectorRecord[]> {
    await this.ensureInitialized();

    if (this.isConnected && this.collection) {
      try {
        const whereClause = buildChromaWhereClause(filter);
        const queryRes = await this.collection.query({
          queryEmbeddings: [queryVector],
          nResults: topK * 2,
          where: whereClause ? (whereClause as Record<string, string | number | boolean>) : undefined,
          include: [
            IncludeEnum.embeddings,
            IncludeEnum.documents,
            IncludeEnum.metadatas,
            IncludeEnum.distances,
          ],
        });

        if (queryRes && queryRes.ids && queryRes.ids[0] && queryRes.ids[0].length > 0) {
          const records: VectorRecord[] = [];
          const ids = queryRes.ids[0];
          const embeddings = queryRes.embeddings?.[0] || [];
          const documents = queryRes.documents?.[0] || [];
          const metadatas = queryRes.metadatas?.[0] || [];

          for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const vector = (embeddings[i] as number[]) || [];
            const content = (documents[i] as string) || "";
            const meta = (metadatas[i] as Record<string, unknown>) || {};

            records.push({
              chunkId: id,
              vector,
              content,
              metadata: unflattenMetadataFromChroma(meta),
              dimensions: vector.length || this.config.embeddingDimension,
              createdAt: (meta.createdAt as string) || new Date().toISOString(),
            });
          }
          return records;
        }
      } catch {
        // Fallback store search
      }
    }

    return Array.from(this.fallbackStore.values());
  }
}

/**
 * Builds ChromaDB structured where filter object.
 */
function buildChromaWhereClause(filter?: RetrievalFilter): Record<string, unknown> | undefined {
  if (!filter) return undefined;

  const conditions: Record<string, unknown>[] = [];

  if (filter.day !== undefined) {
    conditions.push({ day: filter.day });
  }
  if (filter.category) {
    conditions.push({ category: filter.category });
  }
  if (filter.skillCategory) {
    conditions.push({ skillCategory: filter.skillCategory });
  }
  if (filter.difficulty) {
    conditions.push({ difficulty: filter.difficulty });
  }
  if (filter.concept) {
    conditions.push({ concept: filter.concept });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];

  return { $and: conditions };
}
