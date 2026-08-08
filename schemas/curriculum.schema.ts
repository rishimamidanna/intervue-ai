/**
 * schemas/curriculum.schema.ts
 *
 * Zod validation schema for Curriculum JSON data.
 * Validates modules, 31-day topics, tools, and objectives to guarantee valid data structure.
 *
 * Owner: Shared (Data & Backend Layer)
 */

import { z } from "zod";

export const CurriculumModuleSchema = z.object({
  n: z.number().int().min(1, "Module number must be at least 1"),
  title: z.string().min(1, "Module title must not be empty"),
  days: z.tuple([
    z.number().int().min(1, "Module start day must be at least 1").max(31, "Module start day must be at most 31"),
    z.number().int().min(1, "Module end day must be at least 1").max(31, "Module end day must be at most 31"),
  ]),
});

export const CurriculumDaySchema = z.object({
  day: z.number().int().min(1, "Curriculum day must be at least 1").max(31, "Curriculum day must be at most 31"),
  title: z.string().min(1, "Day title must not be empty"),
  type: z.string().min(1, "Day type must not be empty"),
  tools: z.array(z.string()),
  objectives: z.array(z.string()),
});

export const CurriculumDataSchema = z.object({
  cohort: z.string().min(1, "Cohort name must not be empty"),
  modules: z.array(CurriculumModuleSchema).min(1, "Modules array must not be empty"),
  days: z.array(CurriculumDaySchema).min(1, "Days array must not be empty"),
});

export type CurriculumModuleInput = z.input<typeof CurriculumModuleSchema>;
export type CurriculumDayInput = z.input<typeof CurriculumDaySchema>;
export type CurriculumDataInput = z.input<typeof CurriculumDataSchema>;
