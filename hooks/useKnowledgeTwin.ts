"use client";

/**
 * hooks/useKnowledgeTwin.ts
 *
 * Client-side hook for accessing and displaying the Candidate Knowledge Twin.
 * The twin is updated server-side after each answer; this hook fetches
 * and caches the latest snapshot for the 3D visualisation and report.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Implement twin synchronisation:
 *   1. Subscribe to Knowledge Twin updates from the interview session state
 *   2. Expose the sorted twin for KnowledgeCore rendering
 *   3. Provide topicsByDay() grouping for the report view
 */

import { useState } from "react";
import type { TopicKnowledge } from "@/types/interview";

export interface UseKnowledgeTwinReturn {
  knowledgeTwin: TopicKnowledge[];
  /** Topics sorted by estimatedScore descending */
  topicsByScore: TopicKnowledge[];
  /** Whether the twin has any data */
  hasData: boolean;
  /** TODO: Replace with real update integration */
  setKnowledgeTwin: (twin: TopicKnowledge[]) => void;
}

/**
 * Manages the client-side representation of the Candidate Knowledge Twin.
 *
 * TODO: Integrate with useInterview() hook to auto-sync after each answer.
 */
export function useKnowledgeTwin(): UseKnowledgeTwinReturn {
  const [knowledgeTwin, setKnowledgeTwin] = useState<TopicKnowledge[]>([]);

  const topicsByScore = [...knowledgeTwin].sort(
    (a, b) => b.estimatedScore - a.estimatedScore
  );

  return {
    knowledgeTwin,
    topicsByScore,
    hasData: knowledgeTwin.length > 0,
    setKnowledgeTwin,
  };
}
