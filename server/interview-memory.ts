/**
 * server/interview-memory.ts
 *
 * Interview Memory RAG (Milestone 7.15)
 *
 * Provides long-term persistent, privacy-safe candidate memory for adaptive interviews.
 * Integrates memory retrieval into current vector retrieval to generate personalized context.
 *
 * Flow:
 *   Candidate History → Memory Retrieval → Current Retrieval → Personalized Context
 *
 * Candidate Store Schema:
 * {
 *   id: string,
 *   previousQuestions: string[],
 *   weakAreas: string[],
 *   strengths: string[],
 *   performance: CandidatePerformanceRecord[]
 * }
 *
 * Output Schema:
 * {
 *   candidateContext: string,
 *   relevantHistory: MemoryHistoryItem[]
 * }
 *
 * Owner: Member 2 (Data + RAG)
 */

import fs from "fs";
import path from "path";
import type {
  CandidateMemoryStore,
  CandidatePerformanceRecord,
  MemoryHistoryItem,
  InterviewMemoryResponse,
  RetrievedChunk,
  RetrievalOptions,
} from "@/types/rag";
import {
  CandidateMemoryStoreSchema,
  InterviewMemoryResponseSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { getCandidateIntelligenceProfile } from "./candidate-service";
import { performCandidateAwareSearch } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Provider Interface & Privacy Utilities
// ---------------------------------------------------------------------------

export interface ICandidateMemoryStoreProvider {
  name: string;
  getMemory(candidateId: string): Promise<CandidateMemoryStore | null>;
  saveMemory(memory: CandidateMemoryStore): Promise<void>;
}

/**
 * Privacy-safe sanitizer: scrubs sensitive PII strings (emails, phone numbers, auth tokens).
 */
export function sanitizePrivacySensitiveText(text: string): string {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[REDACTED_PHONE]")
    .replace(/\b(bearer\s+[a-zA-Z0-9_.-]+)\b/gi, "[REDACTED_TOKEN]");
}

// ---------------------------------------------------------------------------
// File-Backed Persistent Candidate Memory Store Provider
// ---------------------------------------------------------------------------

export class FileBackedCandidateMemoryStoreProvider
  implements ICandidateMemoryStoreProvider {
  name = "file-backed-candidate-memory-provider-v1";
  private memoryMap = new Map<string, CandidateMemoryStore>();
  private storagePath: string;

  constructor(customPath?: string) {
    this.storagePath =
      customPath || path.join(process.cwd(), "data", "candidate_memory.json");
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const validated = CandidateMemoryStoreSchema.safeParse(item);
            if (validated.success) {
              this.memoryMap.set(validated.data.id, validated.data);
            }
          }
        }
      }
    } catch {
      // Fallback silently if disk storage is unreadable
    }
  }

  private persistToDisk(): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(this.memoryMap.values());
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // In-memory fallback if filesystem is read-only
    }
  }

  async getMemory(candidateId: string): Promise<CandidateMemoryStore | null> {
    this.loadFromDisk();
    return this.memoryMap.get(candidateId) || null;
  }

  async saveMemory(memory: CandidateMemoryStore): Promise<void> {
    // Apply privacy sanitation
    const sanitizedMemory: CandidateMemoryStore = {
      id: memory.id,
      previousQuestions: memory.previousQuestions.map(sanitizePrivacySensitiveText),
      weakAreas: memory.weakAreas.map(sanitizePrivacySensitiveText),
      strengths: memory.strengths.map(sanitizePrivacySensitiveText),
      weaknesses: (memory.weaknesses || []).map(sanitizePrivacySensitiveText),
      recommendedTopics: (memory.recommendedTopics || []).map(sanitizePrivacySensitiveText),
      performance: memory.performance.map((p) => ({
        ...p,
        notes: p.notes ? sanitizePrivacySensitiveText(p.notes) : undefined,
      })),
      feedback: memory.feedback?.map((f) => ({
        question: sanitizePrivacySensitiveText(f.question),
        performance: f.performance,
        difficulty: f.difficulty,
        weakness: sanitizePrivacySensitiveText(f.weakness),
      })),
    };

    const validated = strictValidate(
      CandidateMemoryStoreSchema,
      sanitizedMemory,
      "Candidate Memory Store"
    );

    this.memoryMap.set(validated.id, validated);
    this.persistToDisk();
  }
}

// ---------------------------------------------------------------------------
// Interview Memory RAG Engine
// ---------------------------------------------------------------------------

export class InterviewMemoryRAG {
  private storeProvider: ICandidateMemoryStoreProvider;

  constructor(storeProvider?: ICandidateMemoryStoreProvider) {
    this.storeProvider =
      storeProvider || new FileBackedCandidateMemoryStoreProvider();
  }

  /**
   * Sets active memory store provider.
   */
  setStoreProvider(provider: ICandidateMemoryStoreProvider): void {
    this.storeProvider = provider;
  }

