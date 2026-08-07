/**
 * tests/ai/answer-evaluator.test.ts
 *
 * Unit tests for the Answer Evaluation Engine.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 *
 * TODO: Install a test runner (Jest or Vitest) and implement real tests.
 *   These test cases document the expected behaviour of evaluateAnswer().
 *
 * Suggested test scenarios:
 *   1. Correct answer with all expected concepts → high scores, "new_topic" action
 *   2. Partially correct answer → medium scores, "probe" or "follow_up" action
 *   3. Answer with misconceptions → low correctness, "decrease_difficulty" action
 *   4. Empty/single-word answer → very low scores, "decrease_difficulty" action
 *   5. Contradictory answer → triggers "contradiction" action
 *
 * Note: Tests that call evaluateAnswer() will require LLM mocking
 *   until the real client is implemented.
 */

// TODO: Uncomment and implement after choosing a test runner (Jest/Vitest)

/*
import { evaluateAnswer } from '@/ai/answer-evaluator';
import type { InterviewQuestion, InterviewState } from '@/types/interview';

const mockQuestion: InterviewQuestion = {
  id: 'test-q-1',
  text: 'Explain how RAG differs from fine-tuning.',
  topic: 'RAG',
  curriculumDay: 1,
  difficulty: 2,
  reason: 'Foundational RAG concept',
  expectedConcepts: ['retrieval', 'vector similarity', 'context window', 'fine-tuning cost'],
};

describe('evaluateAnswer', () => {
  it('should return low scores for an empty answer', async () => {
    // TODO: Implement with LLM mock
  });

  it('should identify covered concepts in a strong answer', async () => {
    // TODO: Implement with LLM mock
  });

  it('should detect misconceptions in an incorrect answer', async () => {
    // TODO: Implement with LLM mock
  });
});
*/

export {}; // Ensure this file is treated as a module
