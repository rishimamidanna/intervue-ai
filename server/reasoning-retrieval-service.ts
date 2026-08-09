/**
 * server/reasoning-retrieval-service.ts
 *
 * Reasoning-Based Retrieval Service
 *
 * Adds an opt-in reasoning layer around the existing hybrid retrieval engine:
 * Question -> Knowledge Requirement Analysis -> Required Concepts
 * -> Direct / Prerequisite / Related Retrieval.
 *
 * The service is intentionally isolated from the existing retrieval singleton.
 * It preserves the current retrieval interfaces and returns retrieved chunks
 * unchanged so existing explainability and context-building utilities remain
 * compatible.
 */

import type {
  ConceptGraphData,
  GraphRelationship,
  ReasoningRetrievalResponse,
  RetrievalOptions,
  RetrievedChunk,
  StructuredQueryIntent,
} from "@/types/rag";
import { ReasoningRetrievalResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { QueryAnalyzer } from "./query-analyzer";
import { ConceptGraph } from "./concept-graph";
import { RetrievalService } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Contracts and configuration
// ---------------------------------------------------------------------------

export type QueryKnowledgeComplexity = "simple" | "complex";

export interface KnowledgeRequirementAnalysis {
  query: string;
  intent: StructuredQueryIntent;
  requiredConcepts: string[];
  complexity: QueryKnowledgeComplexity;
  reasoning: string[];
}

export interface IKnowledgeRequirementAnalyzer {
  name: string;
  analyze(query: string): Promise<KnowledgeRequirementAnalysis>;
}

export interface IReasoningRetriever {
  name: string;
  retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]>;
}

export interface IConceptRelationshipSource {
  exportGraph(): ConceptGraphData;
}

export interface ReasoningRetrievalConfig {
  directTopK: number;
  prerequisiteTopK: number;
  relatedTopK: number;
  maxPrerequisiteConcepts: number;
  maxRelatedConcepts: number;
}

export interface ReasoningRetrievalLatencyMetrics {
  analysisMs: number;
  directRetrievalMs: number;
  relationshipResolutionMs: number;
  prerequisiteRetrievalMs: number;
  relatedRetrievalMs: number;
  expansionRetrievalWallMs: number;
  totalMs: number;
  retrievalCalls: number;
  uniqueChunks: number;
}

export interface ReasoningRetrievalExecution {
  response: ReasoningRetrievalResponse;
  metrics: ReasoningRetrievalLatencyMetrics;
}

export interface ReasoningRetrievalServiceDependencies {
  analyzer?: IKnowledgeRequirementAnalyzer;
  retriever?: IReasoningRetriever;
  relationshipSource?: IConceptRelationshipSource;
  now?: () => number;
  config?: Partial<ReasoningRetrievalConfig>;
}

export const DEFAULT_REASONING_RETRIEVAL_CONFIG: ReasoningRetrievalConfig = {
  directTopK: 5,
  prerequisiteTopK: 3,
  relatedTopK: 3,
  maxPrerequisiteConcepts: 4,
  maxRelatedConcepts: 4,
};

// ---------------------------------------------------------------------------
// Knowledge requirement analysis
// ---------------------------------------------------------------------------

interface KnowledgeRequirementRule {
  id: string;
  patterns: RegExp[];
  concepts: string[];
  terminal?: boolean;
}

const KNOWLEDGE_REQUIREMENT_RULES: KnowledgeRequirementRule[] = [
  {
    id: "rag-hallucination",
    patterns: [
      /\b(?:rag|retrieval[-\s]+augmented generation)\b/i,
      /\bhallucin(?:ation|ations|ate|ates|ated|ating)?\b/i,
    ],
    concepts: [
      "LLM limitations",
      "embeddings",
      "vector retrieval",
      "context grounding",
    ],
    terminal: true,
  },
  {
    id: "hybrid-search",
    patterns: [/\bhybrid (?:search|retrieval)\b/i],
    concepts: [
      "hybrid search",
      "embeddings",
      "vector retrieval",
      "BM25",
      "score fusion",
    ],
  },
  {
    id: "rag",
    patterns: [/\b(?:rag|retrieval[-\s]+augmented generation)\b/i],
    concepts: ["embeddings", "vector retrieval", "context grounding"],
  },
  {
    id: "hallucination",
    patterns: [/\b(?:hallucin\w*|grounding|groundedness|faithfulness)\b/i],
    concepts: ["LLM limitations", "context grounding", "source attribution"],
  },
  {
    id: "bm25",
    patterns: [/\b(?:bm25|sparse search|lexical retrieval)\b/i],
    concepts: ["BM25"],
  },
  {
    id: "embeddings",
    patterns: [/\b(?:embedding|embeddings|dense vector|vector representation)\b/i],
    concepts: ["embeddings", "vector similarity"],
  },
  {
    id: "reranking",
    patterns: [/\b(?:rerank\w*|cross[-\s]?encoder)\b/i],
    concepts: ["hybrid search", "cross-encoder reranking"],
  },
  {
    id: "chunking",
    patterns: [/\b(?:chunking|document parsing|context retention)\b/i],
    concepts: ["document parsing", "semantic chunking", "context retention"],
  },
  {
    id: "rag-evaluation",
    patterns: [/\b(?:ragas|context relevance|answer relevance|rag evaluation)\b/i],
    concepts: ["context relevance", "groundedness", "answer relevance"],
  },
];

