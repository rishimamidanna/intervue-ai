/**
 * lib/loaders/curriculum-loader.ts
 *
 * Curriculum Data Loader
 *
 * Responsible for reading, parsing, and validating curriculum cohort data from JSON files
 * or raw inputs into structured, typed CurriculumData, CurriculumDay[], and CurriculumIndex objects.
 *
 * Architecture Position: Data Loading Layer (JSON -> Loader -> Validated Curriculum Objects)
 *
 * Owner: Shared / Backend (Data Layer)
 */

import fs from "fs";
import path from "path";
import type { CurriculumData, CurriculumDay, CurriculumIndex } from "@/types/curriculum";
import { CurriculumDataSchema, CurriculumDaySchema } from "@/schemas/curriculum.schema";
import { safeValidate, type ValidationResult } from "@/lib/validation";

export interface LoadCurriculumOptions {
  /** Optional custom file path to load curriculum JSON from */
  filePath?: string;
  /** Optional raw data object or string to validate directly */
  data?: unknown;
}

/**
 * Normalizes a validated CurriculumData object:
 * Computes helper properties on each CurriculumDay (such as module title, topic alias, learningObjectives alias).
 *
 * @param curriculumData - Validated raw curriculum data
 * @returns Normalized CurriculumData
 */
export function normalizeCurriculumData(curriculumData: CurriculumData): CurriculumData {
  const moduleMap = new Map<number, string>();

  // Build range mapping for modules
  curriculumData.modules.forEach((mod) => {
    const [startDay, endDay] = mod.days;
    for (let dayNum = startDay; dayNum <= endDay; dayNum++) {
      moduleMap.set(dayNum, mod.title);
    }
  });

  const normalizedDays: CurriculumDay[] = curriculumData.days.map((dayObj) => {
    const moduleName = moduleMap.get(dayObj.day) ?? "";
    return {
      ...dayObj,
      module: moduleName,
      topic: dayObj.title,
      learningObjectives: dayObj.objectives,
      concepts: dayObj.tools, // tools & objectives represent concepts
    };
  });

  return {
    ...curriculumData,
    days: normalizedDays,
  };
}

/**
 * Validates raw input data against CurriculumData or array of CurriculumDay schemas.
 *
 * @param raw - Unknown data input (object, array, or JSON string)
 * @returns ValidationResult<CurriculumData>
 */
export function validateCurriculumData(raw: unknown): ValidationResult<CurriculumData> {
  if (raw === null || raw === undefined) {
    return { success: false, errors: ["Curriculum data is missing or null"] };
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

  // Case 1: Standard object container { cohort, modules, days }
  if (typeof dataToValidate === "object" && dataToValidate !== null && !Array.isArray(dataToValidate)) {
    const result = safeValidate(CurriculumDataSchema, dataToValidate);
    if (result.success) {
      return { success: true, data: normalizeCurriculumData(result.data) };
    }
    return { success: false, errors: result.errors };
  }

  // Case 2: Direct array of days
  if (Array.isArray(dataToValidate)) {
    const errors: string[] = [];
    const validatedDays: CurriculumDay[] = [];

    dataToValidate.forEach((item, index) => {
      const itemResult = safeValidate(CurriculumDaySchema, item);
      if (itemResult.success) {
        validatedDays.push(itemResult.data);
      } else {
        itemResult.errors.forEach((err) => {
          errors.push(`Curriculum day at index [${index}]: ${err}`);
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (validatedDays.length === 0) {
      return { success: false, errors: ["Curriculum days array must not be empty"] };
    }

    const fallbackData: CurriculumData = {
      cohort: "Standard AI Cohort",
      modules: [],
      days: validatedDays,
    };

    return { success: true, data: normalizeCurriculumData(fallbackData) };
  }

  return {
    success: false,
    errors: ["Curriculum data must be an object with 'cohort', 'modules', and 'days' or an array of day objects"],
  };
}

/**
 * Parses and validates curriculum data, throwing a descriptive Error on validation failure.
 *
 * @param rawData - Unknown data input or JSON string
 * @returns Validated CurriculumData
 * @throws {Error} Detailed error message listing field-level validation errors
 */
export function parseCurriculumData(rawData: unknown): CurriculumData {
  const result = validateCurriculumData(rawData);
  if (!result.success) {
    throw new Error(`Failed to load curriculum:\n${result.errors.join("\n")}`);
  }
  return result.data;
}

/**
 * Reads curriculum JSON file from disk or custom path and returns validated CurriculumData object.
 *
 * @param options - Load options containing optional filePath or data
 * @returns Validated CurriculumData object
 * @throws {Error} If reading or validation fails
 */
export async function loadCurriculum(options?: LoadCurriculumOptions): Promise<CurriculumData> {
  if (options?.data !== undefined) {
    return parseCurriculumData(options.data);
  }

  const defaultPath = path.join(process.cwd(), "data", "curriculum.json");
  const targetPath = options?.filePath ? path.resolve(options.filePath) : defaultPath;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Curriculum data file not found at path: ${targetPath}`);
  }

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(targetPath, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read curriculum data file at ${targetPath}: ${msg}`);
  }

  return parseCurriculumData(fileContent);
}

/**
 * Builds an O(1) day-indexed CurriculumIndex map from CurriculumData.
 *
 * @param options - Optional file path or raw data overrides
 * @returns CurriculumIndex — Record<number, CurriculumDay>
 */
export async function getCurriculumIndex(options?: LoadCurriculumOptions): Promise<CurriculumIndex> {
  const data = await loadCurriculum(options);
  const index: CurriculumIndex = {};
  data.days.forEach((dayObj) => {
    index[dayObj.day] = dayObj;
  });
  return index;
}

/**
 * Retrieves a single CurriculumDay by its 1-indexed day number (1–31).
 *
 * @param dayNumber - Day number in the curriculum (1–31)
 * @param options - Optional file path or raw data overrides
 * @returns CurriculumDay or null if not found
 */
export async function getCurriculumDay(
  dayNumber: number,
  options?: LoadCurriculumOptions
): Promise<CurriculumDay | null> {
  const index = await getCurriculumIndex(options);
  return index[dayNumber] ?? null;
}
