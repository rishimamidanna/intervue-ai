# INTERVUE — System Architecture

> **Tagline:** Every Answer Changes the Interview.

## Overview

INTERVUE is an Adaptive AI Technical Interview Agent that combines a live
Candidate Knowledge Twin, an adaptive question generation pipeline, and a
structured feedback engine to produce a personalised "Interview DNA" report.

---

## System Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │         INPUTS                       │
                    │  Curriculum JSON + Candidate Profile │
                    └────────────────┬────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │    Candidate Intelligence Engine   │
                    │    (ai/candidate-profiler.ts)      │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │      Candidate Knowledge Twin      │
                    │      (ai/knowledge-twin.ts)        │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │        Interview Strategist        │
                    │      (ai/interview-planner.ts)     │
                    └────────────────┬───────────────────┘
                                     │
                         ┌───────────┴───────────┐
                         │   INTERVIEW LOOP       │
                         │                        │
                         ▼                        │
          ┌──────────────────────────┐            │
          │   Adaptive AI Interviewer│            │
          │  (ai/question-generator) │            │
          └──────────┬───────────────┘            │
                     │                            │
                     ▼                            │
          ┌──────────────────────┐                │
          │   Candidate Answer   │                │
          └──────────┬───────────┘                │
                     │                            │
                     ▼                            │
          ┌──────────────────────────┐            │
          │  Answer Evaluation Engine│            │
          │  (ai/answer-evaluator)   │            │
          └──────────┬───────────────┘            │
                     │                            │
                     ▼                            │
          ┌──────────────────────────┐            │
          │     Decision Engine      │            │
          │  (ai/decision-engine)    │            │
          └──────────┬───────────────┘            │
                     │                            │
                     ▼                            │
          ┌──────────────────────────┐            │
          │  Update Knowledge Twin   │            │
          │  (ai/knowledge-twin)     │            │
          └──────────┬───────────────┘            │
                     │                            │
                     ▼                            │
          ┌──────────────────────────┐            │
          │    Next-Best-Question    ├────────────┘
          │  (back to Interviewer)   │
          └──────────┬───────────────┘
                     │ (loop ends when requirements met)
                     ▼
          ┌──────────────────────────┐
          │    Interview Complete    │
          └──────────┬───────────────┘
                     │
                     ▼
          ┌──────────────────────────────────────────────────┐
          │             Final Feedback Engine                │
          │             (ai/feedback-generator)              │
          │                                                  │
          │  Interview DNA + Personalised Recovery Plan      │
          └──────────────────────────────────────────────────┘
```

---

## Core Principle

> **"Every Answer Changes the Interview."**

No two interviews are identical. The AI adapts question difficulty, topic focus,
and follow-up strategy in real-time based on the candidate's demonstrated knowledge
level as captured in the Candidate Knowledge Twin.

---

## Module Responsibilities

| Module | File | Owner |
|--------|------|-------|
| Candidate Profiler | `ai/candidate-profiler.ts` | Member 3 |
| Knowledge Twin | `ai/knowledge-twin.ts` | Member 3 |
| Interview Planner | `ai/interview-planner.ts` | Member 3 |
| Question Generator | `ai/question-generator.ts` | Member 3 |
| Answer Evaluator | `ai/answer-evaluator.ts` | Member 3 |
| Decision Engine | `ai/decision-engine.ts` | Member 3 |
| State Updater | `ai/state-updater.ts` | Member 3 |
| Contradiction Detector | `ai/contradiction-detector.ts` | Member 3 |
| Feedback Generator | `ai/feedback-generator.ts` | Member 3 |
| Interview Controller | `server/interview-controller.ts` | Member 2 |
| Session Manager | `server/session-manager.ts` | Member 2 |
| Interview State | `server/interview-state.ts` | Member 2 |
| Curriculum Service | `server/curriculum-service.ts` | Member 2 |
| Candidate Service | `server/candidate-service.ts` | Member 2 |
| API Routes | `app/api/**` | Member 2 |
| UI Components | `components/**` | Member 1 |
| 3D Experience | `components/knowledge/**` | Member 1 |
| Shared Types | `types/**` | All (coordinate) |

---

## Interview Requirements

- Minimum **8 questions** per session
- Minimum **4 curriculum days** covered per session
- Questions generated **ONE AT A TIME**
- Difficulty adapts dynamically (1–5 scale)
- Contradiction detection across all turns
- Final score calculated **deterministically** (see `lib/scoring.ts`)

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Animation**: Framer Motion
- **3D**: React Three Fiber + Three.js
- **Deployment**: Vercel
