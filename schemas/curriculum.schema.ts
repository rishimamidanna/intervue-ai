/**
 * schemas/curriculum.schema.ts
 *
 * Zod validation schema for Curriculum Day, Normalized Curriculum, Concept & Enriched Concept data.
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

// ---------------------------------------------------------------------------
// Curriculum Concept Extraction Schemas (Milestone 3.2)
// ---------------------------------------------------------------------------

export const CurriculumConceptSchema = z.object({
  id: z.string().min(1, "Concept ID is required"),
  conceptName: z.string().min(1, "conceptName is required"),
  relatedKeywords: z.array(z.string()).min(1, "relatedKeywords must contain at least one keyword"),
  sourceDay: z.number().int().min(1, "sourceDay must be a positive integer"),
  sourceTopic: z.string().min(1, "sourceTopic is required"),
  module: z.string().min(1, "module is required"),
  tools: z.array(z.string()),
  description: z.string().min(1, "description is required"),
});

export const CurriculumConceptArraySchema = z.array(CurriculumConceptSchema);

// ---------------------------------------------------------------------------
// Curriculum Concept Metadata Enrichment Schemas (Milestone 3.3)
// ---------------------------------------------------------------------------

export const ConceptDifficultyLevelSchema = z.enum([
  "Beginner",
  "Intermediate",
  "Advanced",
]);

export const ConceptSourceMappingSchema = z.object({
  file: z.string().min(1),
  day: z.number().int().min(1),
  uri: z.string().min(1),
  topic: z.string().min(1),
  module: z.string().min(1),
});

export const EnrichedConceptMetadataSchema = z.object({
  difficultyLevel: ConceptDifficultyLevelSchema,
  category: z.string().min(1),
  conceptCountInDay: z.number().int().min(0),
  toolCount: z.number().int().min(0),
  isAgentic: z.boolean(),
  isRagFoundation: z.boolean(),
});

export const EnrichedCurriculumConceptSchema = z.object({
  id: z.string().min(1),
  conceptName: z.string().min(1),
  difficultyLevel: ConceptDifficultyLevelSchema,
  category: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  relatedConcepts: z.array(z.string()),
  relatedTopics: z.array(z.string()),
  sourceDay: z.number().int().min(1),
  sourceTopic: z.string().min(1),
  module: z.string().min(1),
  tools: z.array(z.string()),
  description: z.string().min(1),
  sourceMapping: ConceptSourceMappingSchema,
  metadata: EnrichedConceptMetadataSchema,
});

export const EnrichedCurriculumConceptArraySchema = z.array(
  EnrichedCurriculumConceptSchema
);
