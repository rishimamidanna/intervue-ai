"use client";

/**
 * components/pdf/PDFChart.tsx
 *
 * Vector SVG Charts specifically designed for PDF printing & page rendering.
 * Pure SVG vectors ensure 100% reliability, minimum width 400px, high-contrast dark ink,
 * readable labels, and zero canvas rendering issues.
 *
 * Exports:
 * - PDFLineChart (Score Evolution Q1-Q5)
 * - PDFBarChart (Skill Dimension Bar Chart)
 * - PDFPieChart (Knowledge Distribution Pie Chart)
 * - PDFRadarChart (5-Axis Rubric Polygon Radar Chart)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";

export interface ScorePoint {
  turn: string;
  score: number;
  difficulty?: number;
}

export function PDFLineChart({
  data = [
    { turn: "Q1", score: 65 },
    { turn: "Q2", score: 72 },
    { turn: "Q3", score: 78 },
    { turn: "Q4", score: 85 },
    { turn: "Q5", score: 91 },
  ],
  width = 450,
  height = 160,
}: {
  data?: ScorePoint[];
  width?: number;
  height?: number;
}) {
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxScore = 100;
  const minScore = 40;

  const points = data.map((pt, idx) => {
    const x = paddingLeft + (idx / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((pt.score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, score: pt.score, turn: pt.turn };
  });

  const pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible font-mono text-xs">
      {/* Background Grid Lines */}
      {[40, 60, 80, 100].map((val) => {
        const y = paddingTop + chartHeight - ((val - minScore) / (maxScore - minScore)) * chartHeight;
        return (
          <g key={val}>
            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
            <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="bold">
              {val}
            </text>
          </g>
        );
      })}

      {/* Axis Lines */}
      <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + chartHeight} stroke="#94a3b8" strokeWidth="1.5" />

      {/* Dynamic Line & Area Fill */}
      <path d={`${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`} fill="rgba(126, 34, 206, 0.08)" />
      <path d={pathD} fill="none" stroke="#7e22ce" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data Markers & Labels */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="5" fill="#7e22ce" stroke="#ffffff" strokeWidth="2" />
          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#581c87" fontSize="11" fontWeight="bold">
            {pt.score}%
          </text>
          <text x={pt.x} y={paddingTop + chartHeight + 18} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="bold">
            {pt.turn}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PDFBarChart({
  data = [
    { name: "Technical Correctness", score: 85 },
    { name: "Reasoning Quality", score: 78 },
    { name: "Depth of Knowledge", score: 70 },
    { name: "Communication Clarity", score: 88 },
    { name: "Engineering Judgement", score: 80 },
  ],
  width = 450,
}: {
  data?: { name: string; score: number }[];
  width?: number;
}) {
  return (
    <div className="w-full space-y-2 font-mono text-xs">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-800">
            <span>{item.name}</span>
            <span className="text-purple-700">{item.score} / 100</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            <div
              className="h-full bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 rounded-full"
              style={{ width: `${item.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PDFPieChart({
  mastered = 60,
  developing = 25,
  gaps = 15,
}: {
  mastered?: number;
  developing?: number;
  gaps?: number;
}) {
  return (
    <div className="flex items-center justify-around space-x-6 p-4 rounded-xl border border-slate-300 bg-white font-mono">
      {/* Pure SVG Pie Chart */}
      <svg width="120" height="120" viewBox="0 0 42 42" className="overflow-visible">
        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" strokeWidth="5" />

        {/* Segment 1: Mastered (Emerald) */}
        <circle
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke="#059669"
          strokeWidth="5"
          strokeDasharray={`${mastered} ${100 - mastered}`}
          strokeDashoffset="25"
        />

        {/* Segment 2: Developing (Purple) */}
        <circle
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke="#7e22ce"
          strokeWidth="5"
          strokeDasharray={`${developing} ${100 - developing}`}
          strokeDashoffset={`${25 - mastered}`}
        />

        {/* Segment 3: Gaps (Amber) */}
        <circle
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke="#d97706"
          strokeWidth="5"
          strokeDasharray={`${gaps} ${100 - gaps}`}
          strokeDashoffset={`${25 - mastered - developing}`}
        />
      </svg>

      {/* Legend Table */}
      <div className="space-y-2 text-xs font-bold">
        <div className="flex items-center space-x-2 text-emerald-700">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
          <span>Mastered Areas: {mastered}%</span>
        </div>
        <div className="flex items-center space-x-2 text-purple-700">
          <span className="w-3 h-3 rounded-full bg-purple-700 inline-block" />
          <span>Developing Areas: {developing}%</span>
        </div>
        <div className="flex items-center space-x-2 text-amber-700">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
          <span>Knowledge Gaps: {gaps}%</span>
        </div>
      </div>
    </div>
  );
}

export function PDFRadarChart({
  metrics = {
    correctness: 85,
    reasoning: 78,
    depth: 70,
    communication: 88,
    engineering: 80,
  },
  size = 180,
}: {
  metrics?: { correctness: number; reasoning: number; depth: number; communication: number; engineering: number };
  size?: number;
}) {
  const center = size / 2;
  const radius = size * 0.38;

  const axes = [
    { name: "Correctness", val: metrics.correctness },
    { name: "Reasoning", val: metrics.reasoning },
    { name: "Depth", val: metrics.depth },
    { name: "Communication", val: metrics.communication },
    { name: "Engineering", val: metrics.engineering },
  ];

  const totalAxes = axes.length;
  const polyPoints = axes.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
    const r = (axis.val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex items-center justify-center p-3 rounded-xl border border-slate-300 bg-white">
      <svg width={size} height={size} className="overflow-visible font-mono text-[9px]">
        {/* Radar Web Concentric Polygons */}
        {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
          const points = axes.map((_, i) => {
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            const r = radius * level;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(" ");
          return <polygon key={lIdx} points={points} fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray={level === 1 ? undefined : "2 2"} />;
        })}

        {/* Radial Axis Lines */}
        {axes.map((_, i) => {
          const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1" />;
        })}

        {/* Data Polygon Fill */}
        <polygon points={polyPoints} fill="rgba(126, 34, 206, 0.2)" stroke="#7e22ce" strokeWidth="2" />

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
          const labelRadius = radius + 14;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" fill="#334155" fontWeight="bold">
              {axis.name} ({axis.val})
            </text>
          );
        })}
      </svg>
    </div>
  );
}
