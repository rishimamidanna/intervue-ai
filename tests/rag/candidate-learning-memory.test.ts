import assert from "node:assert/strict";
import test from "node:test";
import { InterviewMemoryRAG, type ICandidateMemoryStoreProvider } from "../../server/interview-memory";
import type { CandidateMemoryStore } from "../../types/rag";

class MemoryOnlyStoreProvider implements ICandidateMemoryStoreProvider {
  name = "memory-only-test-provider";
  private store = new Map<string, CandidateMemoryStore>();

  async getMemory(candidateId: string): Promise<CandidateMemoryStore | null> {
    return this.store.get(candidateId) || null;
  }

  async saveMemory(memory: CandidateMemoryStore): Promise<void> {
    this.store.set(memory.id, memory);
  }
}

test("candidate memory initialization sets default empty arrays for weaknesses and recommendedTopics", async () => {
  const provider = new MemoryOnlyStoreProvider();
  const memoryRAG = new InterviewMemoryRAG(provider);
  const memory = await memoryRAG.getOrCreateMemory("test-candidate-1");

  assert.equal(memory.id, "test-candidate-1");
  assert.deepEqual(memory.strengths, []);
  assert.deepEqual(memory.weaknesses, []);
  assert.deepEqual(memory.recommendedTopics, []);
  assert.deepEqual(memory.weakAreas, []);
});

test("updating candidate learning memory after evaluation extracts strengths, weaknesses, and recommended topics", async () => {
  const provider = new MemoryOnlyStoreProvider();
  const memoryRAG = new InterviewMemoryRAG(provider);

  const question = {
    topic: "RAG Evaluation",
  };

  const evaluation = {
    correctness: 4, // struggling score
    coveredConcepts: ["Context Grounding"],
    missingConcepts: ["Answer Relevance"],
    misconceptions: ["Hallucination Reduction"],
  };

  const memory = await memoryRAG.updateCandidateLearningMemory(
    "test-candidate-2",
    question,
    evaluation
  );

  // Covered concepts -> strengths
  assert.deepEqual(memory.strengths, ["Context Grounding"]);
  // Missing + misconceptions -> weaknesses & weakAreas
  assert.deepEqual(memory.weaknesses, ["Answer Relevance", "Hallucination Reduction"]);
  assert.deepEqual(memory.weakAreas, ["Answer Relevance", "Hallucination Reduction"]);
  // Struggled -> question topic + missingConcepts -> recommendedTopics
  assert.deepEqual(memory.recommendedTopics, ["RAG Evaluation", "Answer Relevance"]);
});

test("successful answer removes previous weaknesses and recommended topics", async () => {
  const provider = new MemoryOnlyStoreProvider();
  const memoryRAG = new InterviewMemoryRAG(provider);

  // First struggle
  const question1 = { topic: "ChromaDB" };
  const eval1 = {
    correctness: 3,
    coveredConcepts: [],
    missingConcepts: ["Vector Store Indices"],
    misconceptions: [],
  };
  await memoryRAG.updateCandidateLearningMemory("test-candidate-3", question1, eval1);

  // Then succeed on the same topic/concepts
  const question2 = { topic: "ChromaDB" };
  const eval2 = {
    correctness: 9, // excellent score
    coveredConcepts: ["Vector Store Indices"],
    missingConcepts: [],
    misconceptions: [],
  };
  const memory = await memoryRAG.updateCandidateLearningMemory("test-candidate-3", question2, eval2);

  // Concept moved from weaknesses/recommendedTopics to strengths
  assert.deepEqual(memory.strengths, ["Vector Store Indices"]);
  assert.deepEqual(memory.weaknesses, []);
  assert.deepEqual(memory.weakAreas, []);
  // Mastered -> topic removed from recommendedTopics
  assert.deepEqual(memory.recommendedTopics, []);
});

test("candidate context string contains weaknesses, strengths, and recommendedTopics", async () => {
  const provider = new MemoryOnlyStoreProvider();
  const memoryRAG = new InterviewMemoryRAG(provider);

  // populate memory
  const memory = await memoryRAG.getOrCreateMemory("test-candidate-4");
  memory.strengths = ["Embeddings"];
  memory.weaknesses = ["BM25"];
  memory.recommendedTopics = ["BM25 Sparse Retrieval"];
  await provider.saveMemory(memory);

  const context = memoryRAG.buildCandidateContext("test-candidate-4", memory, []);

  assert.match(context, /Demonstrated Strengths: Embeddings/);
  assert.match(context, /Target Weaknesses: BM25/);
  assert.match(context, /Recommended Topics to Study: BM25 Sparse Retrieval/);
});
