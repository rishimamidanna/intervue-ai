/**
 * server/concept-graph.ts
 *
 * Knowledge Graph Enhanced RAG (Milestone 7.13)
 *
 * Adds concept relationship awareness by maintaining a Concept Graph containing:
 * - Nodes: concepts, topics, skills
 * - Edges: requires, related_to, prerequisite_of
 *
 * Integrates Knowledge Graph traversal with Vector Retrieval (Hybrid Search) to return:
 * {
 *   concepts: [],
 *   relationships: [],
 *   supportingChunks: []
 * }
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  GraphNode,
  GraphRelationship,
  ConceptGraphData,
  KnowledgeGraphRAGResponse,
  RetrievedChunk,
  RetrievalOptions,
} from "@/types/rag";
import {
  KnowledgeGraphRAGResponseSchema,
  ConceptGraphDataSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Concept Graph Data Structure & Storage
// ---------------------------------------------------------------------------

export class ConceptGraph {
  private nodesMap = new Map<string, GraphNode>();
  private edgesList: GraphRelationship[] = [];

  constructor() {
    this.seedDefaultKnowledgeGraph();
  }

  /**
   * Adds or updates a node in the concept graph.
   */
  addNode(node: GraphNode): void {
    const key = node.name.toLowerCase();
    this.nodesMap.set(key, node);
  }

  /**
   * Adds a relationship edge to the concept graph.
   */
  addEdge(relationship: GraphRelationship): void {
    // Prevent duplicate edges
    const exists = this.edgesList.some(
      (e) =>
        e.source.toLowerCase() === relationship.source.toLowerCase() &&
        e.target.toLowerCase() === relationship.target.toLowerCase() &&
        e.relation === relationship.relation
    );
    if (!exists) {
      this.edgesList.push(relationship);
    }
  }

  /**
   * Retrieves a node by name (case-insensitive).
   */
  getNode(name: string): GraphNode | undefined {
    return this.nodesMap.get(name.toLowerCase());
  }

  /**
   * Returns all graph data (nodes and edges).
   */
  exportGraph(): ConceptGraphData {
    const data: ConceptGraphData = {
      nodes: Array.from(this.nodesMap.values()),
      edges: [...this.edgesList],
    };
    return strictValidate(ConceptGraphDataSchema, data, "Concept Graph Data");
  }

  /**
   * Traverses graph to find connected relationships for a given list of active concepts.
   *
   * @param activeConcepts - Array of concept names
   * @returns Filtered array of GraphRelationship objects
   */
  findRelationships(activeConcepts: string[]): GraphRelationship[] {
    const conceptSet = new Set(activeConcepts.map((c) => c.toLowerCase()));
    const matchedRelationships: GraphRelationship[] = [];

    for (const edge of this.edgesList) {
      const sourceMatch = conceptSet.has(edge.source.toLowerCase());
      const targetMatch = conceptSet.has(edge.target.toLowerCase());

      // Include edge if source or target is in active concepts
      if (sourceMatch || targetMatch) {
        matchedRelationships.push(edge);
      }
    }

    return matchedRelationships;
  }

  /**
   * Seeds the graph with enterprise AI curriculum concepts, topics, skills, and relationships.
   */
  private seedDefaultKnowledgeGraph(): void {
    // 1. Concept Nodes
    const conceptNodes: GraphNode[] = [
      { id: "node-concept-embeddings", name: "Vector Embeddings", type: "concept" },
      { id: "node-concept-cosine", name: "Cosine Similarity", type: "concept" },
      { id: "node-concept-bm25", name: "BM25", type: "concept" },
      { id: "node-concept-hybrid", name: "Hybrid Search", type: "concept" },
      { id: "node-concept-reranker", name: "Cross Encoder Reranking", type: "concept" },
      { id: "node-concept-multiquery", name: "Multi Query Retrieval", type: "concept" },
      { id: "node-concept-contextopt", name: "Context Quality Optimization", type: "concept" },
      { id: "node-concept-ragas", name: "RAGAS Framework", type: "concept" },
      { id: "node-concept-candintel", name: "Candidate Intelligence", type: "concept" },
      { id: "node-concept-vectordb", name: "Vector Database", type: "concept" },
    ];

    // 2. Topic Nodes
    const topicNodes: GraphNode[] = [
      { id: "node-topic-day1", name: "Vector Embeddings & Semantic Search", type: "topic" },
      { id: "node-topic-day3", name: "Lexical Search & BM25", type: "topic" },
      { id: "node-topic-day4", name: "Hybrid Fusion & Score Normalization", type: "topic" },
      { id: "node-topic-day5", name: "Evaluation & Testing", type: "topic" },
    ];

    // 3. Skill Nodes
    const skillNodes: GraphNode[] = [
      { id: "node-skill-semantic", name: "Semantic Retrieval", type: "skill" },
      { id: "node-skill-lexical", name: "Lexical Retrieval", type: "skill" },
      { id: "node-skill-fusion", name: "Score Fusion", type: "skill" },
      { id: "node-skill-rerank", name: "Two-Stage Reranking", type: "skill" },
      { id: "node-skill-eval", name: "RAG Evaluation", type: "skill" },
    ];

    for (const node of [...conceptNodes, ...topicNodes, ...skillNodes]) {
      this.addNode(node);
    }

    // 4. Graph Edges / Relationships
    const relationships: GraphRelationship[] = [
      // Concept -> Concept dependencies
      { source: "Cosine Similarity", target: "Vector Embeddings", relation: "requires", weight: 0.9 },
      { source: "Vector Embeddings", target: "Cosine Similarity", relation: "prerequisite_of", weight: 0.9 },
      { source: "Vector Database", target: "Vector Embeddings", relation: "requires", weight: 0.95 },
      { source: "Hybrid Search", target: "Vector Embeddings", relation: "requires", weight: 0.9 },
      { source: "Hybrid Search", target: "BM25", relation: "requires", weight: 0.9 },
      { source: "Hybrid Search", target: "Cross Encoder Reranking", relation: "prerequisite_of", weight: 0.85 },
      { source: "Cross Encoder Reranking", target: "Hybrid Search", relation: "requires", weight: 0.9 },
      { source: "Multi Query Retrieval", target: "Hybrid Search", relation: "related_to", weight: 0.8 },
      { source: "RAGAS Framework", target: "Context Quality Optimization", relation: "requires", weight: 0.75 },

      // Skill -> Concept relationships
      { source: "Semantic Retrieval", target: "Vector Embeddings", relation: "requires", weight: 1.0 },
      { source: "Lexical Retrieval", target: "BM25", relation: "requires", weight: 1.0 },
      { source: "Score Fusion", target: "Hybrid Search", relation: "related_to", weight: 0.95 },
      { source: "Two-Stage Reranking", target: "Cross Encoder Reranking", relation: "requires", weight: 1.0 },
      { source: "RAG Evaluation", target: "RAGAS Framework", relation: "requires", weight: 1.0 },

      // Topic -> Concept relationships
      { source: "Vector Embeddings & Semantic Search", target: "Vector Embeddings", relation: "related_to", weight: 0.9 },
      { source: "Lexical Search & BM25", target: "BM25", relation: "related_to", weight: 0.9 },
      { source: "Hybrid Fusion & Score Normalization", target: "Hybrid Search", relation: "related_to", weight: 0.9 },
      { source: "Evaluation & Testing", target: "RAGAS Framework", relation: "related_to", weight: 0.9 },
    ];

    for (const rel of relationships) {
      this.addEdge(rel);
    }
  }
}

