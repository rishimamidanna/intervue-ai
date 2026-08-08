/**
 * config/vector-db.config.ts
 *
 * Vector Database Configuration (Milestone 5.4)
 * Stores configuration separately for persistent ChromaDB vector storage.
 *
 * Owner: Member 2 (Data + RAG)
 */

export interface VectorDBConfig {
  provider: "chromadb" | "in-memory";
  chromaUrl: string;
  collectionName: string;
  persistentDirectory: string;
  embeddingDimension: number;
}

export const defaultVectorDBConfig: VectorDBConfig = {
  provider: (process.env.VECTOR_DB_PROVIDER as "chromadb" | "in-memory") || "chromadb",
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
  collectionName: process.env.CHROMA_COLLECTION || "intervue_curriculum_embeddings",
  persistentDirectory: process.env.CHROMA_PERSIST_DIR || "./data/chroma_db",
  embeddingDimension: 384,
};
