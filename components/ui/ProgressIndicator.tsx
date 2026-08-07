/**
 * components/ui/ProgressIndicator.tsx
 *
 * Visual progress bar showing interview advancement.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Animate progress transitions with Framer Motion.
 */

import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  /** Current value (0–max) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Optional label displayed above the bar */
  label?: string;
  className?: string;
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.round((Math.min(value, max) / max) * 100);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-neutral-400">{label}</span>
          <span className="text-xs text-violet-400 font-mono">{percentage}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