// ---------------------------------------------------------------------------
// Knowledge Graph Enhanced RAG Service
// ---------------------------------------------------------------------------

export class KnowledgeGraphRAG {
  private conceptGraph: ConceptGraph;

  constructor(conceptGraph?: ConceptGraph) {
    this.conceptGraph = conceptGraph || new ConceptGraph();
  }

  /**
   * Returns internal ConceptGraph instance.
   */
  getGraph(): ConceptGraph {
    return this.conceptGraph;
  }

  /**
   * Executes Knowledge Graph Enhanced RAG:
   * 1. Performs vector hybrid retrieval to get supporting context chunks.
   * 2. Extracts concepts from retrieved chunk metadata and query text.
   * 3. Traverses Concept Graph to discover relevant node relationships.
   * 4. Returns structured payload containing concepts, relationships, and supporting chunks.
   *
   * Output structure:
   * {
   *   query: "...",
   *   concepts: [...],
   *   relationships: [...],
   *   supportingChunks: [...]
   * }
   *
   * @param query - Input search query
   * @param options - Base retrieval options
   * @returns KnowledgeGraphRAGResponse
   */
  async executeGraphEnhancedRAG(
    query: string,
    options?: RetrievalOptions
  ): Promise<KnowledgeGraphRAGResponse> {
    const startTime = Date.now();

    // 1. Vector Retrieval Pass (Hybrid Search)
    const supportingChunks: RetrievedChunk[] = await performHybridSearch(query, options);

    // 2. Concept Extraction (from query + retrieved chunk metadata)
    const conceptSet = new Set<string>();

    // Extract concepts from retrieved chunk metadata
    for (const chunk of supportingChunks) {
      if (chunk.metadata.concept) {
        conceptSet.add(chunk.metadata.concept);
      }
      if (chunk.metadata.category) {
        conceptSet.add(chunk.metadata.category);
      }
    }

    // Extract query-mentioned known concepts from graph
    const allGraphNodes = this.conceptGraph.exportGraph().nodes;
    const lowerQuery = query.toLowerCase();
    for (const node of allGraphNodes) {
      if (lowerQuery.includes(node.name.toLowerCase())) {
        conceptSet.add(node.name);
      }
    }

    const concepts = Array.from(conceptSet);

    // 3. Graph Traversal for Edge Relationships
    const relationships = this.conceptGraph.findRelationships(concepts);

    const durationMs = Date.now() - startTime;

    const rawResponse: KnowledgeGraphRAGResponse = {
      query,
      concepts,
      relationships,
      supportingChunks,
      durationMs,
    };

    return strictValidate(
      KnowledgeGraphRAGResponseSchema,
      rawResponse,
      "Knowledge Graph RAG Response"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultKnowledgeGraphRAG = new KnowledgeGraphRAG();
