"use client";

import React from "react";

export function PDFFooter({ pageNum, totalPages = 7 }: { pageNum: number; totalPages?: number }) {
  return (
    <div className="pt-3 mt-auto border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-500">
      <span>AI Generated Assessment Report &bull; Grounded Evaluation DNA</span>
      <span>Page {pageNum} / {totalPages}</span>
    </div>
  );
}
