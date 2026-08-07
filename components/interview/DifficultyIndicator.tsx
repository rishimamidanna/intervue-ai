/**
 * components/interview/DifficultyIndicator.tsx
 *
 * Visual indicator for the current adaptive difficulty level (1–5).
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Animate transitions between difficulty levels using Framer Motion.
 */

import type { DifficultyLevel } from "@/types/interview";
import { cn } from "@/lib/utils";

interface DifficultyIndicatorProps {
  difficulty: DifficultyLevel;
  className?: string;
}

const difficultyLabel: Record<DifficultyLevel, string> = {
  1: "Foundational",
  2: "Applied",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const difficultyColor: Record<DifficultyLevel, string> = {
  1: "text-emerald-400",
  2: "text-sky-400",
  3: "text-amber-400",
  4: "text-orange-400",
  5: "text-red-400",
};

export function DifficultyIndicator({
  difficulty,
  className,
}: DifficultyIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      aria-label={`Difficulty: ${difficultyLabel[difficulty]}`}
      title={`Difficulty level ${difficulty} of 5`}
    >
      <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
        {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((level) => (
          <div
            key={level}
            className={cn(
              "w-1 rounded-sm transition-all duration-300",
              level <= difficulty
                ? difficultyColor[difficulty]
                : "bg-white/10",
              // Heights scale with level
              level === 1 && "h-1",
              level === 2 && "h-2",
              level === 3 && "h-2.5",
              level === 4 && "h-3",
              level === 5 && "h-4",
              // Active bars use bg colour instead of text colour
              level <= difficulty && "opacity-100",
              level <= difficulty &&
                level === 1 && "bg-emerald-400",
              level <= difficulty &&
                level <= 2 && difficulty === 2 && "bg-sky-400",
              level <= difficulty &&
                level <= 3 && difficulty === 3 && "bg-amber-400",
              level <= difficulty &&
                level <= 4 && difficulty === 4 && "bg-orange-400",
              level <= difficulty &&
                difficulty === 5 && "bg-red-400",
              level > difficulty && "bg-white/10"
            )}
          />
        ))}
      </div>
      <span className={cn("text-xs font-medium", difficultyColor[difficulty])}>
        {difficultyLabel[difficulty]}
      </span>
    </div>
  );
}
