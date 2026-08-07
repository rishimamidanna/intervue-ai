# INTERVUE

> **Every Answer Changes the Interview.**

[![Built for Hackathon](https://img.shields.io/badge/Built%20for-AI%20Hackathon-7c3aed?style=flat-square)](.)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

---

## Problem Statement

Candidates who complete intensive AI engineering cohorts need a way to assess
their readiness before job interviews. Generic mock interviews don't account for
what each candidate specifically learned, struggled with, or skipped.

## Solution

**INTERVUE** is an Adaptive AI Technical Interview Agent that:

- Reads the candidate's cohort history and builds a **Candidate Knowledge Twin**
- Generates personalised technical questions **one at a time**, adapting difficulty dynamically
- Evaluates each answer across 5 dimensions using an AI evaluator
- Tracks contradictions and claims across the entire session
- Produces a structured **Interview DNA** report with an evidence-based recovery plan

---

## Status

| Feature | Status |
|---------|--------|
| Project scaffold & folder structure | ✅ Complete |
| Shared TypeScript contracts | ✅ Complete |
| Zod validation schemas | ✅ Complete |
| Deterministic scoring utility | ✅ Complete |
| AI module interfaces (stubs) | ✅ Scaffolded |
| Prompt file structure | ✅ Scaffolded |
| Backend server layer (stubs) | ✅ Scaffolded |
| API routes (stubs) | ✅ Scaffolded |
| Frontend UI components (stubs) | ✅ Scaffolded |
| LLM integration | 🔲 Planned |
| Full 3D Knowledge Core | 🔲 Planned |
| Voice input/output | 🔲 Planned |
| Real curriculum & candidate data | 🔲 Pending hackathon files |
| Official hackathon API contract | 🔲 Pending Technical Specification |

---

## Core Architecture

```
Curriculum JSON + Candidate Profile
         ↓
Candidate Intelligence Engine
         ↓
Candidate Knowledge Twin
         ↓
Interview Strategist
         ↓
Adaptive AI Interviewer ←─────────────────┐
         ↓                                │
Candidate Answer                          │
         ↓                                │
Answer Evaluation Engine                  │
         ↓                                │
Decision Engine → Update Knowledge Twin   │
         ↓                                │
Next-Best-Question ───────────────────────┘
         ↓ (loop ends when requirements met)
Final Feedback Engine
         ↓
Interview DNA + Personalised Recovery Plan
```

See [`docs/architecture.md`](docs/architecture.md) for the full diagram.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Animation | Framer Motion |
| 3D Visualisation | React Three Fiber + Three.js |
| Deployment | Vercel |
| Package Manager | npm |

---

## Folder Structure

```
intervue-ai/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   ├── interview/page.tsx  # Interview Chamber
│   ├── report/page.tsx     # Interview DNA Report
│   └── api/interview/      # Internal API routes
├── components/
│   ├── ui/                 # Base UI components
│   ├── landing/            # Landing page components
│   ├── interview/          # Interview session components
│   ├── knowledge/          # 3D Knowledge Twin visualisation
│   └── report/             # Interview DNA report panels
├── ai/                     # AI pipeline modules (stubs)
├── prompts/                # LLM prompt constants (stubs)
├── server/                 # Backend services and session management
├── lib/                    # Shared utilities (scoring, env, validation)
├── schemas/                # Zod validation schemas
├── types/                  # Shared TypeScript contracts
├── hooks/                  # React hooks
├── data/                   # Curriculum and candidate JSON
├── tests/                  # Test scaffolds
├── docs/                   # Architecture and API documentation
└── public/                 # Static assets
```

---

## Team Responsibility Split

| Member | Role | Branch | Owns |
|--------|------|--------|------|
| Member 1 | Frontend / 3D Experience | `feature/frontend` | `components/`, `hooks/`, `app/` pages |
| Member 2 | Backend / API | `feature/backend` | `server/`, `app/api/`, `data/`, `lib/` |
| Member 3 | AI / Prompt Engineering | `feature/ai-engine` | `ai/`, `prompts/`, `schemas/` |
| All | Shared types | Coordinate via PR | `types/` |

---

## Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd intervue-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in LLM_API_KEY and other values in .env.local

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000
```

---

## Git Branch Strategy

```bash
# Create your feature branch
git checkout main
git pull origin main
git checkout -b feature/frontend   # Member 1
git checkout -b feature/backend    # Member 2
git checkout -b feature/ai-engine  # Member 3
```

**Branches:**
- `main` — Always buildable; merged via PRs only
- `feature/frontend` — Member 1's work
- `feature/backend` — Member 2's work
- `feature/ai-engine` — Member 3's work

See [`docs/team-workflow.md`](docs/team-workflow.md) for full workflow rules.

---

## Deployment

Deploy to **Vercel**:

1. Connect this repository to Vercel
2. Set environment variables in the Vercel dashboard (from `.env.example`)
3. Deploy from `main`

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — Full system architecture
- [`docs/api-contract.md`](docs/api-contract.md) — Internal and hackathon API contracts
- [`docs/scoring.md`](docs/scoring.md) — Scoring formula and calibration
- [`docs/team-workflow.md`](docs/team-workflow.md) — Git workflow and team rules

---

> Built for an AI Technical Interview Hackathon.
> This project is being actively developed — see status table above for current state.
