"use client";

/**
 * components/landing/StartInterview.tsx
 *
 * CTA button that navigates the user to the interview page.
 * Client component to enable Next.js router navigation.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add Framer Motion press animation.
 * TODO: Wire to the candidateId selection flow once authentication is added.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function StartInterview() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  function handleStart() {
    setIsNavigating(true);
    router.push("/dashboard");
  }

  return (
    <Button
      id="start-interview-btn"
      size="lg"
      onClick={handleStart}
      isLoading={isNavigating}
      aria-label="Start your adaptive AI interview"
    >
      {isNavigating ? "Initializing…" : "Start Interview"}
    </Button>
  );
}
