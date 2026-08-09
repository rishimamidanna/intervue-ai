"use client";

/**
 * components/interview/InterviewChamber.tsx
 *
 * Primary interview UI chamber entry point.
 * Wraps InterviewRoom inside PageTransition with cinematic AI Chamber initialization.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { InterviewRoom } from "./InterviewRoom";
import { PageTransition } from "@/components/common/PageTransition";

export function InterviewChamber() {
  return (
    <PageTransition isChamberInit={true} initMessage="Initializing AI Interview Chamber...">
      <InterviewRoom />
    </PageTransition>
  );
}
