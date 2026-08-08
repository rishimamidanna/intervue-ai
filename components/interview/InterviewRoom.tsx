"use client";

/**
 * components/interview/InterviewRoom.tsx
 *
 * Full-screen INTERVUE AI Live Interview Command Center Dashboard.
 * Integrates Sidebar, InterviewHeader, QuestionCard, AnswerCard, RobotViewer,
 * IntelligencePanel, and AnalysisBar into a desktop AI command center interface.
 *
 * Milestone 2.2: Interactive Adaptive Interview Flow & Mock Evaluation Engine.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { InterviewHeader } from "./InterviewHeader";
import { QuestionCard } from "./QuestionCard";
import { AnswerCard } from "./AnswerCard";
import { RobotViewer } from "./RobotViewer";
import { IntelligencePanel, Concept, Gap } from "./IntelligencePanel";
import { AnalysisBar } from "./AnalysisBar";

export interface MockQuestion {
  id: number;
  topic: string;
  difficulty: number;
  difficultyTrend: "Increasing" | "Stable" | "Decreasing" | "Mastered";
  tags: string[];
  questionText: string;
  confidence: number;
  retrievedConcepts: Concept[];
  knowledgeGaps: Gap[];
  defaultCandidateAnswer: string;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 1,
    topic: "RAG & Hybrid Retrieval",
    difficulty: 7,
    difficultyTrend: "Increasing",
    tags: ["RAG", "Hybrid Retrieval", "BM25", "Vector Search", "Ranking"],
    questionText:
      "In a hybrid retrieval system that combines dense vector search and sparse BM25 retrieval, how would you design the fusion strategy to balance semantic relevance and exact keyword matching? What factors would you consider when adjusting the weights dynamically?",
    confidence: 88,
    retrievedConcepts: [
      { name: "Reciprocal Rank Fusion (RRF)", score: "98%" },
      { name: "Hybrid Retrieval", score: "94%" },
      { name: "BM25", score: "91%" },
      { name: "Vector Embeddings", score: "89%" },
      { name: "Query Intent Modeling", score: "87%" },
    ],
    knowledgeGaps: [
      { name: "Dynamic Weight Optimization", severity: "Medium", color: "text-amber-400" },
      { name: "Evaluation Metrics for RAG", severity: "Low", color: "text-rose-400" },
    ],
    defaultCandidateAnswer:
      "I would use Reciprocal Rank Fusion (RRF) as the default fusion strategy because it's robust and simple to tune. Each retriever produces a ranked list, and RRF combines them by summing the reciprocal ranks: score(d) = ∑ 1 / (k + rank_i(d)).\n\nTo balance semantic and lexical signals, I'd adjust weights based on query intent signals—such as query length, presence of domain-specific terms.",
  },
  {
    id: 2,
    topic: "Vector DB & Indexing",
    difficulty: 8,
    difficultyTrend: "Increasing",
    tags: ["HNSW", "ANN", "Vector Search", "Quantization", "Latency"],
    questionText:
      "When scaling vector search to hundreds of millions of embeddings, how do you trade off recall vs index build time and query latency using HNSW graphs vs Product Quantization (PQ)? What parameters do you tune under tight latency SLAs?",
    confidence: 92,
    retrievedConcepts: [
      { name: "HNSW Graph Construction", score: "97%" },
      { name: "Product Quantization (PQ)", score: "95%" },
      { name: "efSearch & M Parameters", score: "93%" },
      { name: "Hierarchical Navigable Small World", score: "90%" },
      { name: "Memory-Mapped Vectors", score: "88%" },
    ],
    knowledgeGaps: [
      { name: "Inverted File Index (IVF) Partitioning", severity: "Low", color: "text-amber-400" },
    ],
    defaultCandidateAnswer:
      "For low-latency vector search at scale, HNSW graphs offer ultra-fast sub-10ms query times by building multi-layer proximity graphs. I tune M=16..32 for link density and efSearch to balance recall vs query speed. When RAM is constrained at 100M+ vectors, combining IVF with Product Quantization compresses embedding dimensions while preserving search precision.",
  },
  {
    id: 3,
    topic: "Context Window Optimization",
    difficulty: 8,
    difficultyTrend: "Stable",
    tags: ["Semantic Chunking", "Lost-in-Middle", "Context Window", "RAG"],
    questionText:
      "How do you mitigate the 'Lost in the Middle' phenomenon when passing retrieved contexts to large context window LLMs? Compare semantic chunking strategies against sliding-window fixed token chunking.",
    confidence: 94,
    retrievedConcepts: [
      { name: "Semantic Chunking Boundaries", score: "98%" },
      { name: "Lost-in-the-Middle Mitigation", score: "96%" },
      { name: "Context Re-Ordering & Reranking", score: "94%" },
      { name: "Sliding Token Windows", score: "91%" },
      { name: "Attention Map Optimization", score: "89%" },
    ],
    knowledgeGaps: [
      { name: "Hierarchical Map-Reduce Summarization", severity: "Medium", color: "text-amber-400" },
    ],
    defaultCandidateAnswer:
      "To prevent LLMs from missing middle context, I place top-ranked retrieved passages at the beginning and end of the prompt (U-shaped contextual placement). Semantic chunking splits documents on paragraph boundaries using embedding distance, outperforming rigid 512-token sliding windows by avoiding broken sentences.",
  },
  {
    id: 4,
    topic: "RAG Evaluation & Guardrails",
    difficulty: 9,
    difficultyTrend: "Increasing",
    tags: ["Ragas", "Faithfulness", "Hallucination", "LLM-as-a-Judge", "Guardrails"],
    questionText:
      "Walk me through how you construct an automated, continuous evaluation pipeline for hallucination detection and groundedness in production. How do you guard against false positives in LLM-as-a-judge metrics?",
    confidence: 96,
    retrievedConcepts: [
      { name: "Ragas Faithfulness Metric", score: "99%" },
      { name: "LLM-as-a-Judge Prompting", score: "97%" },
      { name: "Groundedness Claim Extraction", score: "95%" },
      { name: "NeMo Guardrail Integration", score: "93%" },
      { name: "Synthetic Evaluation Benchmark", score: "90%" },
    ],
    knowledgeGaps: [
      { name: "Adversarial Red-Teaming for Guardrails", severity: "Low", color: "text-rose-400" },
    ],
    defaultCandidateAnswer:
      "I implement atomic claim extraction where an evaluator model breaks answers into claims and verifies them against reference contexts. To avoid LLM judge bias, we fix temperature to 0.0, use structured JSON outputs, and calibrate judge scores regularly against human-labeled evaluation sets.",
  },
  {
    id: 5,
    topic: "Agentic Reasoning & Tool Calling",
    difficulty: 10,
    difficultyTrend: "Mastered",
    tags: ["ReAct Agent", "Tool Calling", "State Machines", "Error Fallbacks"],
    questionText:
      "How do you prevent state loops and handle graceful fallback when an autonomous ReAct AI agent encounters unresolvable API failures or infinite tool execution loops during complex multi-step reasoning?",
    confidence: 98,
    retrievedConcepts: [
      { name: "ReAct Reasoning Loop", score: "99%" },
      { name: "Deterministic State Machine", score: "98%" },
      { name: "Tool Calling Verification", score: "96%" },
      { name: "Max Step Bound & Loop Detection", score: "95%" },
      { name: "Graceful Fallback Degrade", score: "93%" },
    ],
    knowledgeGaps: [],
    defaultCandidateAnswer:
      "I enforce loop detection by caching recent (action, observation) tuples and setting strict max execution depth. When a tool fails repeatedly, the agent state machine degrades gracefully to a fallback strategy or requests user clarification instead of looping indefinitely.",
  },
];

interface EvaluationOutcome {
  confidence: number;
  difficulty: number;
  difficultyTrend: "Increasing" | "Stable" | "Decreasing" | "Mastered";
  retrievedConcepts: Concept[];
  knowledgeGaps: Gap[];
}

function evaluateCandidateAnswer(
  answer: string,
  currentQuestion: MockQuestion
): EvaluationOutcome {
  const cleanAnswer = answer.trim().toLowerCase();
  
  // Topic keywords derived from tags & domain terminology
  const topicKeywords = [
    ...currentQuestion.tags.map((t) => t.toLowerCase()),
    currentQuestion.topic.toLowerCase(),
    "bm25", "vector", "search", "embedding", "embeddings", "retrieval", "hnsw", "chunk",
    "ragas", "faithfulness", "react", "agent", "tool", "context", "recall",
    "latency", "rrf", "fusion", "hallucination", "guardrail", "rank", "dense", "sparse"
  ];

  const matchedKeywords = topicKeywords.filter((kw) => cleanAnswer.includes(kw));
  const uniqueMatches = Array.from(new Set(matchedKeywords));
  const length = cleanAnswer.length;

  // 1. Irrelevant or extremely short answer (< 15 chars or no topic keywords)
  if (length < 15 || uniqueMatches.length === 0) {
    return {
      confidence: Math.min(38, Math.max(22, 20 + uniqueMatches.length * 4)),
      difficulty: Math.max(1, currentQuestion.difficulty - 1),
      difficultyTrend: "Decreasing",
      retrievedConcepts: currentQuestion.retrievedConcepts.map((c) => ({
        ...c,
        score: `${Math.floor(20 + Math.random() * 18)}%`,
      })),
      knowledgeGaps: [
        { name: `${currentQuestion.topic} Core Concepts`, severity: "High", color: "text-rose-400" },
        { name: "Domain Keyword Coverage", severity: "High", color: "text-rose-400" },
      ],
    };
  }

  // 2. Good answer (length >= 40 chars AND at least 2 distinct topic keywords)
  if (length >= 40 && uniqueMatches.length >= 2) {
    return {
      confidence: Math.min(98, 85 + Math.min(uniqueMatches.length * 2, 10)),
      difficulty: Math.min(10, currentQuestion.difficulty + 1),
      difficultyTrend: currentQuestion.difficulty >= 9 ? "Mastered" : "Increasing",
      retrievedConcepts: currentQuestion.retrievedConcepts.map((c, i) => ({
        ...c,
        score: `${Math.max(88, 98 - i * 2)}%`,
      })),
      knowledgeGaps: [],
    };
  }

  // 3. Weak answer (short 15-39 chars OR only 1 topic keyword match)
  return {
    confidence: Math.min(60, Math.max(40, 44 + uniqueMatches.length * 6)),
    difficulty: currentQuestion.difficulty,
    difficultyTrend: "Stable",
    retrievedConcepts: currentQuestion.retrievedConcepts.map((c, i) => ({
      ...c,
      score: `${Math.max(50, 75 - i * 5)}%`,
    })),
    knowledgeGaps: [
      { name: "Explanation Depth & Technical Trade-offs", severity: "Medium", color: "text-amber-400" },
      { name: "Edge Case & Optimization Details", severity: "Low", color: "text-amber-400" },
    ],
  };
}

export function InterviewRoom() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1478); // Starts at 00:24:38

  const initialQ = MOCK_QUESTIONS[0];

  // Dynamic evaluation metrics state
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(initialQ.difficulty);
  const [currentDifficultyTrend, setCurrentDifficultyTrend] = useState<"Increasing" | "Stable" | "Decreasing" | "Mastered">(initialQ.difficultyTrend);
  const [currentConfidence, setCurrentConfidence] = useState<number>(initialQ.confidence);
  const [currentConcepts, setCurrentConcepts] = useState<Concept[]>(initialQ.retrievedConcepts);
  const [currentGaps, setCurrentGaps] = useState<Gap[]>(initialQ.knowledgeGaps);

  // Live timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = MOCK_QUESTIONS[currentQuestionIndex];

  const handleSendAnswer = (answer: string) => {
    setSubmittedAnswer(answer);
    setIsAnalyzing(true);

    // Evaluate candidate answer dynamically
    const evaluation = evaluateCandidateAnswer(answer, currentQ);

    // Update Intelligence Panel metrics immediately
    setCurrentConfidence(evaluation.confidence);
    setCurrentDifficulty(evaluation.difficulty);
    setCurrentDifficultyTrend(evaluation.difficultyTrend);
    setCurrentConcepts(evaluation.retrievedConcepts);
    setCurrentGaps(evaluation.knowledgeGaps);

    setTimeout(() => {
      setIsAnalyzing(false);
      const nextIndex = (currentQuestionIndex + 1) % MOCK_QUESTIONS.length;
      setCurrentQuestionIndex(nextIndex);
      setSubmittedAnswer(undefined);
    }, 1800);
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#030106] p-3 font-sans text-white selection:bg-purple-500/30">
      <div className="flex h-full min-h-0 gap-3">
        {/* Fixed glass navigation rail. */}
        <div className="hidden w-[216px] shrink-0 lg:block [&>aside]:h-full [&>aside]:min-h-0 [&>aside]:w-full [&>aside]:rounded-2xl [&>aside]:border [&>aside]:border-purple-900/30">
          <Sidebar />
        </div>

        {/* Center interview surface and independent intelligence rail. */}
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 min-[1360px]:grid-cols-[minmax(0,1fr)_minmax(340px,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,420px)]">
          <main className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden [&>header]:mb-0">
            <InterviewHeader
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={MOCK_QUESTIONS.length}
              timerFormatted={formatTimer(timerSeconds)}
            />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.92fr)]">
              <section className="flex min-h-0 flex-col justify-start gap-3 overflow-y-auto pr-1">
                <QuestionCard
                  questionText={currentQ.questionText}
                  tags={currentQ.tags}
                  topic={currentQ.topic}
                  difficulty={currentDifficulty}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={MOCK_QUESTIONS.length}
                />
                <AnswerCard
                  initialAnswer={currentQ.defaultCandidateAnswer}
                  submittedAnswer={submittedAnswer}
                  onSendAnswer={handleSendAnswer}
                  isAnalyzing={isAnalyzing}
                />
              </section>

              <section className="flex min-h-[460px] min-w-0">
                <RobotViewer />
              </section>
            </div>

            <AnalysisBar isAnalyzing={isAnalyzing} />
          </main>

          <div className="hidden min-h-0 overflow-y-auto pr-1 min-[1360px]:block [&>aside]:w-full">
            <IntelligencePanel
              difficulty={currentDifficulty}
              difficultyTrend={currentDifficultyTrend}
              confidence={currentConfidence}
              concepts={currentConcepts}
              gaps={currentGaps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
