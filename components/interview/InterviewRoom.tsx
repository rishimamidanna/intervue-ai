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
    <div className="min-h-screen bg-[#05020a] text-white flex overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Command Center Dashboard Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto max-h-screen space-y-4">
        {/* Top Header */}
        <InterviewHeader />

        {/* Center Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px_320px] gap-4 items-stretch">
          {/* Conversation Column (Left of Center) */}
          <div className="space-y-4 flex flex-col justify-between">
            <QuestionCard />
            <AnswerCard />
          </div>

          {/* AI Robot Viewer Column (Center) */}
          <div className="min-h-[460px] h-full flex">
            <RobotViewer />
          </div>

          {/* Right Intelligence Panel Column */}
          <div className="hidden xl:block">
            <IntelligencePanel />
          </div>
        </div>

        {/* Bottom Analysis Bar */}
        <AnalysisBar />
      </main>
    </div>
  );
}
