"use client";

/**
 * components/interview/AnswerInput.tsx
 *
 * Textarea input for candidate answers with submit handler.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add word count display.
 * TODO: Add keyboard shortcut (Ctrl+Enter) to submit.
 * TODO: Integrate VoiceControls to auto-populate from STT.
 */

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function AnswerInput({ onSubmit, isSubmitting, disabled = false }: AnswerInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim() || isSubmitting) return;
    onSubmit(value.trim());
    setValue("");
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <label htmlFor="answer-textarea" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled || isSubmitting}
        placeholder="Type your answer here…"
        rows={6}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3
          text-white placeholder-neutral-600 resize-none
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-200"
        aria-label="Your answer"
        aria-describedby="answer-hint"
      />
      <p id="answer-hint" className="text-xs text-neutral-600">
        Be thorough — explain your reasoning. Every answer adapts the interview.
      </p>
      <div className="flex justify-end">
        <Button
          id="submit-answer-btn"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={disabled || !value.trim()}
        >
          {isSubmitting ? "Evaluating…" : "Submit Answer"}
        </Button>
      </div>
    </div>
  );
}
