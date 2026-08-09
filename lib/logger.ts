/**
 * lib/logger.ts
 *
 * Lightweight Production Observability & Logging Utility.
 * Formats diagnostic log entries for session creation, AI fallbacks, Redis events,
 * and report generation without exposing sensitive candidate PII or raw answer text.
 *
 * Owner: Member 2 (Backend / Architecture)
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function formatTimestamp(): string {
  return new Date().toISOString();
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Redact sensitive or verbose raw text fields
    if (key.toLowerCase().includes("answer") || key.toLowerCase().includes("key") || key.toLowerCase().includes("token")) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, metadata?: Record<string, unknown>) {
    const metaStr = metadata ? ` ${JSON.stringify(sanitizeMetadata(metadata))}` : "";
    console.log(`[INFO] [${formatTimestamp()}] ${message}${metaStr}`);
  },

  warn(message: string, metadata?: Record<string, unknown>) {
    const metaStr = metadata ? ` ${JSON.stringify(sanitizeMetadata(metadata))}` : "";
    console.warn(`[WARN] [${formatTimestamp()}] ${message}${metaStr}`);
  },

  error(message: string, error?: unknown, metadata?: Record<string, unknown>) {
    const errMessage = error instanceof Error ? error.message : String(error ?? "");
    const metaStr = metadata ? ` ${JSON.stringify(sanitizeMetadata(metadata))}` : "";
    console.error(`[ERROR] [${formatTimestamp()}] ${message} ${errMessage}${metaStr}`);
  },

  debug(message: string, metadata?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      const metaStr = metadata ? ` ${JSON.stringify(sanitizeMetadata(metadata))}` : "";
      console.log(`[DEBUG] [${formatTimestamp()}] ${message}${metaStr}`);
    }
  },
};
