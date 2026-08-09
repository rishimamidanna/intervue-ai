import assert from "node:assert/strict";
import test from "node:test";
import { performLightweightReflection } from "../../server/reflection-agent";

test("1. Good answer with context passes reflection with quality 'good' and no issues", () => {
  const input = {
    answer: "RAG uses retrieval to provide context",
    context: "RAG system context: retrieval augmented generation provides context",
    expectedConcepts: ["retrieval", "context"],
    confidence: "high",
  };

  const result = performLightweightReflection(input);

  assert.equal(result.quality, "good");
  assert.equal(result.confidence, "high");
  assert.deepEqual(result.issues, []);
});

test("2. Missing context returns quality 'needs_review' with 'Missing retrieved context' issue", () => {
  const input = {
    answer: "RAG uses retrieval",
    context: "", // Missing context
    expectedConcepts: ["retrieval", "context", "generation"],
    confidence: "medium",
  };

  const result = performLightweightReflection(input);

  assert.equal(result.quality, "needs_review");
  assert.ok(result.issues.includes("Missing retrieved context"));
  assert.equal(result.recommendation, "Retry with improved context");
});

test("3. Low confidence answer returns quality 'needs_review' with 'Low confidence score' issue", () => {
  const input = {
    answer: "RAG uses retrieval to provide context",
    context: "RAG context available",
    expectedConcepts: ["retrieval", "context"],
    confidence: "low",
  };

  const result = performLightweightReflection(input);

  assert.equal(result.quality, "needs_review");
  assert.ok(result.issues.includes("Low confidence score"));
  assert.equal(result.confidence, "low");
});
