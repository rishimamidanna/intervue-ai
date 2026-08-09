/**
 * server/hallucination-guard.ts
 *
 * Hallucination Guard Layer (Milestone 7.21)
 *
 * Verifies that generated system or LLM responses are fully grounded in and supported
 * by the retrieved curriculum context chunks to prevent hallucination.
 *
 * Flow:
 *   Generated Answer → Verification Layer → Groundedness Audit → Supported? (YES/NO) → Optional Regene
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  RetrievedChunk,
  HallucinationGuardResponse,
} from "@/types/rag";
import { HallucinationGuardResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

export class HallucinationGuard {
  /**
   * Compares the generated answer against the retrieved reference context chunks
   * to determine semantic groundedness and detect unsupported claims.
   *
   * @param answer - Generated candidate/system response
   * @param retrievedContext - Context string or array of chunks
   * @returns HallucinationGuardResponse
   */
  verify(
    answer: string,
    retrievedContext: string | RetrievedChunk[]
  ): HallucinationGuardResponse {
    let contextText = "";
    if (typeof retrievedContext === "string") {
      contextText = retrievedContext;
    } else if (Array.isArray(retrievedContext)) {
      contextText = retrievedContext.map((c) => c.content).join("\n");
    }

    const normalizedContext = contextText.toLowerCase();

    // 1. Identify specific claims (acronyms, technical tools, frameworks, metrics)
    const candidates = answer.match(/\b([A-Z][a-zA-Z0-9-]{2,})\b/g) || [];
    const uniqueClaims = Array.from(new Set(candidates));

    const unsupportedClaims: string[] = [];
    let confidence = 1.0;

    for (const claim of uniqueClaims) {
      // Skip common English sentence starters
      if (["the", "and", "for", "you", "that", "this", "our", "are"].includes(claim.toLowerCase())) {
        continue;
      }

      // If the specific framework/term is in the answer but completely missing from the context, it's a hallucination
      if (!normalizedContext.includes(claim.toLowerCase())) {
        unsupportedClaims.push(`Claim: "${claim}"`);
        confidence -= 0.15;
      }
    }

    // Additional check: numeric references (like days or parameters)
    const numbersInAnswer = answer.match(/\b(\d+)\b/g) || [];
    for (const num of Array.from(new Set(numbersInAnswer))) {
      if (num.length > 0 && !normalizedContext.includes(num)) {
        // Soft deduction for numeric claims (e.g. Day 9 vs Day 5)
        unsupportedClaims.push(`Numeric parameter: "${num}"`);
        confidence -= 0.05;
      }
    }

    confidence = Number(Math.max(0, Math.min(1, confidence)).toFixed(2));
    const supported = unsupportedClaims.length === 0 && confidence >= 0.85;

    let explanation = "All claims in the generated response are fully grounded in the retrieved curriculum context.";
    if (!supported) {
      explanation = `Detected ${unsupportedClaims.length} unsupported claim(s) not present in retrieved context. Confidence dropped to ${confidence}.`;
    }

    const response: HallucinationGuardResponse = {
      supported,
      confidence,
      unsupportedClaims,
      explanation,
    };

    return strictValidate(
      HallucinationGuardResponseSchema,
      response,
      "Hallucination Guard Response"
    );
  }

  /**
   * Executes response generation, automatically auditing and regnerating
   * up to a configurable maximum retry limit if hallucinations are detected.
   *
   * @param retrievedContext - Context references to check against
   * @param generatorFn - Asynchronous generator function (called with current attempt index)
   * @param maxAttempts - Maximum retries to prevent infinite loops (default: 3)
   * @returns Audited response text and verification metadata
   */
  async validateAndGenerate(
    retrievedContext: string | RetrievedChunk[],
    generatorFn: (attempt: number) => Promise<string>,
    maxAttempts = 3
  ): Promise<{ answer: string; verification: HallucinationGuardResponse; attemptsMade: number }> {
    let lastAnswer = "";
    let lastVerification: HallucinationGuardResponse | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      lastAnswer = await generatorFn(attempt);
      lastVerification = this.verify(lastAnswer, retrievedContext);

      if (lastVerification.supported) {
        return {
          answer: lastAnswer,
          verification: lastVerification,
          attemptsMade: attempt,
        };
      }
    }

    // Fallback: return the last attempt if max retries reached without full success
    return {
      answer: lastAnswer,
      verification: lastVerification || {
        supported: false,
        confidence: 0,
        unsupportedClaims: ["Verification failed"],
        explanation: "Verification timed out or failed to find supported text.",
      },
      attemptsMade: maxAttempts,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultHallucinationGuard = new HallucinationGuard();
