"use client";

/**
 * components/knowledge/KnowledgeGraph.tsx
 *
 * 2D/3D force-directed graph of the Knowledge Twin topics and connections.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Implement graph layout using @react-three/fiber or a 2D
 *   force-directed library (e.g. d3-force) for node positioning.
 *   - Nodes: topics from KnowledgeTwin
 *   - Edges: curriculum-defined relationships between topics
 *   - Interactive: click node to inspect topic detail
 */

import type { TopicKnowledge } from "@/types/interview";

interface KnowledgeGraphProps {
  knowledgeTwin: TopicKnowledge[];
}

export function KnowledgeGraph({ knowledgeTwin }: KnowledgeGraphProps) {
  // TODO: Implement force-directed knowledge graph
  return (
    <div
      className="w-full h-48 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"
      aria-label="Knowledge graph — coming soon"
    >
      <p className="text-xs text-neutral-600">
        Knowledge Graph — {knowledgeTwin.length} topics (scaffold)
      </p>
    </div>
  );
}
