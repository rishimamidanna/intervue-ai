import assert from "node:assert/strict";
import test from "node:test";

import type {
  ConceptGraphData,
  RetrievalOptions,
  RetrievedChunk,
} from "@/types/rag";
import {
  ReasoningRetrievalService,
  resolvePrerequisiteConcepts,
  type IReasoningRetriever,
} from "@/server/reasoning-retrieval-service";

function createChunk(
  chunkId: string,
  concept: string,
  relatedConcepts: string[] = [],
  score = 0.8
): RetrievedChunk {
  return {
    chunkId,
    content: `Knowledge about ${concept}.`,
    metadata: {
      keywords: [concept],
      category: "RAG",
      difficulty: "Intermediate",
      concept,
      relatedConcepts,
      sourceRef: {
        file: "test-curriculum.json",
        day: 1,
        uri: "test://curriculum/day-1",
      },
    },
    score,
    retrievalSource: "hybrid",
    sources: ["semantic", "bm25"],
  };
}

class FixtureRetriever implements IReasoningRetriever {
  name = "fixture-hybrid-retriever";
  readonly calls: Array<{ query: string; options?: RetrievalOptions }> = [];

  constructor(
    private readonly resolve: (query: string) => RetrievedChunk[]
  ) {}

  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    this.calls.push({ query, options });
    return this.resolve(query);
  }
}

function relationshipSource(graph: ConceptGraphData): {
  exportGraph(): ConceptGraphData;
} {
  return { exportGraph: () => graph };
}

function flattenChunkIds(
  layers: Awaited<
    ReturnType<ReasoningRetrievalService["retrieve"]>
  >["retrievalLayers"]
): string[] {
  return [
    ...layers.direct,
    ...layers.prerequisite,
    ...layers.related,
  ].map((chunk) => chunk.chunkId);
}

test("simple query performs direct hybrid retrieval", async () => {
  const question = "What is BM25?";
  const retriever = new FixtureRetriever(() => [createChunk("bm25", "BM25")]);
  const service = new ReasoningRetrievalService({ retriever });

  const execution = await service.retrieveWithMetrics(question);
  const { response, metrics } = execution;

  assert.equal(response.query, question);
  assert.deepEqual(response.requiredConcepts, ["BM25"]);
  assert.deepEqual(
    response.retrievalLayers.direct.map((chunk) => chunk.chunkId),
    ["bm25"]
  );
  assert.deepEqual(response.retrievalLayers.prerequisite, []);
  assert.deepEqual(response.retrievalLayers.related, []);
  assert.equal(retriever.calls.length, 1);
  assert.equal(retriever.calls[0].query, question);
  assert.equal(metrics.retrievalCalls, 1);
  assert.match(response.reasoning, /Required concepts: BM25/);
  assert.deepEqual(response.retrievalLayers.direct[0].sources, [
    "semantic",
    "bm25",
  ]);
});

