/**
 * lib/validation.ts
 *
 * Shared Zod validation helpers.
 * Provides consistent error handling for schema validation across all modules.
 *
 * Owner: Shared — Backend and AI members both consume this
 */

import { z, ZodSchema } from "zod";

// ---------------------------------------------------------------------------
// Result Types
// ---------------------------------------------------------------------------

export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationFailure = { success: false; errors: string[] };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely validates data against a Zod schema.
 * Returns a typed result without throwing.
 *
 * @param schema - Any Zod schema
 * @param data - Unknown input to validate
 * @returns ValidationResult<T>
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(
    (issue) => `[${issue.path.join(".")}] ${issue.message}`
  );
  return { success: false, errors };
}

/**
 * Validates data against a Zod schema and throws a descriptive error on failure.
 * Use in server-side code where failures should be hard errors.
 *
 * @param schema - Any Zod schema
 * @param data - Unknown input to validate
 * @param label - Human-readable label for the data (used in error messages)
 * @returns Validated typed data
 * @throws {Error} Validation failure with field-level details
 */
export function strictValidate<T>(
  schema: ZodSchema<T>,
  data: unknown,
  label = "data"
): T {
  const result = safeValidate(schema, data);
  if (!result.success) {
    throw new Error(
      `Validation failed for ${label}:\n${result.errors.join("\n")}`
    );
  }
  return result.data;
}

/**
 * Formats Zod issues into a human-readable string for logging.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  [${issue.path.join(".")}] ${issue.message}`)
    .join("\n");
}
