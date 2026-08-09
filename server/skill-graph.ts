/**
 * server/skill-graph.ts
 *
 * Skill Graph Intelligence Layer (Milestone 7.30)
 *
 * Models relationships (prerequisites, requirements, dependencies) between skills,
 * concepts, and topics. Tracks candidate mastery state and dynamically traverses
 * the graph to optimize retrieval, difficulty adjustments, and next-topic selection.
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  SkillGraphNode,
  SkillGraphEdge,
  CandidateGraphState,
  RetrievalOptions,
} from "@/types/rag";
import { defaultInterviewMemoryRAG } from "./interview-memory";
import { strictValidate } from "@/lib/validation";
import { SkillGraphNodeSchema, SkillGraphEdgeSchema, CandidateGraphStateSchema } from "@/schemas/rag.schema";

export interface SkillGraphRecommendation {
  recommendedTopic: string;
  prerequisitesNeeded: string[];
  reasoning: string[];
}

export class SkillGraph {
  private nodes: Map<string, SkillGraphNode> = new Map();
  private edges: SkillGraphEdge[] = [];

  constructor() {
    this.initializeDefaultGraph();
  }

  /**
   * Initializes standard curriculum hierarchy graph.
   */
  private initializeDefaultGraph(): void {
    const rawNodes: SkillGraphNode[] = [
      { id: "Python", type: "skill", name: "Python" },
      { id: "RAG", type: "skill", name: "RAG" },
      { id: "Embeddings", type: "prerequisite", name: "Embeddings" },
      { id: "Vector Search", type: "concept", name: "Vector Search" },
      { id: "BM25", type: "concept", name: "BM25" },
      { id: "Cosine Similarity", type: "topic", name: "Cosine Similarity" },
      { id: "Hybrid Search", type: "concept", name: "Hybrid Search" },
    ];

    const rawEdges: SkillGraphEdge[] = [
      { source: "RAG", target: "Embeddings", relation: "requires" },
      { source: "RAG", target: "Vector Search", relation: "requires" },
      { source: "Embeddings", target: "Cosine Similarity", relation: "prerequisite_of" },
      { source: "Vector Search", target: "Cosine Similarity", relation: "related_to" },
      { source: "Vector Search", target: "BM25", relation: "requires" },
      { source: "Hybrid Search", target: "Vector Search", relation: "requires" },
      { source: "Hybrid Search", target: "BM25", relation: "requires" },
    ];

    for (const n of rawNodes) {
      const validated = strictValidate(SkillGraphNodeSchema, n, "Skill Graph Node");
      this.nodes.set(validated.id, validated);
    }

    for (const e of rawEdges) {
      const validated = strictValidate(SkillGraphEdgeSchema, e, "Skill Graph Edge");
      this.edges.push(validated);
    }
  }

  /**
   * Generates active candidate-scoped skill graph mastery and gaps state.
   *
   * @param candidateId - Active candidate
   * @returns CandidateGraphState Zod-validated payload
   */
  async getCandidateGraphState(candidateId: string): Promise<CandidateGraphState> {
    const memory = await defaultInterviewMemoryRAG.getOrCreateMemory(candidateId);

    const skills: Record<string, number> = {};
    const gaps: string[] = [];

    // Initialize all graph node ids with baseline scoring
    for (const nodeKey of this.nodes.keys()) {
      skills[nodeKey] = 0.5; // baseline midpoint score
    }

    // Set strengths to high score (0.9)
    for (const s of memory.strengths) {
      if (this.nodes.has(s)) {
        skills[s] = 0.9;
      }
    }

    // Set weakAreas/gaps to low score (0.3)
    for (const w of memory.weakAreas) {
      if (this.nodes.has(w)) {
        skills[w] = 0.3;
        gaps.push(w);
      }
    }

    const state: CandidateGraphState = {
      candidate: candidateId,
      skills,
      gaps,
    };

    return strictValidate<CandidateGraphState>(CandidateGraphStateSchema, state, "Candidate Graph State");
  }

  /**
   * Identifies direct prerequisite nodes for a target topic.
   */
  getPrerequisites(topicId: string): string[] {
    return this.edges
      .filter((e) => e.target === topicId && (e.relation === "requires" || e.relation === "prerequisite_of"))
      .map((e) => e.source);
  }

  /**
   * Traverses the graph to suggest the next topic or reinforce weak areas based on prerequisites.
   *
   * @param candidateId - Active candidate
   * @returns SkillGraphRecommendation
   */
  async recommendNextTopic(candidateId: string): Promise<SkillGraphRecommendation> {
    const state = await this.getCandidateGraphState(candidateId);
    const reasoning: string[] = [];
    const prerequisitesNeeded: string[] = [];
    let recommendedTopic = "Embeddings"; // default fallback

    // Find weak areas in the graph state
    const activeGaps = state.gaps;

    if (activeGaps.length > 0) {
      // Pick the first gap topic
      const targetGap = activeGaps[0];
      reasoning.push(`Candidate has identified weakness gap in "${targetGap}".`);

      // Traverse graph to check prerequisites of this gap topic
      const prereqs = this.getPrerequisites(targetGap);
      let foundUnmetPrereq = false;

      for (const p of prereqs) {
        const score = state.skills[p] ?? 0.5;
        if (score < 0.6) {
          prerequisitesNeeded.push(p);
          foundUnmetPrereq = true;
        }
      }

      if (foundUnmetPrereq) {
        recommendedTopic = prerequisitesNeeded[0];
        reasoning.push(
          `Prerequisite "${recommendedTopic}" is weak (score: ${state.skills[recommendedTopic]}). Reinforcing prerequisite before target concept.`
        );
      } else {
        recommendedTopic = targetGap;
        reasoning.push(`All prerequisites for "${targetGap}" are met. Targeting weakness directly.`);
      }
    } else {
      // If no gaps, recommend advancing to next child concept
      reasoning.push("No active weaknesses or knowledge gaps found.");
      // Find a topic where prerequisites are satisfied but candidate score is still mid-range
      for (const [nodeId, score] of Object.entries(state.skills)) {
        if (score >= 0.5 && score < 0.8) {
          const prereqs = this.getPrerequisites(nodeId);
          const allSatisfied = prereqs.every((p) => (state.skills[p] ?? 0.5) >= 0.7);
          if (allSatisfied) {
            recommendedTopic = nodeId;
            reasoning.push(`Selecting progressive topic "${nodeId}" as all prerequisites are fully mastered.`);
            break;
          }
        }
      }
    }

    return {
      recommendedTopic,
      prerequisitesNeeded,
      reasoning,
    };
  }

  /**
   * Enhances RAG Retrieval Options before search, querying both target topic and prerequisites.
   *
   * @param candidateId - Active candidate
   * @param targetTopic - Target question focus topic
   * @param baseOptions - Base options
   * @returns Enhanced RetrievalOptions
   */
  async enhanceRetrievalOptions(
    candidateId: string,
    targetTopic: string,
    baseOptions?: RetrievalOptions
  ): Promise<RetrievalOptions> {
    const state = await this.getCandidateGraphState(candidateId);
    const prereqs = this.getPrerequisites(targetTopic);

    // If candidate has low mastery of prerequisites, boost topK to retrieve foundational context
    let boostTopK = false;
    for (const p of prereqs) {
      if ((state.skills[p] ?? 0.5) < 0.6) {
        boostTopK = true;
        break;
      }
    }

    const enhanced: RetrievalOptions = {
      ...baseOptions,
      topK: boostTopK ? (baseOptions?.topK ?? 5) + 3 : baseOptions?.topK,
    };

    return enhanced;
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultSkillGraph = new SkillGraph();