test("complex query separates direct, prerequisite, and related evidence", async () => {
  const question = "How does RAG reduce hallucination?";
  const directShared = createChunk(
    "direct-shared",
    "RAG",
    ["Answer Relevance"],
    0.95
  );
  const prerequisiteShared = createChunk(
    "prerequisite-shared",
    "Vector Embeddings",
    [],
    0.85
  );
  const graph: ConceptGraphData = {
    nodes: [
      { id: "embeddings", name: "Vector Embeddings", type: "concept" },
      { id: "semantic", name: "Semantic Retrieval", type: "skill" },
      {
        id: "context-quality",
        name: "Context Quality Optimization",
        type: "concept",
      },
    ],
    edges: [
      {
        source: "Semantic Retrieval",
        target: "Vector Embeddings",
        relation: "requires",
      },
      {
        source: "Semantic Retrieval",
        target: "Context Quality Optimization",
        relation: "related_to",
      },
    ],
  };
  const retriever = new FixtureRetriever((query) => {
    if (query === question) {
      return [directShared, createChunk("direct-only", "Grounded RAG")];
    }
    if (query === "Vector Embeddings") {
      return [
        directShared,
        prerequisiteShared,
        createChunk("prerequisite-only", "Embedding Models"),
      ];
    }
    return [
      prerequisiteShared,
      createChunk("related-only", "Context Quality Optimization"),
    ];
  });
  const service = new ReasoningRetrievalService({
    retriever,
    relationshipSource: relationshipSource(graph),
  });

  const { response, metrics } = await service.retrieveWithMetrics(question);

  assert.deepEqual(response.requiredConcepts, [
    "LLM limitations",
    "embeddings",
    "vector retrieval",
    "context grounding",
  ]);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(response.retrievalLayers).map(([layer, chunks]) => [
        layer,
        chunks.length,
      ])
    ),
    { direct: 2, prerequisite: 2, related: 1 }
  );
  assert.equal(retriever.calls.length, 3);
  assert.equal(metrics.retrievalCalls, 3);
  assert.equal(metrics.uniqueChunks, 5);
  const chunkIds = flattenChunkIds(response.retrievalLayers);
  assert.equal(new Set(chunkIds).size, chunkIds.length);
  assert.match(response.reasoning, /Resolved prerequisite concepts/);
  assert.match(response.reasoning, /Resolved related concepts/);
  for (const chunk of [
    ...response.retrievalLayers.direct,
    ...response.retrievalLayers.prerequisite,
    ...response.retrievalLayers.related,
  ]) {
    assert.equal(chunk.retrievalSource, "hybrid");
    assert.deepEqual(chunk.sources, ["semantic", "bm25"]);
  }
});

test("prerequisite traversal follows both safe edge directions", async () => {
  const question = "How does Hybrid Search work?";
  const graph: ConceptGraphData = {
    nodes: [
      { id: "hybrid", name: "Hybrid Search", type: "concept" },
      { id: "embeddings", name: "Vector Embeddings", type: "concept" },
      { id: "bm25", name: "BM25", type: "concept" },
      { id: "semantic", name: "Semantic Retrieval", type: "skill" },
      { id: "fusion", name: "Score Fusion", type: "skill" },
      { id: "multi-query", name: "Multi Query Retrieval", type: "concept" },
    ],
    edges: [
      {
        source: "Hybrid Search",
        target: "Vector Embeddings",
        relation: "requires",
      },
      {
        source: "BM25",
        target: "Hybrid Search",
        relation: "prerequisite_of",
      },
      {
        source: "Incorrect Foundation",
        target: "Hybrid Search",
        relation: "requires",
      },
      {
        source: "Hybrid Search",
        target: "Hybrid Search",
        relation: "requires",
      },
      {
        source: "Hybrid Search",
        target: "Multi Query Retrieval",
        relation: "related_to",
      },
    ],
  };
  assert.deepEqual(resolvePrerequisiteConcepts(["Hybrid Search"], graph.edges), [
    "Vector Embeddings",
    "BM25",
  ]);

  const directShared = createChunk("direct-shared", "Hybrid Search");
  const crossLayerShared = createChunk("cross-layer-shared", "BM25");
  const retriever = new FixtureRetriever((query) => {
    if (query === question) return [directShared];
    if (query.includes("Vector Embeddings") && query.includes("BM25")) {
      return [
        directShared,
        createChunk("vector-prerequisite", "Vector Embeddings"),
        createChunk("bm25-prerequisite", "BM25"),
        crossLayerShared,
      ];
    }
    return [crossLayerShared, createChunk("related-only", "Multi Query Retrieval")];
  });
  const service = new ReasoningRetrievalService({
    retriever,
    relationshipSource: relationshipSource(graph),
  });

  const { response, metrics } = await service.retrieveWithMetrics(question);
  const prerequisiteCall = retriever.calls.find(
    (call) =>
      call.query.includes("Vector Embeddings") && call.query.includes("BM25")
  );

  assert.ok(prerequisiteCall);
  assert.deepEqual(
    response.retrievalLayers.prerequisite.map((chunk) => chunk.chunkId),
    ["vector-prerequisite", "bm25-prerequisite", "cross-layer-shared"]
  );
  assert.deepEqual(
    response.retrievalLayers.related.map((chunk) => chunk.chunkId),
    ["related-only"]
  );
  const chunkIds = flattenChunkIds(response.retrievalLayers);
  assert.equal(new Set(chunkIds).size, chunkIds.length);
  assert.equal(metrics.retrievalCalls, 3);
});
