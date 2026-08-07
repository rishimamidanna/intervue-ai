/**
 * lib/utils.ts
 *
 * General-purpose utility functions used across the application.
 *
 * Owner: Shared — any team member may add utilities here.
 *   Coordinate additions to avoid duplication.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ---------------------------------------------------------------------------
// Tailwind class merging
// ---------------------------------------------------------------------------

/**
 * Merges Tailwind CSS class names with conflict resolution.
 * Standard shadcn/ui pattern — used throughout component files.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generates a pseudo-UUID v4 using the Web Crypto API.
 * Safe for use in both server and client contexts in Next.js.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Returns the current UTC timestamp as an ISO 8601 string.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Formats an ISO 8601 timestamp for display in the report UI.
 *
 * @example formatDisplayDate("2025-01-01T12:00:00Z") → "January 1, 2025"
 */
export function formatDisplayDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

/**
 * Clamps a number within [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts a 0–10 score to a percentage string for display.
 *
 * @example scoreToPercent(7.5) → "75%"
 */
export function scoreToPercent(score: number): string {
  return `${Math.round(clamp(score, 0, 10) * 10)}%`;
}
