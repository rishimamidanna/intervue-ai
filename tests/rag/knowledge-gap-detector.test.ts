import assert from "node:assert/strict";
import test from "node:test";
import { detectLightweightKnowledgeGaps } from "../../server/knowledge-gap-detector";

test("1. Correct answer detects zero missing concepts and low severity", async () => {
  const input = {
    question: "Explain vector retrieval",
    expectedConcepts: ["embeddings", "similarity search"],
    candidateAnswer: "Embeddings are used with similarity search to retrieve vectors.",
  };

  const result = await detectLightweightKnowledgeGaps(input);

  assert.deepEqual(result.coveredConcepts, ["embeddings", "similarity search"]);
  assert.deepEqual(result.missingConcepts, []);
  assert.equal(result.severity, "low");
});

test("2. Partial answer detects missing concepts and medium severity", async () => {
  const input = {
    question: "Explain vector databases",
    expectedConcepts: ["embeddings", "similarity search", "vector indexing"],
    candidateAnswer: "Vector database stores vectors",
  };

  const result = await detectLightweightKnowledgeGaps(input);

  assert.deepEqual(result.missingConcepts, ["embeddings", "similarity search"]);
  assert.deepEqual(result.coveredConcepts, ["vector indexing"]);
  assert.equal(result.severity, "medium");
});

test("3. Wrong answer detects all concepts missing and high severity", async () => {
  const input = {
    question: "Explain BM25 algorithm",
    expectedConcepts: ["tf-idf", "term frequency", "document length normalization"],
    candidateAnswer: "I am not sure about this topic.",
  };

  const result = await detectLightweightKnowledgeGaps(input);

  assert.deepEqual(result.missingConcepts, [
    "tf-idf",
    "term frequency",
    "document length normalization",
  ]);
  assert.deepEqual(result.coveredConcepts, []);
  assert.equal(result.severity, "high");
});
