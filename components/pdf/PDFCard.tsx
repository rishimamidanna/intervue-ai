"use client";

import React from "react";

export function PDFCard({
  children,
  className = "",
  borderColor = "border-slate-300",
  bgColor = "bg-slate-50",
}: {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  bgColor?: string;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${borderColor} ${bgColor} break-inside-avoid page-break-inside-avoid shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
