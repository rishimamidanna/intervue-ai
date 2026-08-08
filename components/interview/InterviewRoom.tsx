"use client";

/**
 * components/interview/InterviewRoom.tsx
 *
 * Full-screen INTERVUE AI Live Interview Command Center Dashboard.
 * Integrates Sidebar, InterviewHeader, QuestionCard, AnswerCard, RobotViewer,
 * IntelligencePanel, and AnalysisBar into a desktop AI command center interface.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { Sidebar } from "./Sidebar";
import { InterviewHeader } from "./InterviewHeader";
import { QuestionCard } from "./QuestionCard";
import { AnswerCard } from "./AnswerCard";
import { RobotViewer } from "./RobotViewer";
import { IntelligencePanel } from "./IntelligencePanel";
import { AnalysisBar } from "./AnalysisBar";

export function InterviewRoom() {
  return (
    <div className="h-dvh overflow-hidden bg-[#030106] p-3 font-sans text-white selection:bg-purple-500/30">
      <div className="flex h-full min-h-0 gap-3">
        {/* Fixed glass navigation rail. */}
        <div className="hidden w-[216px] shrink-0 lg:block [&>aside]:h-full [&>aside]:min-h-0 [&>aside]:w-full [&>aside]:rounded-2xl [&>aside]:border [&>aside]:border-purple-900/30">
          <Sidebar />
        </div>

        {/* Center interview surface and independent intelligence rail. */}
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 min-[1360px]:grid-cols-[minmax(0,1fr)_minmax(340px,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,420px)]">
          <main className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden [&>header]:mb-0">
            <InterviewHeader />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.92fr)]">
              <section className="flex min-h-0 flex-col justify-start gap-3 overflow-y-auto pr-1">
                <QuestionCard />
                <AnswerCard />
              </section>

              <section className="flex min-h-[460px] min-w-0">
                <RobotViewer />
              </section>
            </div>

            <AnalysisBar />
          </main>

          <div className="hidden min-h-0 overflow-y-auto pr-1 min-[1360px]:block [&>aside]:w-full">
            <IntelligencePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
