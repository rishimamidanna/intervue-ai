/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * server/feedback-learning-loop.ts
 *
 * Feedback Learning Loop Layer (Milestone 7.23)
 *
 * Persists post-question candidate feedback (question, performance, difficulty, weakness),
 * updates long-term candidate memory, and uses this historical feedback to dynamically
 * tune future RAG retrieval parameters, difficulty thresholds, and topic recommendations.
 *
 * Flow:
 *   Interview Result → Memory Update → Future Personalization (Retrieval + Difficulty + Selection)
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  CandidateFeedback,
  CandidateMemoryStore,
  RetrievalOptions,
} from "@/types/rag";
import { defaultInterviewMemoryRAG } from "./interview-memory";
import { defaultDifficultyEngine } from "./difficulty-engine";

export interface FeedbackUpdateResult {
  candidateId: string;
  feedbackRecorded: CandidateFeedback;
  updatedMemory: CandidateMemoryStore;
  explanation: string;
}

export interface PersonalizedRecommendations {
  recommendedNextDifficulty: string;
  topicsToReinforce: string[];
  suggestedTopK: number;
}

export class FeedbackLearningLoop {
  /**
   * Records candidate feedback, updates persistent memory, and adjusts weak areas/strengths.
   *
   * @param candidateId - Candidate identifier
   * @param feedback - Post-question candidate feedback record
   * @returns FeedbackUpdateResult
   */
  async processInterviewResult(
    candidateId: string,
    feedback: CandidateFeedback
  ): Promise<FeedbackUpdateResult> {
    const memory = await defaultInterviewMemoryRAG.getOrCreateMemory(candidateId);

    // Initialize feedback array if undefined
    if (!memory.feedback) {
      memory.feedback = [];
    }

    // 1. Save feedback record to history
    memory.feedback.push(feedback);

    let explanation = `Successfully logged feedback for question regarding "${feedback.weakness}". `;

    // 2. Memory Updates: Adjust weakAreas and strengths based on performance
    const normalizedPerf = feedback.performance.toLowerCase().trim();

    if (normalizedPerf === "incorrect") {
      if (!memory.weakAreas.includes(feedback.weakness)) {
        memory.weakAreas.push(feedback.weakness);
        explanation += `Added new weak area: "${feedback.weakness}".`;
      } else {
        explanation += `Confirmed recurring weak area: "${feedback.weakness}".`;
      }
      // Remove from strengths if present
      memory.strengths = memory.strengths.filter((s) => s !== feedback.weakness);
    } else if (normalizedPerf === "correct") {
      // If candidate answers correctly, remove from weakAreas and add to strengths
      const wasWeakness = memory.weakAreas.includes(feedback.weakness);
      if (wasWeakness) {
        memory.weakAreas = memory.weakAreas.filter((w) => w !== feedback.weakness);
        explanation += `Resolved previous weak area: "${feedback.weakness}". `;
      }
      if (!memory.strengths.includes(feedback.weakness)) {
        memory.strengths.push(feedback.weakness);
        explanation += `Added new strength: "${feedback.weakness}".`;
      }
    }

    // Record question to previous questions history
    if (!memory.previousQuestions.includes(feedback.question)) {
      memory.previousQuestions.push(feedback.question);
    }

    // 3. Persist memory update to storage
    await (defaultInterviewMemoryRAG as any).storeProvider.saveMemory(memory);

    return {
      candidateId,
      feedbackRecorded: feedback,
      updatedMemory: memory,
      explanation,
    };
  }

  /**
   * Analyzes feedback history to personalize next question difficulty, retrieval options,
   * and target reinforcement topics.
   *
   * @param candidateId - Target candidate identifier
   * @returns PersonalizedRecommendations
   */
  async getPersonalizedRecommendations(
    candidateId: string
  ): Promise<PersonalizedRecommendations> {
    const memory = await defaultInterviewMemoryRAG.getOrCreateMemory(candidateId);
    const feedbackList = memory.feedback || [];

    // 1. Difficulty selection guided by past feedback performance
    let recommendedNextDifficulty = "Intermediate";
    if (feedbackList.length > 0) {
      const lastFeedback = feedbackList[feedbackList.length - 1];
      const assessment = {
        score: lastFeedback.performance.toLowerCase() === "correct" ? 1.0 : 0.0,
        confidence: lastFeedback.performance.toLowerCase() === "correct" ? 0.9 : 0.3,
        weaknessesTracked: memory.weakAreas,
      };

      const decision = defaultDifficultyEngine.analyzeDifficulty(
        lastFeedback.difficulty,
        assessment
      );
      recommendedNextDifficulty = decision.nextLevel;
    }

    // 2. Topics to reinforce (order by recurring incorrects)
    const reinforcementMap = new Map<string, number>();
    for (const f of feedbackList) {
      if (f.performance.toLowerCase() === "incorrect") {
        const count = reinforcementMap.get(f.weakness) || 0;
        reinforcementMap.set(f.weakness, count + 1);
      }
    }

    const topicsToReinforce = Array.from(reinforcementMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);

    // 3. Suggested retrieval topK based on complexity of weaknesses
    let suggestedTopK = 5;
    if (memory.weakAreas.length > 0) {
      suggestedTopK = memory.weakAreas.length >= 2 ? 8 : 6;
    }

    return {
      recommendedNextDifficulty,
      topicsToReinforce,
      suggestedTopK,
    };
  }

  /**
   * Dynamically tunes RAG Retrieval Options before a search is performed,
   * taking candidate feedback history into account.
   *
   * @param candidateId - Active candidate
   * @param baseOptions - Custom retrieval options
   * @returns Enhanced RetrievalOptions
   */
  async enhanceRetrievalOptions(
    candidateId: string,
    baseOptions?: RetrievalOptions
  ): Promise<RetrievalOptions> {
    const recommendations = await this.getPersonalizedRecommendations(candidateId);
    const memory = await defaultInterviewMemoryRAG.getOrCreateMemory(candidateId);

    const enhanced: RetrievalOptions = {
      topK: baseOptions?.topK ?? recommendations.suggestedTopK,
      ...baseOptions,
    };

    // If candidate has persistent weaknesses, set filter or custom weights
    if (memory.weakAreas.length > 0) {
      enhanced.filter = {
        ...enhanced.filter,
        difficulty: recommendations.recommendedNextDifficulty as any,
      };
    }

    return enhanced;
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultFeedbackLearningLoop = new FeedbackLearningLoop();
