import assert from "node:assert/strict";
import test from "node:test";
import { calculateLightweightDifficulty } from "../../server/difficulty-engine";

test("1. High score (>= 80) increases difficulty", async () => {
  const input = {
    score: 90,
    confidence: "high",
    currentDifficulty: "medium",
  };

  const result = await calculateLightweightDifficulty(input);

  assert.equal(result.nextDifficulty, "hard");
  assert.equal(result.reason, "Strong performance");
});

test("2. Average score (50-80) maintains difficulty", async () => {
  const input = {
    score: 65,
    confidence: "medium",
    currentDifficulty: "medium",
  };

  const result = await calculateLightweightDifficulty(input);

  assert.equal(result.nextDifficulty, "medium");
  assert.equal(result.reason, "Satisfactory performance");
});

test("3. Low score (< 50) decreases difficulty", async () => {
  const input = {
    score: 30,
    confidence: "low",
    currentDifficulty: "medium",
  };

  const result = await calculateLightweightDifficulty(input);

  assert.equal(result.nextDifficulty, "easy");
  assert.equal(result.reason, "Needs reinforcement");
});
