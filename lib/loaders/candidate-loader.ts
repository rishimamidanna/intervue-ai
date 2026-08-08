/**
 * lib/loaders/candidate-loader.ts
 *
 * Candidate Data Loader
 *
 * Responsible for reading, parsing, and validating candidate profile data
 * from JSON files or raw inputs into typed CandidateProfile domain objects.
 *
 * Architecture Position: Data Loading Layer (JSON -> Loader -> Validated Candidate Objects)
 *
 * Owner: Shared / Backend (Data Layer)
 */

import fs from "fs";
import path from "path";
import type { CandidateProfile } from "@/types/candidate";
import { CandidatesDataSchema, CandidateProfileSchema } from "@/schemas/candidate.schema";
import { safeValidate, strictValidate, type ValidationResult } from "@/lib/validation";

export interface LoadCandidateOptions {
  /** Optional custom file path to load candidate JSON from */
  filePath?: string;
  /** Optional raw data object or string to validate directly */
  data?: unknown;
}

/**
 * Validates raw data against CandidateProfile or CandidatesData schema.
 * Handles both object container `{ candidates: [...] }` and array `[...]` formats.
 *
 * @param raw - Unknown data input (object, array, or JSON string)
 * @returns ValidationResult<CandidateProfile[]>
 */
export function validateCandidatesData(raw: unknown): ValidationResult<CandidateProfile[]> {
  if (raw === null || raw === undefined) {
    return { success: false, errors: ["Candidate data is missing or null"] };
  }

  let dataToValidate = raw;
  if (typeof raw === "string") {
    try {
      dataToValidate = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, errors: [`Invalid JSON string format: ${msg}`] };
    }
  }

  // Check if raw data is container object { candidates: [...] }
  if (typeof dataToValidate === "object" && dataToValidate !== null && !Array.isArray(dataToValidate)) {
    const containerResult = safeValidate(CandidatesDataSchema, dataToValidate);
    if (containerResult.success) {
      return { success: true, data: containerResult.data.candidates };
    }
    return { success: false, errors: containerResult.errors };
  }

  // Check if raw data is direct array of CandidateProfile objects
  if (Array.isArray(dataToValidate)) {
    const errors: string[] = [];
    const validatedProfiles: CandidateProfile[] = [];

    dataToValidate.forEach((item, index) => {
      const itemResult = safeValidate(CandidateProfileSchema, item);
      if (itemResult.success) {
        validatedProfiles.push(itemResult.data);
      } else {
        itemResult.errors.forEach((err) => {
          errors.push(`Candidate at index [${index}]: ${err}`);
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (validatedProfiles.length === 0) {
      return { success: false, errors: ["Candidates array must not be empty"] };
    }

    return { success: true, data: validatedProfiles };
  }

  return {
    success: false,
    errors: ["Candidate data must be an object with a 'candidates' array or an array of candidate profiles"],
  };
}

/**
 * Parses and validates candidate data, throwing a descriptive Error if validation fails.
 *
 * @param rawData - Unknown data input or JSON string
 * @returns Validated CandidateProfile[]
 * @throws {Error} Detailed error message listing field-level validation errors
 */
export function parseCandidatesData(rawData: unknown): CandidateProfile[] {
  const result = validateCandidatesData(rawData);
  if (!result.success) {
    throw new Error(`Failed to load candidates:\n${result.errors.join("\n")}`);
  }
  return result.data;
}

/**
 * Parses and validates a single CandidateProfile object.
 *
 * @param rawData - Unknown single candidate data object or string
 * @returns Validated CandidateProfile
 * @throws {Error} Detailed error message if validation fails
 */
export function parseSingleCandidate(rawData: unknown): CandidateProfile {
  let dataToValidate = rawData;
  if (typeof rawData === "string") {
    try {
      dataToValidate = JSON.parse(rawData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid candidate JSON string: ${msg}`);
    }
  }

  return strictValidate(CandidateProfileSchema, dataToValidate, "Candidate Profile");
}

/**
 * Reads candidate JSON file from disk or custom path and returns validated CandidateProfile array.
 *
 * @param options - Load options containing optional filePath or data
 * @returns Array of validated CandidateProfile objects
 * @throws {Error} If reading or validation fails
 */
export async function loadCandidates(options?: LoadCandidateOptions): Promise<CandidateProfile[]> {
  if (options?.data !== undefined) {
    return parseCandidatesData(options.data);
  }

  const defaultPath = path.join(process.cwd(), "data", "candidates.json");
  const targetPath = options?.filePath ? path.resolve(options.filePath) : defaultPath;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Candidate data file not found at path: ${targetPath}`);
  }

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(targetPath, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read candidate data file at ${targetPath}: ${msg}`);
  }

  return parseCandidatesData(fileContent);
}

/**
 * Loads candidate profiles and finds a single candidate by member ID.
 *
 * @param candidateId - The ID of the candidate to retrieve (e.g. "CAND-001")
 * @param options - Optional file path or raw data overrides
 * @returns CandidateProfile or null if not found
 */
export async function loadCandidateById(
  candidateId: string,
  options?: LoadCandidateOptions
): Promise<CandidateProfile | null> {
  const candidates = await loadCandidates(options);
  return candidates.find((c) => c.member.id === candidateId) ?? null;
}
