/**
 * schemas/curriculum.schema.ts
 *
 * Zod validation schema for Curriculum Day & Normalized Curriculum data.
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

// ---------------------------------------------------------------------------
// Normalized Curriculum Document Schemas (Milestone 3.1)
// ---------------------------------------------------------------------------

export const CurriculumSourceRefSchema = z.object({
  file: z.string().min(1),
  day: z.number().int().min(1),
  uri: z.string().min(1),
});

export const CurriculumMetadataSchema = z
  .object({
    day: z.number().int().min(1),
    topic: z.string().min(1),
    title: z.string().min(1),
    module: z.string().min(1),
    conceptCount: z.number().int().min(0),
    toolsCount: z.number().int().min(0),
    objectivesCount: z.number().int().min(0),
  })
  .passthrough();

export const NormalizedCurriculumItemSchema = z.object({
  id: z.string().min(1, "Normalized curriculum ID is required"),
  day: z.number().int().min(1),
  module: z.string().min(1),
  topic: z.string().min(1),
  title: z.string().min(1),
  concepts: z.array(z.string()),
  content: z.string(),
  learningObjectives: z.array(z.string()),
  tools: z.array(z.string()),
  sourceRef: CurriculumSourceRefSchema,
  metadata: CurriculumMetadataSchema,
});

export const NormalizedCurriculumArraySchema = z.array(NormalizedCurriculumItemSchema);
