"use client";

/**
 * components/interview/QuestionCard.tsx
 *
 * AI Interviewer Question Card component for INTERVUE AI Live Interview Room.
 * Displays AI Interviewer header, timestamp, technical question, and topic tags.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { Hexagon } from "lucide-react";

interface QuestionCardProps {
  questionText?: string;
  timestamp?: string;
  tags?: string[];
}

export function QuestionCard({
  questionText = "In a hybrid retrieval system that combines dense vector search and sparse BM25 retrieval, how would you design the fusion strategy to balance semantic relevance and exact keyword matching? What factors would you consider when adjusting the weights dynamically?",
  timestamp = "10:32 AM",
  tags = ["RAG", "Hybrid Retrieval", "BM25", "Vector Search", "Ranking"],
}: QuestionCardProps) {
  return (
    <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-purple-500/40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Hexagon className="w-3.5 h-3.5 text-purple-300 fill-purple-400/30" />
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">
            AI Interviewer
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">{timestamp}</span>
      </div>

      {/* Technical Question Text */}
      <p className="text-sm text-zinc-200 leading-relaxed font-normal">
        {questionText}
      </p>

      {/* Topic Tags */}
      <div className="flex flex-wrap gap-2 pt-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-xl text-xs font-mono bg-zinc-900/80 border border-purple-900/30 text-zinc-300 hover:border-purple-500/40 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
