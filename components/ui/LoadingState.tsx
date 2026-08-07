/**
 * components/ui/LoadingState.tsx
 *
 * Full-screen and inline loading state components.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Replace with animated 3D loading core when KnowledgeCore is implemented.
 */

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  /** If true, renders as a full-screen overlay */
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Loading…",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "fixed inset-0 bg-neutral-950/90 z-50",
        !fullScreen && "py-16",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Pulse ring */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-12 w-12 rounded-full bg-violet-500/30 animate-ping" />
        <span className="relative inline-flex h-8 w-8 rounded-full bg-violet-500" />
      </div>
      <p className="text-sm text-neutral-400 tracking-wide">{message}</p>
    </div>
  );
}