interface IQueryIntentAnalyzer {
  analyze(query: string): Promise<StructuredQueryIntent>;
}

function normalizeConceptName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function appendUniqueConcept(
  concepts: string[],
  seen: Set<string>,
  concept: string
): void {
  const trimmed = concept.trim();
  const normalized = normalizeConceptName(trimmed);
  if (!trimmed || !normalized || seen.has(normalized)) return;
  seen.add(normalized);
  concepts.push(trimmed);
}

function keywordToConceptLabel(keyword: string): string {
  const trimmed = keyword.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Deterministic, provider-compatible knowledge requirement analyzer.
 * A future LLM-backed analyzer can replace it without changing the service.
 */
export class DeterministicKnowledgeRequirementAnalyzer
  implements IKnowledgeRequirementAnalyzer
{
  name = "deterministic-knowledge-requirement-analyzer-v1";

  private queryAnalyzer: IQueryIntentAnalyzer;
  private maxRequiredConcepts: number;

  constructor(
    queryAnalyzer: IQueryIntentAnalyzer = new QueryAnalyzer(),
    maxRequiredConcepts = 6
  ) {
    this.queryAnalyzer = queryAnalyzer;
    this.maxRequiredConcepts = Math.max(1, Math.floor(maxRequiredConcepts));
  }

  async analyze(query: string): Promise<KnowledgeRequirementAnalysis> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      throw new Error("Reasoning retrieval query must not be empty.");
    }

    const intent = await this.queryAnalyzer.analyze(normalizedQuery);
    const requiredConcepts: string[] = [];
    const seenConcepts = new Set<string>();
    const matchedRules: string[] = [];

    for (const rule of KNOWLEDGE_REQUIREMENT_RULES) {
      const matches = rule.patterns.every((pattern) => pattern.test(normalizedQuery));
      if (!matches) continue;

      matchedRules.push(rule.id);
      for (const concept of rule.concepts) {
        appendUniqueConcept(requiredConcepts, seenConcepts, concept);
      }

      if (rule.terminal) break;
    }

    if (requiredConcepts.length === 0) {
      if (intent.topic && intent.topic !== "General Enterprise AI") {
        appendUniqueConcept(requiredConcepts, seenConcepts, intent.topic);
      }

      for (const keyword of intent.keywords) {
        if (requiredConcepts.length >= this.maxRequiredConcepts) break;
        appendUniqueConcept(
          requiredConcepts,
          seenConcepts,
          keywordToConceptLabel(keyword)
        );
      }
    }

    if (requiredConcepts.length === 0) {
      appendUniqueConcept(
        requiredConcepts,
        seenConcepts,
        "General Enterprise AI"
      );
    }

    const boundedConcepts = requiredConcepts.slice(0, this.maxRequiredConcepts);
    const hasComplexitySignal =
      /\b(?:how|why|compare|relationship|trade[-\s]?offs?|architecture|reduce|prevent|design|interact)\b/i.test(
        normalizedQuery
      );
    const complexity: QueryKnowledgeComplexity =
      boundedConcepts.length > 1 ||
      intent.intent === "comparison" ||
      intent.requiredDepth === "deep-dive" ||
      hasComplexitySignal
        ? "complex"
        : "simple";

    const reasoning: string[] = [
      `Classified the query as ${intent.intent} with ${intent.requiredDepth} depth.`,
    ];

    if (matchedRules.length > 0) {
      reasoning.push(
        `Matched knowledge requirement rules: ${matchedRules.join(", ")}.`
      );
    } else {
      reasoning.push(
        "Derived requirements from the detected topic and query keywords."
      );
    }

    reasoning.push(
      `Identified ${boundedConcepts.length} required concept${
        boundedConcepts.length === 1 ? "" : "s"
      } and classified retrieval as ${complexity}.`
    );

    return {
      query: normalizedQuery,
      intent,
      requiredConcepts: boundedConcepts,
      complexity,
      reasoning,
    };
  }
}

