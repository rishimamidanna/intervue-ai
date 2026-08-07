"use client";

/**
 * components/knowledge/KnowledgeNode.tsx
 *
 * Individual knowledge topic node — used in both KnowledgeGraph
 * and as list items in the report's Knowledge Twin section.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Create the 3D mesh version of this node for use in KnowledgeCore.
 */

import type { TopicKnowledge } from "@/types/interview";
import { cn } from "@/lib/utils";

interface KnowledgeNodeProps {
  node: TopicKnowledge;
  className?: string;
}

const confidenceColor = {
  low: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export function KnowledgeNode({ node, className }: KnowledgeNodeProps) {
  const scorePercent = Math.round(node.estimatedScore * 10);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/5 p-4 flex flex-col gap-2",
        confidenceColor[node.confidence],
        className
      )}
      aria-label={`${node.topic}: score ${scorePercent}%, confidence ${node.confidence}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white truncate">{node.topic}</span>
        <span className="text-xs font-mono ml-2 shrink-0">{scorePercent}%</span>
      </div>
      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-current transition-all duration-500"
          style={{ width: `${scorePercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs opacity-60">
        <span className="capitalize">{node.confidence} confidence</span>
        <span>{node.evidenceCount} evidence pts</span>
      </div>
    </div>
  );
}