  /**
   * Gets or initializes candidate memory store.
   * Auto-hydrates from candidate intelligence profile if available.
   */
  async getOrCreateMemory(candidateId: string): Promise<CandidateMemoryStore> {
    let memory = await this.storeProvider.getMemory(candidateId);
    if (memory) {
      if (!memory.weaknesses) memory.weaknesses = [];
      if (!memory.recommendedTopics) memory.recommendedTopics = [];
      return memory;
    }

    // Initialize fresh memory store
    memory = {
      id: candidateId,
      previousQuestions: [],
      weakAreas: [],
      strengths: [],
      weaknesses: [],
      recommendedTopics: [],
      performance: [],
    };

    // Auto-hydrate from existing candidate profile/intelligence if available
    try {
      const intel = await getCandidateIntelligenceProfile(candidateId);
      if (intel) {
        memory.weakAreas = intel.verificationAreas.map((va) => va.topic);
        memory.strengths = intel.strengths.map((s) => s.topic);
      }
    } catch {
      // Non-blocking fallback
    }

    await this.storeProvider.saveMemory(memory);
    return memory;
  }

  /**
   * Records a question asked to the candidate.
   */
  async recordQuestion(candidateId: string, question: string): Promise<CandidateMemoryStore> {
    const memory = await this.getOrCreateMemory(candidateId);
    const sanitized = sanitizePrivacySensitiveText(question);
    if (!memory.previousQuestions.includes(sanitized)) {
      memory.previousQuestions.push(sanitized);
    }
    await this.storeProvider.saveMemory(memory);
    return memory;
  }

  /**
   * Records a performance evaluation record.
   */
  async recordPerformance(
    candidateId: string,
    record: CandidatePerformanceRecord
  ): Promise<CandidateMemoryStore> {
    const memory = await this.getOrCreateMemory(candidateId);
    memory.performance.push({
      ...record,
      notes: record.notes ? sanitizePrivacySensitiveText(record.notes) : undefined,
    });

    // Update weak areas or strengths based on performance score
    if (record.score < 0.6 && !memory.weakAreas.includes(record.topic)) {
      memory.weakAreas.push(record.topic);
    } else if (record.score >= 0.8 && !memory.strengths.includes(record.topic)) {
      memory.strengths.push(record.topic);
    }

    await this.storeProvider.saveMemory(memory);
    return memory;
  }

  /**
   * Updates candidate learning memory after answer evaluation.
   */
  async updateCandidateLearningMemory(
    candidateId: string,
    question: { topic: string },
    evaluation: { coveredConcepts: string[]; missingConcepts: string[]; misconceptions: string[]; correctness: number }
  ): Promise<CandidateMemoryStore> {
    const memory = await this.getOrCreateMemory(candidateId);

    // Initialize arrays if they don't exist
    if (!memory.strengths) memory.strengths = [];
    if (!memory.weakAreas) memory.weakAreas = [];
    if (!memory.weaknesses) memory.weaknesses = [];
    if (!memory.recommendedTopics) memory.recommendedTopics = [];

    const strengthsToAdd = evaluation.coveredConcepts || [];
    const weaknessesToAdd = [
      ...(evaluation.missingConcepts || []),
      ...(evaluation.misconceptions || [])
    ];

    // Update strengths: add covered concepts, remove from weaknesses/weakAreas/recommendedTopics
    for (const strength of strengthsToAdd) {
      const sanitized = sanitizePrivacySensitiveText(strength);
      if (sanitized && !memory.strengths.includes(sanitized)) {
        memory.strengths.push(sanitized);
      }
      memory.weaknesses = memory.weaknesses.filter((w) => w !== sanitized);
      memory.weakAreas = memory.weakAreas.filter((w) => w !== sanitized);
      memory.recommendedTopics = memory.recommendedTopics.filter((t) => t !== sanitized);
    }

    // Update weaknesses: add missing/misconceptions, remove from strengths
    for (const weakness of weaknessesToAdd) {
      const sanitized = sanitizePrivacySensitiveText(weakness);
      if (sanitized) {
        if (!memory.weaknesses.includes(sanitized)) {
          memory.weaknesses.push(sanitized);
        }
        if (!memory.weakAreas.includes(sanitized)) {
          memory.weakAreas.push(sanitized);
        }
      }
      memory.strengths = memory.strengths.filter((s) => s !== sanitized);
    }

    // Update recommendedTopics (improvement topics)
    const isStruggling = evaluation.correctness < 6 || weaknessesToAdd.length > 0;
    if (isStruggling) {
      const topicsToAdd = [
        question.topic,
        ...(evaluation.missingConcepts || [])
      ];
      for (const topic of topicsToAdd) {
        const sanitized = sanitizePrivacySensitiveText(topic);
        if (sanitized && !memory.recommendedTopics.includes(sanitized)) {
          memory.recommendedTopics.push(sanitized);
        }
      }
    } else {
      const sanitizedTopic = sanitizePrivacySensitiveText(question.topic);
      memory.recommendedTopics = memory.recommendedTopics.filter((t) => t !== sanitizedTopic);
    }

    // Save to provider
    await this.storeProvider.saveMemory(memory);
    return memory;
  }

