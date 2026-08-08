"use client";

/**
 * components/interview/AnswerCard.tsx
 *
 * Candidate Answer Display & Live Input Card for INTERVUE AI Live Interview Room.
 * Features existing candidate response, character count validator, AI tip banner, and live input field with glowing Send Answer CTA.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import { User, CheckCircle2, Lightbulb, Send, Sparkles, Loader2 } from "lucide-react";

interface AnswerCardProps {
  initialAnswer?: string;
  submittedAnswer?: string;
  timestamp?: string;
  onSendAnswer?: (answer: string) => void;
  isAnalyzing?: boolean;
}

export function AnswerCard({
  initialAnswer = "I would use Reciprocal Rank Fusion (RRF) as the default fusion strategy because it's robust and simple to tune. Each retriever produces a ranked list, and RRF combines them by summing the reciprocal ranks: score(d) = ∑ 1 / (k + rank_i(d)).\n\nTo balance semantic and lexical signals, I'd adjust weights based on query intent signals—such as query length, presence of domain-specific terms,",
  submittedAnswer,
  timestamp = "10:34 AM",
  onSendAnswer,
  isAnalyzing = false,
}: AnswerCardProps) {
  const [currentInput, setCurrentInput] = useState("");

  const displayAnswer = submittedAnswer || initialAnswer;

  const handleSend = () => {
    if (onSendAnswer && currentInput.trim() && !isAnalyzing) {
      onSendAnswer(currentInput);
      setCurrentInput("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Candidate Response Card */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-5 space-y-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">
              You
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">{timestamp}</span>
        </div>

        {/* Candidate Response Content */}
        <div className="relative bg-zinc-950/60 border border-purple-900/20 rounded-xl p-4 min-h-[120px]">
          <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-line">
            {displayAnswer}
          </p>

          {/* Validation Indicator Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <span>{displayAnswer.length} characters</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
          </div>
        </div>

        {/* AI Analyzing Banner or AI Tip Banner */}
        {isAnalyzing ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-200 text-xs font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
            <span>AI is analyzing your response...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs italic">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 not-italic" />
            <span>
              <strong className="not-italic font-semibold text-amber-300">Tip:</strong>{" "}
              Mention trade-offs, evaluation metrics, and real-world considerations.
            </span>
          </div>
        )}
      </div>

      {/* Answer Live Input Row */}
      <div className="flex items-center gap-3">
        {/* Text Input Container */}
        <div className="relative flex-1 bg-[#0d0818]/90 border border-purple-900/40 rounded-2xl p-3 backdrop-blur-xl focus-within:border-purple-500/60 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <textarea
            rows={2}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={isAnalyzing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isAnalyzing ? "AI is analyzing your response..." : "Type your answer here..."}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 resize-none focus:outline-none font-sans disabled:opacity-50"
          />
          <div className="text-right text-[10px] font-mono text-zinc-500 px-1 pt-0.5">
            {currentInput.length} characters
          </div>
        </div>

        {/* Send Answer Button */}
        <button
          onClick={handleSend}
          disabled={isAnalyzing || !currentInput.trim()}
          className="h-16 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-semibold text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isAnalyzing ? (
            <>
              <span>Analyzing...</span>
              <Loader2 className="w-4 h-4 text-purple-200 animate-spin" />
            </>
          ) : (
            <>
              <span>Send Answer</span>
              <Send className="w-4 h-4 text-purple-200 fill-purple-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
