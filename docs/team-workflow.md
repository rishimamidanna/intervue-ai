# INTERVUE — Team Workflow Guide

## Team Structure

| Member | Role | Branch | Primary Directories |
|--------|------|--------|---------------------|
| **Member 1** | Frontend / 3D Experience | `feature/frontend` | `app/`, `components/`, `hooks/`, `public/` |
| **Member 2** | Backend / API / System | `feature/backend` | `app/api/`, `server/`, `data/`, `lib/` |
| **Member 3** | AI / Prompt Engineering | `feature/ai-engine` | `ai/`, `prompts/`, `schemas/` |
| **All** | Shared contracts | Coordinate via PR | `types/` |

---

## Branch Strategy

```
main
├── feature/frontend    (Member 1)
├── feature/backend     (Member 2)
└── feature/ai-engine   (Member 3)
```

### Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd intervue-ai

# Install dependencies
npm install

# Create your feature branch
git checkout -b feature/frontend   # Member 1
git checkout -b feature/backend    # Member 2
git checkout -b feature/ai-engine  # Member 3

# Start the development server
npm run dev
```

---

## Team Rules

### 1. Never develop directly on `main`
All work happens on feature branches. `main` is always in a buildable, deployable state.

### 2. Pull latest `main` before starting major work
```bash
git fetch origin
git merge origin/main
```

### 3. Commit small working changes
Prefer frequent small commits over large batches. Each commit should compile.

```bash
git add -p  # Stage specific changes, not everything
git commit -m "feat(ai): implement answer evaluator LLM call"
```

### 4. Push only to your feature branch
```bash
git push origin feature/frontend   # Member 1 only
git push origin feature/backend    # Member 2 only
git push origin feature/ai-engine  # Member 3 only
```

### 5. Use pull requests to merge into `main`
Open a PR when a feature is complete and tested. At least one other team member should review before merging.

### 6. Avoid modifying another member's owned directories
Check the ownership table above. If you need to make a change in another member's area, communicate first.

### 7. Coordinate before modifying shared types
Changes to `types/` affect all three members. Announce in the team chat before modifying type contracts, and merge to `main` promptly so everyone can rebase.

### 8. Merge working code into `main` frequently
Avoid long-running feature branches. Merge early and often to prevent large conflict resolution sessions.

### 9. Never commit API keys or secrets
All secrets live in `.env.local` (git-ignored). Use `.env.example` as the template.

```bash
# Safe
cp .env.example .env.local
# Then fill in your real values in .env.local — NEVER commit this file
```

### 10. Test before creating a pull request
Run these checks locally before opening a PR:

```bash
npx tsc --noEmit    # TypeScript check
npm run lint        # ESLint check
npm run build       # Production build
```

---

## Commit Message Convention

Use conventional commits for clarity:

```
feat(ai): implement evaluateAnswer LLM call
fix(api): handle missing sessionId in answer route
chore(types): add MissionAttempt fields from real data
docs(arch): update architecture diagram
refactor(server): extract session validation helper
```

---

## Conflict Prevention Strategy

The directory ownership structure is designed to **minimise git conflicts**:

- **`types/`** is the only true shared area. All members read it; changes to it are PRd to `main` immediately.
- **`components/`** is owned by Member 1 — Members 2 and 3 do not touch it.
- **`ai/` and `prompts/`** are owned by Member 3 — Members 1 and 2 do not touch them.
- **`server/` and `app/api/`** are owned by Member 2 — Members 1 and 3 do not touch them.

If you need cross-boundary changes, discuss first and coordinate merges.

---

## Daily Sync Checklist (Hackathon Mode)

- [ ] Pull latest `main` at the start of your session
- [ ] Announce what you're working on in the team chat
- [ ] Push to your feature branch every 30–60 minutes
- [ ] Communicate any type contract changes immediately
- [ ] Open PRs for completed features; don't let branches drift too far