  /**
   * Retrieves memory items relevant to a search query.
   */
  retrieveRelevantHistory(
    query: string,
    memory: CandidateMemoryStore
  ): MemoryHistoryItem[] {
    const history: MemoryHistoryItem[] = [];
    const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    // Helper to calculate relevance float
    const calcScore = (text: string): number => {
      const lower = text.toLowerCase();
      let matchCount = 0;
      for (const token of queryTokens) {
        if (lower.includes(token)) matchCount++;
      }
      return queryTokens.length > 0 ? Number((matchCount / queryTokens.length).toFixed(2)) : 0;
    };

    // 1. Weak Areas
    for (const area of memory.weakAreas) {
      history.push({
        type: "weakness",
        content: `Candidate weak area identified in ${area}`,
        topic: area,
        relevanceScore: Math.max(0.6, calcScore(area)),
      });
    }

    // 2. Strengths
    for (const str of memory.strengths) {
      history.push({
        type: "strength",
        content: `Candidate strength verified in ${str}`,
        topic: str,
        relevanceScore: calcScore(str),
      });
    }

    // 3. Previous Questions
    for (const q of memory.previousQuestions) {
      const score = calcScore(q);
      if (score > 0 || queryTokens.length === 0) {
        history.push({
          type: "question",
          content: q,
          relevanceScore: score,
        });
      }
    }

    // 4. Performance Records
    for (const perf of memory.performance) {
      history.push({
        type: "performance",
        content: `Scored ${(perf.score * 100).toFixed(0)}% on ${perf.topic}`,
        topic: perf.topic,
        relevanceScore: calcScore(perf.topic),
        timestamp: perf.timestamp,
      });
    }

    // Sort by relevance score descending
    return history.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }

  /**
   * Generates candidate context summary string for RAG personalization.
   */
  buildCandidateContext(
    candidateId: string,
    memory: CandidateMemoryStore,
    relevantHistory: MemoryHistoryItem[]
  ): string {
    const lines: string[] = [];

    lines.push(`CANDIDATE MEMORY CONTEXT [ID: ${candidateId}]`);

    const weaknesses = memory.weaknesses || [];
    if (weaknesses.length > 0) {
      lines.push(`Target Weaknesses: ${weaknesses.join(", ")}`);
    } else if (memory.weakAreas.length > 0) {
      lines.push(`Target Weak Areas: ${memory.weakAreas.join(", ")}`);
    } else {
      lines.push(`Target Weak Areas: None identified yet`);
    }

    const strengths = memory.strengths || [];
    if (strengths.length > 0) {
      lines.push(`Demonstrated Strengths: ${strengths.join(", ")}`);
    }

    const recommended = memory.recommendedTopics || [];
    if (recommended.length > 0) {
      lines.push(`Recommended Topics to Study: ${recommended.join(", ")}`);
    }

    if (memory.previousQuestions.length > 0) {
      lines.push(
        `Previous Questions Asked (${memory.previousQuestions.length}): ${memory.previousQuestions
          .slice(-3)
          .join(" | ")}`
      );
    }

    const topHistory = relevantHistory.slice(0, 3);
    if (topHistory.length > 0) {
      lines.push(
        `Relevant Historical Signals: ${topHistory.map((h) => `[${h.type.toUpperCase()}] ${h.content}`).join("; ")}`
      );
    }

    return lines.join("\n");
  }

  /**
   * Executes Interview Memory RAG pipeline:
   * 1. Retrieve Candidate History from persistent store.
   * 2. Perform Memory Retrieval for current query.
   * 3. Execute Candidate-Aware Vector Retrieval.
   * 4. Synthesize Personalized Context.
   *
   * Output structure:
   * {
   *   candidateContext: string,
   *   relevantHistory: MemoryHistoryItem[]
   * }
   *
   * @param query - Input search query
   * @param candidateId - Target candidate identifier
   * @param options - Optional retrieval options
   * @returns InterviewMemoryResponse
   */
  async retrievePersonalizedContext(
    query: string,
    candidateId: string,
    options?: RetrievalOptions
  ): Promise<InterviewMemoryResponse> {
    const startTime = Date.now();

    // 1. Candidate Memory Retrieval
    const memory = await this.getOrCreateMemory(candidateId);
    const relevantHistory = this.retrieveRelevantHistory(query, memory);

    // 2. Candidate-Aware Vector Retrieval
    let intelProfile;
    try {
      intelProfile = await getCandidateIntelligenceProfile(candidateId);
    } catch {
      intelProfile = undefined;
    }

    const personalizedChunks: RetrievedChunk[] = await performCandidateAwareSearch(
      query,
      intelProfile || { id: candidateId },
      options
    );

    // 3. Personalized Context Synthesis
    const candidateContext = this.buildCandidateContext(
      candidateId,
      memory,
      relevantHistory
    );

    const durationMs = Date.now() - startTime;

    const response: InterviewMemoryResponse = {
      candidateId,
      candidateContext,
      relevantHistory,
      personalizedChunks,
      memory,
      durationMs,
    };

    return strictValidate(
      InterviewMemoryResponseSchema,
      response,
      "Interview Memory Response"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultInterviewMemoryRAG = new InterviewMemoryRAG();
