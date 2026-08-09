"use client";

import React from "react";

export function PDFHeader({ pageTitle }: { pageTitle?: string }) {
  return (
    <div className="flex items-center justify-between border-b-2 border-purple-700 pb-3 mb-4 font-sans">
      <div className="flex items-center space-x-3">
        <span className="px-2.5 py-1 rounded bg-purple-700 text-white font-mono text-[10px] font-bold tracking-widest uppercase">
          INTERVUE AI
        </span>
        <span className="text-xs font-mono font-semibold text-slate-700">
          Adaptive Intelligence Platform
        </span>
      </div>

      {pageTitle && (
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-purple-900 uppercase">
            {pageTitle}
          </span>
        </div>
      )}
    </div>
  );
}