// ---------------------------------------------------------------------------
// Safe graph traversal helpers
// ---------------------------------------------------------------------------

/**
 * Resolves prerequisite concepts without relying on SkillGraph.getPrerequisites.
 *
 * Relationship direction is interpreted explicitly:
 * - A requires B              => B is a prerequisite of A
 * - B prerequisite_of A       => B is a prerequisite of A
 */
export function resolvePrerequisiteConcepts(
  targetConcepts: string[],
  relationships: GraphRelationship[]
): string[] {
  const targets = new Set(targetConcepts.map(normalizeConceptName).filter(Boolean));
  const prerequisites: string[] = [];
  const seen = new Set<string>();

  for (const relationship of relationships) {
    let prerequisite: string | undefined;
    let dependent: string | undefined;

    if (
      relationship.relation === "requires" &&
      targets.has(normalizeConceptName(relationship.source))
    ) {
      prerequisite = relationship.target;
      dependent = relationship.source;
    } else if (
      relationship.relation === "prerequisite_of" &&
      targets.has(normalizeConceptName(relationship.target))
    ) {
      prerequisite = relationship.source;
      dependent = relationship.target;
    }

    if (!prerequisite) continue;
    const normalized = normalizeConceptName(prerequisite);
    // A concept can be both a required concept and a prerequisite of another
    // required concept. Keep it in the prerequisite plan; chunk-level layer
    // precedence later prevents duplicate evidence in the response.
    if (
      !normalized ||
      normalized === normalizeConceptName(dependent || "") ||
      seen.has(normalized)
    ) {
      continue;
    }
    seen.add(normalized);
    prerequisites.push(prerequisite);
  }

  return prerequisites;
}

/**
 * Resolves symmetric related_to neighbors for a set of graph concepts.
 */
