"use client";

import React from "react";

export function PDFSection({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-3 break-inside-avoid page-break-inside-avoid ${className}`}>
      <div className="border-b border-purple-200 pb-1">
        <h2 className="text-sm font-bold font-mono text-purple-900 uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && <p className="text-[11px] font-sans text-slate-500">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
