/**
 * schemas/curriculum.schema.ts
 *
 * Zod validation schema for Curriculum Day data.
 * Ensures curriculum items loaded from curriculum.json adhere to expected specifications.
 *
 * Owner: Member 2 (Data + RAG)
 */

import { z } from "zod";

export const CurriculumDaySchema = z
  .object({
    day: z.number().int().min(1, "Curriculum day must be a positive integer"),
    topic: z.string().min(1, "Topic is required"),
    title: z.string().min(1, "Title is required"),
    module: z.string().optional(),
    concepts: z
      .array(z.string().min(1, "Concept string must not be empty"))
      .min(1, "At least one concept is required"),
    content: z.union([z.string(), z.array(z.string())]).optional(),
    learningObjectives: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  })
  .passthrough();

export const CurriculumArraySchema = z
  .array(CurriculumDaySchema)
  .refine(
    (days) => {
      const dayNumbers = new Set<number>();
      for (const item of days) {
        if (dayNumbers.has(item.day)) return false;
        dayNumbers.add(item.day);
      }
      return true;
    },
    { message: "Curriculum day numbers must be unique" }
  );