export function resolveRelatedConcepts(
  targetConcepts: string[],
  relationships: GraphRelationship[]
): string[] {
  const targets = new Set(targetConcepts.map(normalizeConceptName).filter(Boolean));
  const related: string[] = [];
  const seen = new Set<string>();

  for (const relationship of relationships) {
    if (relationship.relation !== "related_to") continue;

    const sourceNormalized = normalizeConceptName(relationship.source);
    const targetNormalized = normalizeConceptName(relationship.target);
    let neighbor: string | undefined;

    if (targets.has(sourceNormalized)) {
      neighbor = relationship.target;
    } else if (targets.has(targetNormalized)) {
      neighbor = relationship.source;
    }

    if (!neighbor) continue;
    const normalized = normalizeConceptName(neighbor);
    if (!normalized || targets.has(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    related.push(neighbor);
  }

  return related;
}

const GRAPH_CONCEPT_ALIASES: Record<string, string> = {
  embedding: "Vector Embeddings",
  embeddings: "Vector Embeddings",
  "embedding models": "Vector Embeddings",
  "vector similarity": "Cosine Similarity",
  "vector retrieval": "Semantic Retrieval",
  "dense retrieval": "Semantic Retrieval",
  "lexical retrieval": "Lexical Retrieval",
  "sparse search": "Lexical Retrieval",
  "hybrid retrieval": "Hybrid Search",
  "hybrid search": "Hybrid Search",
  "score fusion": "Score Fusion",
  "cross encoder reranking": "Cross Encoder Reranking",
};

function resolveCanonicalGraphConcepts(
  query: string,
  requiredConcepts: string[],
  graph: ConceptGraphData
): string[] {
  const graphConceptNames = [
    ...graph.nodes.map((node) => node.name),
    ...graph.edges.flatMap((edge) => [edge.source, edge.target]),
  ];
  const nodesByNormalizedName = new Map(
    graphConceptNames.map((name) => [normalizeConceptName(name), name])
  );
  const canonicalConcepts: string[] = [];
  const seen = new Set<string>();

  const appendCanonical = (candidate: string): void => {
    const normalized = normalizeConceptName(candidate);
    const aliasedName = GRAPH_CONCEPT_ALIASES[normalized];
    const canonicalName =
      nodesByNormalizedName.get(normalized) ||
      (aliasedName
        ? nodesByNormalizedName.get(normalizeConceptName(aliasedName))
        : undefined);

    if (!canonicalName) return;
    const canonicalNormalized = normalizeConceptName(canonicalName);
    if (seen.has(canonicalNormalized)) return;
    seen.add(canonicalNormalized);
    canonicalConcepts.push(canonicalName);
  };

  const normalizedQuery = normalizeConceptName(query);
  for (const graphConceptName of graphConceptNames) {
    const normalizedNode = normalizeConceptName(graphConceptName);
    if (normalizedNode && normalizedQuery.includes(normalizedNode)) {
      appendCanonical(graphConceptName);
    }
  }

  for (const [alias, canonicalName] of Object.entries(GRAPH_CONCEPT_ALIASES)) {
    if (normalizedQuery.includes(alias)) {
      appendCanonical(canonicalName);
    }
  }

  for (const concept of requiredConcepts) {
    appendCanonical(concept);
  }

  return canonicalConcepts;
}

function collectMetadataRelatedConcepts(chunks: RetrievedChunk[]): string[] {
  const concepts: string[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    const relatedConcepts = chunk.metadata.relatedConcepts;
    if (!Array.isArray(relatedConcepts)) continue;

    for (const concept of relatedConcepts) {
      if (typeof concept !== "string") continue;
      appendUniqueConcept(concepts, seen, concept);
    }
  }

  return concepts;
}

function selectLayerConcepts(
  candidates: string[],
  excludedConcepts: string[],
  limit: number
): string[] {
  const excluded = new Set(excludedConcepts.map(normalizeConceptName));
  const selected: string[] = [];
  const seen = new Set<string>();

  for (const concept of candidates) {
    if (selected.length >= limit) break;
    const normalized = normalizeConceptName(concept);
    if (!normalized || excluded.has(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    selected.push(concept);
  }

  return selected;
}

// ---------------------------------------------------------------------------
// Retrieval utilities
// ---------------------------------------------------------------------------

/**
 * Uses a dedicated RetrievalService whose active provider always remains hybrid.
 * This avoids mutating defaultRetrievalService while retaining its validation and
 * response-metric behavior.
 */
export class IsolatedHybridReasoningRetriever implements IReasoningRetriever {
  name = "isolated-hybrid-reasoning-retriever";

  private retrievalService: RetrievalService;

  constructor() {
    this.retrievalService = new RetrievalService();
    this.retrievalService.setProvider("hybrid");
  }

  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const response = await this.retrievalService.retrieve(query, options);
    return response.results;
  }
}

interface TimedRetrievalResult {
  chunks: RetrievedChunk[];
  durationMs: number;
  failed?: boolean;
}

function getChunkScore(chunk: RetrievedChunk): number {
  return chunk.finalScore ?? chunk.score;
}

function deduplicateChunks(
  chunks: RetrievedChunk[],
  excludedChunkIds?: Set<string>
): RetrievedChunk[] {
  const bestById = new Map<string, RetrievedChunk>();

  for (const chunk of chunks) {
    if (excludedChunkIds?.has(chunk.chunkId)) continue;
    const existing = bestById.get(chunk.chunkId);
    if (!existing || getChunkScore(chunk) > getChunkScore(existing)) {
      bestById.set(chunk.chunkId, chunk);
    }
  }

  return Array.from(bestById.values()).sort(
    (a, b) => getChunkScore(b) - getChunkScore(a)
  );
}

function buildLayerQuery(concepts: string[]): string {
  return concepts.join("; ");
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : fallback;
}

function mergeConfig(
  override?: Partial<ReasoningRetrievalConfig>
): ReasoningRetrievalConfig {
  return {
    directTopK: positiveInteger(
      override?.directTopK,
      DEFAULT_REASONING_RETRIEVAL_CONFIG.directTopK
    ),
    prerequisiteTopK: positiveInteger(
      override?.prerequisiteTopK,
      DEFAULT_REASONING_RETRIEVAL_CONFIG.prerequisiteTopK
    ),
    relatedTopK: positiveInteger(
      override?.relatedTopK,
      DEFAULT_REASONING_RETRIEVAL_CONFIG.relatedTopK
    ),
    maxPrerequisiteConcepts: positiveInteger(
      override?.maxPrerequisiteConcepts,
      DEFAULT_REASONING_RETRIEVAL_CONFIG.maxPrerequisiteConcepts
    ),
    maxRelatedConcepts: positiveInteger(
      override?.maxRelatedConcepts,
      DEFAULT_REASONING_RETRIEVAL_CONFIG.maxRelatedConcepts
    ),
  };
}

function roundDuration(durationMs: number): number {
  return Number(Math.max(0, durationMs).toFixed(3));
}

// ---------------------------------------------------------------------------
// Reasoning retrieval service
// ---------------------------------------------------------------------------

export class ReasoningRetrievalService {
  private analyzer: IKnowledgeRequirementAnalyzer;
  private retriever: IReasoningRetriever;
  private relationshipSource: IConceptRelationshipSource;
  private now: () => number;
  private config: ReasoningRetrievalConfig;

  constructor(dependencies: ReasoningRetrievalServiceDependencies = {}) {
    this.analyzer =
      dependencies.analyzer || new DeterministicKnowledgeRequirementAnalyzer();
    this.retriever =
      dependencies.retriever || new IsolatedHybridReasoningRetriever();
    this.relationshipSource =
      dependencies.relationshipSource || new ConceptGraph();
    this.now = dependencies.now || (() => performance.now());
    this.config = mergeConfig(dependencies.config);
  }

  getInfo(): {
    analyzer: string;
    retriever: string;
    config: ReasoningRetrievalConfig;
  } {
    return {
      analyzer: this.analyzer.name,
      retriever: this.retriever.name,
      config: { ...this.config },
    };
  }

  private async retrieveOptionalLayer(
    query: string,
    options: RetrievalOptions
  ): Promise<TimedRetrievalResult> {
    const start = this.now();
    try {
      const chunks = await this.retriever.retrieve(query, options);
      return {
        chunks,
        durationMs: roundDuration(this.now() - start),
      };
    } catch {
      return {
        chunks: [],
        durationMs: roundDuration(this.now() - start),
        failed: true,
      };
    }
  }

  /**
   * Executes knowledge-requirement analysis and multi-level hybrid retrieval.
   * Existing RetrievalOptions are accepted unchanged and passed to every layer.
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<ReasoningRetrievalResponse> {
    const execution = await this.retrieveWithMetrics(query, options);
    return execution.response;
  }

  /**
   * Executes reasoning retrieval and returns request-scoped orchestration metrics.
   */
  async retrieveWithMetrics(
    query: string,
    options?: RetrievalOptions
  ): Promise<ReasoningRetrievalExecution> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      throw new Error("Reasoning retrieval query must not be empty.");
    }

    const totalStart = this.now();

    const analysisStart = this.now();
    const analysis = await this.analyzer.analyze(normalizedQuery);
    const analysisMs = roundDuration(this.now() - analysisStart);

    const directStart = this.now();
    const directRaw = await this.retriever.retrieve(normalizedQuery, {
      ...options,
      topK: options?.topK ?? this.config.directTopK,
    });
    const directRetrievalMs = roundDuration(this.now() - directStart);
    const direct = deduplicateChunks(directRaw);

    let relationshipResolutionMs = 0;
    let prerequisiteConcepts: string[] = [];
    let relatedConcepts: string[] = [];

    const relationshipStart = this.now();
    const graph = this.relationshipSource.exportGraph();
    const graphTargets = resolveCanonicalGraphConcepts(
      normalizedQuery,
      analysis.requiredConcepts,
      graph
    );

    prerequisiteConcepts = resolvePrerequisiteConcepts(
      graphTargets,
      graph.edges
    ).slice(0, this.config.maxPrerequisiteConcepts);

    if (analysis.complexity === "complex") {
      const graphRelatedConcepts = resolveRelatedConcepts(
        graphTargets,
        graph.edges
      );
      const metadataRelatedConcepts = collectMetadataRelatedConcepts(direct);

      relatedConcepts = selectLayerConcepts(
        [...graphRelatedConcepts, ...metadataRelatedConcepts],
        [
          ...analysis.requiredConcepts,
          ...graphTargets,
          ...prerequisiteConcepts,
        ],
        this.config.maxRelatedConcepts
      );
    }
    relationshipResolutionMs = roundDuration(this.now() - relationshipStart);

    const expansionStart = this.now();
    const prerequisitePromise =
      prerequisiteConcepts.length > 0
        ? this.retrieveOptionalLayer(
            buildLayerQuery(prerequisiteConcepts),
            {
              ...options,
              topK: options?.topK ?? this.config.prerequisiteTopK,
            }
          )
        : Promise.resolve<TimedRetrievalResult>({
            chunks: [],
            durationMs: 0,
          });
    const relatedPromise =
      relatedConcepts.length > 0
        ? this.retrieveOptionalLayer(buildLayerQuery(relatedConcepts), {
            ...options,
            topK: options?.topK ?? this.config.relatedTopK,
          })
        : Promise.resolve<TimedRetrievalResult>({
            chunks: [],
            durationMs: 0,
          });

    const [prerequisiteRaw, relatedRaw] = await Promise.all([
      prerequisitePromise,
      relatedPromise,
    ]);
    const expansionRetrievalWallMs = roundDuration(this.now() - expansionStart);

    const directChunkIds = new Set(direct.map((chunk) => chunk.chunkId));
    const prerequisite = deduplicateChunks(
      prerequisiteRaw.chunks,
      directChunkIds
    );
    const prerequisiteChunkIds = new Set(
      prerequisite.map((chunk) => chunk.chunkId)
    );
    const earlierLayerChunkIds = new Set([
      ...directChunkIds,
      ...prerequisiteChunkIds,
    ]);
    const related = deduplicateChunks(relatedRaw.chunks, earlierLayerChunkIds);

    const removedDuplicateCount =
      directRaw.length +
      prerequisiteRaw.chunks.length +
      relatedRaw.chunks.length -
      direct.length -
      prerequisite.length -
      related.length;

    const reasoningParts = [
      ...analysis.reasoning,
      `Required concepts: ${analysis.requiredConcepts.join(", ")}.`,
      `Direct retrieval returned ${direct.length} unique chunk${
        direct.length === 1 ? "" : "s"
      }.`,
    ];

    reasoningParts.push(
      prerequisiteConcepts.length > 0
        ? `Resolved prerequisite concepts: ${prerequisiteConcepts.join(", ")}.`
        : "No explicit prerequisite relationships were found in the concept graph."
    );

    if (analysis.complexity === "complex") {
      reasoningParts.push(
        relatedConcepts.length > 0
          ? `Resolved related concepts: ${relatedConcepts.join(", ")}.`
          : "No additional related concepts remained after relevance filtering."
      );
    } else {
      reasoningParts.push(
        "Related-concept expansion was skipped for this focused query."
      );
    }

    if (prerequisiteRaw.failed) {
      reasoningParts.push(
        "Prerequisite retrieval was unavailable, so the response contains the remaining layers."
      );
    }
    if (relatedRaw.failed) {
      reasoningParts.push(
        "Related retrieval was unavailable, so the response contains the remaining layers."
      );
    }
    if (removedDuplicateCount > 0) {
      reasoningParts.push(
        `Removed ${removedDuplicateCount} duplicate chunk${
          removedDuplicateCount === 1 ? "" : "s"
        } using direct, prerequisite, then related layer precedence.`
      );
    }

    const rawResponse: ReasoningRetrievalResponse = {
      query: normalizedQuery,
      requiredConcepts: analysis.requiredConcepts,
      retrievalLayers: {
        direct,
        prerequisite,
        related,
      },
      reasoning: reasoningParts.join(" "),
    };

    const response = strictValidate(
      ReasoningRetrievalResponseSchema,
      rawResponse,
      "Reasoning Retrieval Response"
    );

    const uniqueChunks = direct.length + prerequisite.length + related.length;
    const metrics: ReasoningRetrievalLatencyMetrics = {
      analysisMs,
      directRetrievalMs,
      relationshipResolutionMs,
      prerequisiteRetrievalMs: prerequisiteRaw.durationMs,
      relatedRetrievalMs: relatedRaw.durationMs,
      expansionRetrievalWallMs,
      totalMs: roundDuration(this.now() - totalStart),
      retrievalCalls:
        1 +
        (prerequisiteConcepts.length > 0 ? 1 : 0) +
        (relatedConcepts.length > 0 ? 1 : 0),
      uniqueChunks,
    };

    return { response, metrics };
  }
}

export const defaultReasoningRetrievalService =
  new ReasoningRetrievalService();

/**
 * Convenience entry point mirroring the existing retrieval helper style.
 */
export async function performReasoningRetrieval(
  query: string,
  options?: RetrievalOptions
): Promise<ReasoningRetrievalResponse> {
  return defaultReasoningRetrievalService.retrieve(query, options);
}
