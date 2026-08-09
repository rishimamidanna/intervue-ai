# Milestone 3.2 — Curriculum Concept Extraction

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 3.1 implementation first.

Reuse existing curriculum structures.
Do not create duplicate modules.

ONLY modify:
- curriculum processing
- curriculum types/schemas
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Create concept-level understanding from normalized curriculum.

Implement:

- concept extraction
- keyword mapping
- concept metadata preservation

Each concept should preserve:

- concept name
- related keywords
- source day
- source topic

Requirements:

- use actual curriculum data
- deterministic logic
- strongly typed
- modular
- production-ready

Do NOT implement:

- embeddings
- vector database
- retrieval
- LLM calls

Do not lose original curriculum information.

Before finishing:
run git status.

Return:

1. Files changed
2. Implementation summary
3. Example concept output
4. Manual verification steps
5. Blockers

STOP after this submilestone.

## Milestone 3.3 — Curriculum Metadata Enrichment

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 3.2 implementation first.

Reuse existing curriculum structures.
Do not create duplicate modules.

ONLY modify:
- curriculum processing
- curriculum types/schemas
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Add retrieval-ready metadata to curriculum concepts.

Input:
Concept-aware curriculum data.

Implement metadata enrichment:

Add useful metadata such as:

- difficulty level
- category/topic grouping
- keywords
- related concepts/topics

Preserve:

- day
- original title
- concepts
- source mapping

Requirements:

- deterministic rules only
- use actual curriculum information
- strongly typed
- modular
- production-ready

Do NOT implement:

- embeddings
- vector database
- chunking
- retrieval
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Implementation summary
3. Example enriched output
4. Manual verification steps
5. Blockers

STOP after this submilestone.
check whether Example curriculum item should have:
day              ✅
title/topic      ✅
concepts         ✅
keywords         ✅
difficulty       ✅
category         ✅ confirm Confirm:
❌ No fake topics
❌ No random difficulty values
❌ No information loss dont make any changes

## Milestone 4.1 — Chunking Architecture

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect existing Milestone 3.3 curriculum enrichment first.

Reuse existing curriculum structures.

ONLY modify:
- chunking modules
- RAG data types
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Create the architecture required for curriculum-aware semantic chunks.

Implement:

- Chunk Type definition
- Chunk schema validation
- Chunk metadata structure

Each chunk must support:

- chunkId
- day
- topic
- concept
- content
- metadata

Metadata should preserve:

- keywords
- category
- difficulty
- source reference

Requirements:

- strongly typed
- modular
- deterministic
- production-ready

Do NOT implement:

- embeddings
- vector database
- retrieval
- ranking
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Implementation summary
3. Chunk structure example
4. Manual verification steps
5. Blockers

STOP after this submilestone.

## Milestone 4.2 — Curriculum-Aware Semantic Chunk Generation

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 4.1 chunk architecture first.

Only modify:
- chunking service
- RAG data modules
- Member 2 files

Do not modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Generate meaningful curriculum-aware chunks.

Input:
Enriched curriculum concepts.

Implement:

- semantic chunk generation
- concept-based splitting
- metadata preservation

Chunk boundaries should follow:

1. Day boundary
2. Topic boundary
3. Concept boundary

Avoid:
- fixed character splitting
- random text splitting

Each chunk must contain:

- chunkId
- day
- topic
- concept
- content
- metadata
- keywords

Requirements:

- deterministic
- strongly typed
- modular
- production-ready

Prepare chunks for future:
- embeddings
- vector search
- BM25 keyword search

Do NOT implement:

- embeddings
- vector database
- BM25
- retrieval
- ranking
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Implementation summary
3. Example chunk output
4. Manual verification steps
5. Blockers

STOP after this submilestone.

## Milestone 4.3 — Chunk Quality Validation

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 4.2 chunk generation first.

Reuse existing chunk architecture.

ONLY modify:
- chunk validation logic
- RAG data modules
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Create a quality validation layer for generated chunks.

Implement validation for:

1. Required fields:
- chunkId
- day
- topic
- concept
- content
- metadata

2. Content quality:
- reject empty content
- reject invalid chunks

3. Metadata quality:
- verify keywords
- verify category
- verify source information

4. Duplicate detection:
- duplicate chunk IDs
- duplicate content

Output should provide:

- validation status
- total chunks checked
- invalid chunks
- duplicate count
- validation errors

Requirements:

- deterministic
- strongly typed
- modular
- production-ready

Do NOT implement:

- embeddings
- vector database
- BM25
- retrieval
- ranking
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Implementation summary
3. Validation output example
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 5.1 — Embedding Architecture

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 4 implementation first.

Reuse existing RAG structures.

ONLY modify:
- embedding modules
- RAG types/schemas
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Create a clean embedding architecture.

Implement:

- embedding types
- embedding service abstraction
- embedding configuration structure

The architecture should support:

Chunk
    ↓
Embedding Service
    ↓
Vector Representation

Requirements:

- strongly typed
- modular
- replaceable embedding provider
- production-ready

Do NOT implement yet:

- actual model download
- vector database
- retrieval
- ranking
- BM25
- LLM calls

Keep the design ready for future embedding generation.

Before finishing:
run git status.

Return:

1. Files changed
2. Implementation summary
3. Architecture explanation
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 5.2 — Embedding Generation

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 5.1 embedding architecture first.

Only modify:
- embedding modules
- RAG data modules
- Member 2 files

Do not modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Generate embeddings for validated curriculum chunks.

Implement:

Chunk
   ↓
Embedding Service
   ↓
Embedding Vector

Requirements:

- connect embedding service to a real embedding provider
- generate vectors from chunk content
- preserve chunk metadata
- return strongly typed embedding objects

Embedding output must contain:

- chunkId
- original text/content
- embedding vector
- metadata reference

Quality requirements:

- deterministic
- modular
- production-ready
- provider can be replaced later

Do NOT implement:

- vector database storage
- retrieval
- ranking
- BM25
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Embedding provider used
3. Example embedding output
4. Manual verification steps
5. Blockers

STOP after this submilestone.## Manual Test — Embedding Generation Verification

Role: Member 2 (Data + RAG)

Purpose:
Verify that the embedding generation pipeline works correctly.

DO NOT modify production code.

ONLY create a temporary test file:
- test-embedding-generation.ts

First inspect:
- server/embedding-service.ts
- types/embedding.ts
- schemas related to embeddings

Find the correct exported embedding function.

Create a small manual test that:

1. Loads one existing validated chunk.
2. Sends the chunk content to the embedding service.
3. Generates an embedding vector.
4. Prints the result.

The test output must show:

- chunkId
- original text/content
- embedding vector length
- first few vector values
- metadata reference

Example output:

{
 chunkId: "day10-semantic-search",
 text: "Semantic search uses embeddings...",
 vectorDimension: 384,
 sampleValues: [
   0.021,
   -0.145,
   0.763
 ],
 metadata: {
   topic: "Retrieval"
 }
}

Verification requirements:

Check:

- embedding is generated successfully
- vector is an array of numbers
- vector length is greater than 0
- same input produces consistent output
- chunk metadata is preserved

Do NOT:

- modify embedding service
- add vector database
- add retrieval
- add BM25
- add API routes

After testing:

Return:
1. Test file created
2. Command used to run test
3. Sample output
4. Verification result

Delete the temporary test file after verification.
STOP.

## Milestone 5.3 — Vector Storage Architecture

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect Milestone 5.2 embedding implementation first.

Reuse existing embedding and chunk structures.

ONLY modify:
- vector storage modules
- RAG data modules
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Create a vector storage layer for generated embeddings.

Implement:

Embedding Object
        ↓
Vector Storage Service
        ↓
Persistent Vector Database

The storage layer must support:

- storing embeddings
- storing original chunk content
- storing metadata
- retrieving stored records by id

Each stored record should contain:

- chunkId
- embedding vector
- content
- metadata

Requirements:

- modular storage abstraction
- strongly typed
- production-ready
- replaceable vector database layer

Prepare for future:
- semantic search
- similarity retrieval
- hybrid retrieval

Do NOT implement:

- similarity search
- ranking
- BM25
- retrieval logic
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Storage design explanation
3. Example stored vector record
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 5.3 — Manual Vector Storage Verification

Purpose:
Verify that embeddings can be stored and retrieved correctly.

DO NOT modify production files.

Only create:
test-vector-storage.ts

First inspect:
- server/vector-storage-service.ts
- types/rag.ts

Find the correct exported storage functions.

Create a manual test that:

1. Creates a sample embedding record.
2. Stores it using vector storage service.
3. Retrieves it using the storage service.
4. Compares original and retrieved data.

Test record:

{
 chunkId:"test-semantic-search",
 embedding:[
   0.1,
   0.2,
   0.3
 ],
 content:"Semantic search uses embeddings",
 metadata:{
   topic:"Retrieval"
 }
}

Verify:

- record is stored
- record is retrieved
- embedding vector is preserved
- metadata is preserved
- content is preserved

Output:

{
 stored:true,
 retrieved:true,
 embeddingPreserved:true,
 metadataPreserved:true
}

Do not add:
- retrieval
- similarity search
- BM25
- ranking

After verification:
delete the temporary test file.
STOP.
## Milestone 6.1 — Retrieval Architecture

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect previous RAG pipeline first.

Reuse:
- chunk structures
- embedding structures
- vector storage structures

ONLY modify:
- retrieval modules
- RAG types/schemas
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Create a clean retrieval architecture.

Implement:

Retrieval Layer:

Query
  ↓
Retrieval Service
  ↓
Retrieval Providers
  ↓
Retrieved Chunks


Create:

- retrieval types
- retrieval result structure
- retrieval service abstraction


Retrieval result should support:

- chunkId
- content
- metadata
- score
- retrieval source


Support future providers:

- semantic retrieval
- BM25 retrieval
- hybrid retrieval


Requirements:

- strongly typed
- modular
- production-ready
- easy to test


Do NOT implement:

- actual similarity search
- BM25 scoring
- ranking
- LLM calls


Before finishing:
run git status.

Return:

1. Files changed
2. Architecture explanation
3. Retrieval result example
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 6.2 — Semantic Retrieval

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect:

- embedding generation
- vector storage
- retrieval architecture

Reuse existing modules.

ONLY modify:
- semantic retrieval modules
- RAG retrieval files
- Member 2 files

DO NOT modify:
- frontend
- UI
- API routes
- interview agent
- other member modules

Goal:
Implement semantic retrieval using embeddings.

Implement:

Query
 ↓
Query Embedding
 ↓
Vector Similarity Search
 ↓
Top-K Relevant Chunks


Requirements:

- generate query embeddings
- compare with stored vectors
- calculate similarity score
- return ranked results

Each result must contain:

- chunkId
- content
- score
- metadata


Requirements:

- strongly typed
- modular
- production-ready
- reusable retrieval service

Do NOT implement:

- BM25
- hybrid retrieval
- ranking fusion
- LLM calls

Before finishing:
run git status.

Return:

1. Files changed
2. Retrieval flow explanation
3. Example retrieval output
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 6.3 — BM25 Keyword Retrieval

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect:

- retrieval architecture
- semantic retrieval provider
- chunk structures

Reuse existing retrieval interfaces.

ONLY modify:

- BM25 retrieval modules
- retrieval types
- Member 2 files

DO NOT modify:

- frontend
- UI
- API routes
- interview agent
- other member modules


Goal:

Replace mock BM25 retrieval with a real keyword retrieval system.


Implement:

Documents/Chunks
        ↓
Keyword Index
        ↓
BM25 Scoring
        ↓
Top-K Results


Requirements:

- tokenize chunk content
- build searchable keyword representation
- calculate BM25 relevance score
- return ranked results


Each result must contain:

- chunkId
- content
- score
- metadata
- retrieval source


Reuse:

IRetrievalProvider interface


Requirements:

- strongly typed
- modular
- production-ready
- easy to combine with semantic retrieval later


Do NOT implement:

- hybrid retrieval
- score fusion
- candidate ranking
- LLM calls


Before finishing:

run git status.


Return:

1. Files changed
2. BM25 implementation explanation
3. Example retrieval output
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 6.4 — Hybrid Retrieval Fusion

Role: Member 2 (Data + RAG)

Branch: feature/data-rag

Inspect:

- semantic retrieval provider
- BM25 retrieval provider
- retrieval service architecture

Reuse existing retrieval interfaces.

ONLY modify:

- hybrid retrieval modules
- retrieval types
- Member 2 files

DO NOT modify:

- frontend
- UI
- API routes
- interview agent
- other member modules


Goal:

Combine semantic retrieval and BM25 retrieval into a single ranked retrieval system.


Implement:

Query

   ↓

Semantic Retrieval
+
BM25 Retrieval

   ↓

Score Fusion

   ↓

Hybrid Ranked Results


Requirements:

Implement:

- semantic result collection
- BM25 result collection
- score normalization
- weighted score combination
- duplicate chunk removal
- final ranking


Each result must contain:

- chunkId
- content
- final score
- metadata
- retrieval sources


Use:

Semantic weight: 0.7

BM25 weight: 0.3


Requirements:

- strongly typed
- modular
- production-ready
- configurable weights


Do NOT implement:

- candidate-aware ranking
- LLM calls
- UI changes


Before finishing:

run git status.


Return:

1. Files changed
2. Hybrid retrieval explanation
3. Example output
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 6.5 — Candidate-Aware Retrieval Ranking

Role: Member 2 (Data + RAG)

Branch:
feature/data-rag

Inspect:

- hybrid retrieval implementation
- candidate data structures
- retrieval result types

Reuse existing retrieval pipeline.

ONLY modify:

- retrieval ranking modules
- retrieval types
- Member 2 files


Goal:

Make retrieval personalized using candidate information.


Implement:

Hybrid Retrieval Results

+

Candidate Profile

        ↓

Candidate Relevance Scoring

        ↓

Final Ranked Results


Candidate relevance should consider:

- weak areas
- experience level
- previous performance if available


Scoring:

Final Score =

0.7 * Hybrid Retrieval Score

+

0.3 * Candidate Relevance Score


Each result should contain:

- chunkId
- content
- hybridScore
- candidateScore
- finalScore
- metadata


Requirements:

- strongly typed
- modular
- production-ready
- configurable weights


Do NOT modify:

- frontend
- UI
- API routes
- interview logic
- LLM code


Before finishing:

run git status.


Return:

1. Files changed
2. Ranking logic explanation
3. Example personalized output
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 7.1 — Retrieved Context Builder

Role:
Member 2 (Data + RAG)

Branch:
feature/data-rag


Inspect:

- retrieval result types
- hybrid retrieval output
- candidate-aware ranking output


Goal:

Convert retrieved chunks into clean LLM-ready context.


Implement:

Retrieved Results

        ↓

Context Builder

        ↓

Formatted Context


Requirements:

Create a context builder that:

- accepts ranked retrieval results
- sorts chunks by relevance score
- removes duplicate chunks
- preserves metadata
- tracks source references
- limits context size


Output should contain:

- formatted context string
- source list
- chunk metadata


Example output:

{
 "context":
 "
 Source 1:
 Vector databases store embeddings.

 Source 2:
 Semantic search uses similarity.
 ",

 "sources":[
   {
    "chunkId":"chunk-101",
    "metadata":{}
   }
 ]
}


Requirements:

- strongly typed
- modular
- production-ready
- reusable by LLM generation layer


Do NOT implement:

- prompt generation
- LLM calls
- retrieval logic changes
- UI changes


Before finishing:

run git status.


Return:

1. Files changed
2. Context builder explanation
3. Example output
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 7.2 — Prompt Context Builder

Role:
Member 2 (Data + RAG)

Branch:
feature/data-rag


Inspect:

- context builder output
- candidate profile types
- retrieval result structures


Goal:

Create an LLM-ready prompt construction layer.


Implement:

Candidate Data
+
Question
+
Retrieved Context

        ↓

Prompt Context Builder

        ↓

Structured LLM Input


Requirements:

Generate:

- system prompt
- user prompt
- context section
- candidate section
- question section


Prompt should instruct the LLM:

- use provided context
- avoid hallucination
- answer based on retrieved knowledge
- adapt difficulty based on candidate profile


Output:

{
 "systemPrompt":"",
 "userPrompt":"",
 "metadata":{
   "sources":[]
 }
}


Requirements:

- strongly typed
- modular
- reusable
- production-ready


Do NOT implement:

- LLM calls
- API routes
- UI changes
- retrieval changes


Before finishing:

run git status.


Return:

1. Files changed
2. Prompt builder explanation
3. Example generated prompt
4. Manual verification steps
5. Blockers

STOP after this submilestone.
## Milestone 7.3 — Retrieval Explainability Layer

Role:
Member 2 (Data + RAG)

Branch:
feature/data-rag


Goal:

Add transparency to retrieval decisions.


Inspect:

- hybrid retrieval output
- candidate-aware ranking
- context builder


Implement:

Retrieval Result

        ↓

Explainability Layer

        ↓

Detailed Retrieval Metadata


Add:

- semantic score
- BM25 score
- candidate relevance score
- final score
- ranking reasons


Each result should contain:

{
 chunkId,
 content,
 scores:{
   semantic,
   bm25,
   candidate,
   final
 },
 reasons:[]
}


Reasons should explain:

- keyword match
- semantic similarity
- candidate relevance


Do NOT modify:

- UI
- LLM generation
- API routes


Return:

1. Files changed
2. Example explanation output
3. Verification steps

STOP.
# INTERVUE AI - Complete AI Development Prompts

# PART 1: INITIAL IDEA → ARCHITECTURE → PLANNING
## Prompts 1 - 25

---

# Prompt 1: Analyze AI Hackathon Problem Statement

```text
You are a senior AI product architect and hackathon mentor.

Analyze this AI hackathon problem statement deeply.

Understand:

- The actual user problem
- Target users
- Required AI capabilities
- Expected system behavior
- Technical challenges
- Possible judging criteria

Generate:

1. Problem understanding
2. Existing solution limitations
3. Unique opportunity
4. Possible AI-powered solutions
5. Features that can differentiate the project
6. Technical complexity required for a winning solution

Do not suggest a simple chatbot.

Think like a startup founder building a production-grade AI product.
```

---

# Prompt 2: Generate Innovative AI Product Ideas

```text
Generate innovative AI product ideas for this problem statement.

Requirements:

- Must use AI meaningfully
- Must solve a real problem
- Must have strong demo impact
- Must be technically impressive
- Must be possible within a hackathon timeline

For every idea provide:

- Product name
- Problem solved
- AI innovation
- User workflow
- Technical architecture
- Why judges would remember it

Rank ideas based on:

1. Innovation
2. Technical depth
3. User impact
4. Business potential
5. Hackathon winning probability
```

---

# Prompt 3: Improve Initial Project Idea

```text
Take this initial AI project idea and transform it into a unique hackathon-winning product.

Improve:

- Product vision
- AI capabilities
- User experience
- Technical architecture
- Scalability
- Market potential

Add advanced AI concepts:

- AI agents
- RAG
- Memory systems
- Personalization
- Explainable AI
- Adaptive decision making

The final result should feel like a real startup product.
```

---

# Prompt 4: Create Product Vision

```text
Create the complete product vision for an Adaptive AI Interview Platform.

Define:

- Product name
- Mission
- Vision
- Target users
- Core problem
- Solution
- Key differentiators
- Future roadmap

Make it sound like a Silicon Valley AI startup pitch.
```

---

# Prompt 5: Analyze Existing Solutions

```text
Research and analyze existing AI interview platforms.

Identify:

- Their features
- Their limitations
- Missing opportunities
- User complaints
- Technical gaps

Then design how our product can be different.

Focus on:

- Better personalization
- Better AI reasoning
- Better adaptation
- Better explainability
```

---

# Prompt 6: Create Unique Differentiators

```text
Design unique differentiating features for an Adaptive AI Interview Agent.

Generate at least 15 features.

For each feature explain:

- What it does
- Why it matters
- How AI enables it
- Why judges would value it

Prioritize features that are difficult for competitors to copy.
```

---

# Prompt 7: Define Core AI Innovation

```text
Explain the core AI innovation behind this project.

Answer:

Why are traditional interviews limited?

How does adaptive AI improve interviews?

How does AI memory improve decisions?

How does RAG improve accuracy?

How does explainability build trust?

Create a strong technical story.
```

---

# Prompt 8: Create User Journey

```text
Design the complete user journey for INTERVUE AI.

Flow:

User enters platform
↓
Candidate profile analysis
↓
Interview preparation
↓
AI interview
↓
Answer evaluation
↓
Difficulty adaptation
↓
Knowledge update
↓
Analytics
↓
Final report


For every step explain:

- User action
- AI action
- Data generated
- Output shown
```

---

# Prompt 9: Define MVP Scope

```text
Define the MVP scope for this Adaptive AI Interview Platform.

Separate:

Must Have:
Features required for hackathon success

Should Have:
Features that improve winning chances

Nice To Have:
Future improvements

Optimize for a 48-hour hackathon.
```

---

# Prompt 10: Create Winning Hackathon Strategy

```text
Act as a hackathon winner mentor.

Create a strategy for making this AI project stand out.

Include:

- Product positioning
- Demo strategy
- Technical highlights
- Judge talking points
- Features to prioritize
- Mistakes to avoid
```

---

# Prompt 11: Design Agentic AI Architecture

```text
Design an agentic AI architecture for this interview system.

Include:

1. Candidate Intelligence Agent
2. Interview Planner Agent
3. Question Generation Agent
4. Evaluation Agent
5. Decision Agent
6. Memory Agent


For each agent define:

- Responsibility
- Input
- Output
- Communication flow
```

---

# Prompt 12: Define System Modules

```text
Break INTERVUE AI into independent modules.

Create modules for:

- Frontend
- Backend
- AI Engine
- RAG System
- Memory System
- Analytics
- Reporting

For each module provide:

- Purpose
- Responsibilities
- Required files
- Data flow
```

---

# Prompt 13: Create Technical Architecture

```text
Create a production-level architecture diagram for INTERVUE AI.

Include:

Frontend
↓
API Layer
↓
Backend Services
↓
AI Agents
↓
RAG Pipeline
↓
Database / Memory


Show:

- Data flow
- Components
- Communication between services
- External dependencies
```

---

# Prompt 14: Generate Excalidraw Architecture Prompt

```text
Create an Excalidraw prompt for generating the INTERVUE AI architecture diagram.

Requirements:

- Clean professional layout
- Black and white style
- Clear arrows
- Technical labels
- Easy for team explanation

Include:

Frontend
Backend
AI Engine
RAG
Knowledge Twin
Analytics
Report System
```

---

# Prompt 15: Define Technology Stack

```text
Choose the best technology stack for INTERVUE AI.

Requirements:

- Fast development
- Production quality
- Easy deployment
- AI integration support

Recommend:

Frontend:
Backend:
Database:
AI Framework:
RAG Framework:
Vector Storage:
Deployment:

Explain each choice.
```

---

# Prompt 16: Define Database and State Design

```text
Design the data model for INTERVUE AI.

Include:

Candidate Profile

Interview Session

Question History

Answer Evaluation

Knowledge Twin

RAG Retrieval Data

Analytics Data

Report Data

Define:

- Fields
- Relationships
- Data flow
```

---

# Prompt 17: Define API Architecture

```text
Design API architecture for INTERVUE AI.

Create endpoints for:

- Starting interview
- Submitting answers
- Generating questions
- Updating knowledge state
- Analytics
- Reports

For each endpoint define:

Method
Route
Input
Output
Purpose
```

---

# Prompt 18: Design AI Interview Flow

```text
Design the complete AI interview execution flow.

Flow:

Start Interview

↓

Analyze Candidate

↓

Retrieve Knowledge Context

↓

Generate Question

↓

Receive Answer

↓

Evaluate Answer

↓

Update Knowledge Twin

↓

Adjust Difficulty

↓

Generate Next Question


Explain every step.
```

---

# Prompt 19: Define Evaluation Framework

```text
Create an evaluation framework for candidate answers.

Evaluate:

1. Correctness
2. Reasoning
3. Depth
4. Communication
5. Engineering Judgement


For each dimension define:

- Meaning
- Scoring criteria
- Example strong answer
- Example weak answer
```

---

# Prompt 20: Define Explainable AI Strategy

```text
Design explainable AI features for INTERVUE AI.

The system should explain:

- Why a score was given
- Why difficulty changed
- What concepts were missing
- What RAG sources were used

Create a transparency strategy.
```

---

# Prompt 21: Define Knowledge Twin Concept

```text
Design the Knowledge Twin system.

The Knowledge Twin should maintain:

- Candidate knowledge level
- Mastered concepts
- Weak concepts
- Learning progress
- Interview history
- Improvement suggestions

Explain how it updates after every answer.
```

---

# Prompt 22: Define RAG Strategy

```text
Design the RAG architecture for INTERVUE AI.

Pipeline:

Curriculum Data

↓

Processing

↓

Chunking

↓

Embeddings

↓

Retrieval

↓

Context Assembly

↓

AI Generation


Explain:

- Data flow
- Retrieval strategy
- Grounding method
- Hallucination prevention
```

---

# Prompt 23: Define Security Requirements

```text
Analyze security requirements for INTERVUE AI.

Check:

- API key protection
- User data protection
- Session security
- Environment variables
- Frontend exposure risks

Provide best practices.
```

---

# Prompt 24: Define Deployment Strategy

```text
Create deployment strategy for INTERVUE AI.

Include:

- Frontend deployment
- Backend deployment
- Environment variables
- Database deployment
- AI service deployment
- Testing before production

Optimize for hackathon deployment.
```

---

# Prompt 25: Final Product Validation

```text
Act as a senior AI startup evaluator.

Review INTERVUE AI.

Provide:

- Strengths
- Weaknesses
- Innovation score
- Technical score
- Hackathon winning probability
- Recommended improvements

Be honest and critical.
```

---

## Prompt 4: Project Scaffold

I want to create this project using Next.js.

Create the best production-level folder structure for INTERVUE AI.

Requirements:

Frontend:
- Pages
- Components
- UI components
- Hooks

Backend:
- API routes
- Controllers
- Services

AI:
- Candidate profiler
- Interview planner
- Question generator
- Answer evaluator
- Decision engine

RAG:
- Curriculum loader
- Retrieval system
- Context builder

Other:
- Database
- Configuration
- Utilities
- Tests

Create a clean scalable architecture.

Do not write implementation code.
Only create the scaffold and explain the purpose of each folder.


---

## Prompt 5: Technology Stack Selection

I want to build INTERVUE AI as a production-quality AI application.

Suggest the best technology stack.

Requirements:

- Modern frontend
- AI integration
- RAG support
- Easy deployment
- Good developer experience

Suggest:

Frontend:
Backend:
Database:
AI models:
Vector database:
Deployment:

Explain why each technology is suitable for this project.


---

## Prompt 6: Landing Page Design

Create the landing page for INTERVUE AI.

The website should feel like a premium AI startup.

Design requirements:

Theme:
- Dark futuristic interface
- Black background
- Purple and cyan gradients
- Glassmorphism
- Smooth animations
- Premium typography

Sections:

1. Navbar
2. Hero section
3. Features
4. How it works
5. Technology section
6. About section

Hero message:

"The Future of Technical Interviews"

The design should impress hackathon judges.


---

## Prompt 7: Improve Landing Page UI

Improve the current INTERVUE AI landing page.

Make it look like a premium AI product.

Improve:

- Typography
- Spacing
- Animations
- Cards
- Gradients
- Visual hierarchy

Keep:
- Dark theme
- Purple/cyan branding

Do not change functionality.

Only improve the UI quality.


---

## Prompt 8: Create Dashboard Page

Build the INTERVUE AI dashboard.

The dashboard should look like an AI command center.

Include:

- Candidate readiness score
- Knowledge Twin status
- Interview progress
- AI insights
- Skill analysis
- Recent activity

Design:

- Dark glassmorphism
- Neon accents
- Premium AI dashboard style

Make it visually impressive.


---

## Prompt 9: Create AI Interview Chamber

Create the interview experience page.

Requirements:

The page should feel like a futuristic AI interview room.

Include:

- AI interviewer interface
- Current question display
- Answer input
- Interview progress
- Difficulty indicator
- AI analysis status
- Knowledge retrieval status

The user should feel like they are interacting with an advanced AI interviewer.


---

## Prompt 10: Create Candidate Profiler

Build a candidate profiling AI module.

Input:

- Resume/profile information
- Skills
- Experience
- Previous knowledge

Output:

- Skill level
- Strengths
- Weaknesses
- Starting interview difficulty
- Interview strategy

Return structured JSON data.


---

## Prompt 11: Build Interview Planner

Create an AI interview planner.

The planner should decide:

- Topics to cover
- Question difficulty
- Interview sequence
- Follow-up questions

Inputs:

- Candidate profile
- Knowledge level
- Curriculum

Output:

A personalized interview roadmap.


---

## Prompt 12: Question Generation System

Create an AI question generator.

The system should generate technical questions based on:

- Candidate skill level
- Previous answers
- Knowledge gaps
- Curriculum topics

Requirements:

Questions should:
- Adapt dynamically
- Increase difficulty when candidate performs well
- Test deeper understanding

Return:

Question
Topic
Difficulty
Reason


---

## Prompt 13: Answer Evaluation System

Create an AI answer evaluation system.

Evaluate candidate answers using:

1. Correctness
2. Reasoning
3. Depth
4. Communication
5. Engineering judgement

Return:

- Score
- Strengths
- Weaknesses
- Missing concepts
- Confidence
- Explanation

The evaluation must be explainable.


---

## Prompt 14: Adaptive Difficulty Engine

Create an adaptive difficulty engine.

After every answer:

Analyze:

- Candidate score
- Confidence
- Knowledge gaps
- Performance trend

Decide:

- Increase difficulty
- Maintain difficulty
- Decrease difficulty

Also generate the reason behind the decision.


---

## Prompt 15: Knowledge Twin System

Create a Knowledge Twin system for candidates.

The Knowledge Twin should remember:

- Mastered concepts
- Weak concepts
- Learning progress
- Interview history
- Improvement areas

Update the Knowledge Twin after every answer.

The goal is to create an AI memory of candidate knowledge.


---

## Prompt 16: RAG Pipeline

Implement the RAG pipeline for INTERVUE AI.

Pipeline:

Curriculum Data
↓
Processing
↓
Chunking
↓
Embeddings
↓
Retrieval
↓
Context Generation
↓
AI Response


Requirements:

- Retrieve relevant concepts
- Ground AI decisions
- Reduce hallucinations
- Store source information

Make the retrieval explainable.


---

## Prompt 17: Curriculum Data System

Create a curriculum management system.

The system should:

- Store technical topics
- Store concepts
- Store learning objectives
- Provide context for AI questions

Design the structure so it works with RAG retrieval.


---

## Prompt 18: Backend Architecture

Create the backend architecture for INTERVUE AI.

Include:

- API routes
- Controllers
- Services
- AI integrations
- Session management

Required flows:

Start interview
Submit answer
Evaluate answer
Update knowledge
Generate report


Explain the complete backend flow.


---

## Prompt 19: API Design

Design APIs for INTERVUE AI.

Create endpoints for:

1. Start interview
2. Submit answer
3. Generate next question
4. Get analytics
5. Get report
6. Get knowledge graph

For each API provide:

Method
Route
Input
Output
Purpose


---

## Prompt 20: Session Management

Implement interview session management.

Requirements:

- Create session ID
- Store interview state
- Track questions
- Track answers
- Store evaluation results
- Restore session after refresh

Design a reliable session architecture.


---

## Prompt 21: Analytics Dashboard

Create the analytics page.

Include:

- Performance radar
- Score evolution graph
- Difficulty progression timeline
- Knowledge growth analysis
- AI decision timeline

The purpose:

Show how AI analyzed and adapted to the candidate.


---

## Prompt 22: Report Page

Create the final AI interview report page.

Include:

- Overall score
- Skill breakdown
- Performance evolution
- Strengths
- Knowledge gaps
- Improvement roadmap
- AI recommendations

The report should look like an enterprise hiring assessment.


---

## Prompt 23: Explainable AI Decision Center

Add an Explainable AI section.

The system should explain:

- Why score was given
- What concepts were detected
- What concepts were missing
- What RAG sources were used
- Why difficulty changed

The goal:

Users should understand every AI decision.


---

## Prompt 24: Improve Visual Quality

Improve the complete INTERVUE AI UI.

Focus on:

- Premium animations
- Better spacing
- Better typography
- Better cards
- Better icons
- Consistent design system

Maintain:

- Dark futuristic theme
- Purple/cyan colors
- AI product feeling

Do not break functionality.


---

## Prompt 25: Complete System Review

Review the complete INTERVUE AI project.

Check:

Frontend:
- Pages
- Components
- Navigation

Backend:
- APIs
- Data flow

AI:
- Interview engine
- Evaluation

RAG:
- Retrieval
- Grounding

Reports:
- Analytics
- Explainability

Find:
- Missing connections
- Bugs
- Improvements

Provide a complete technical review.---

## Prompt 51: Build RAG Curriculum Loader

Create the curriculum ingestion system for INTERVUE AI.

Requirements:

Input:

- Technical curriculum data
- Topics
- Concepts
- Learning objectives

The system should:

- Load curriculum data
- Validate structure
- Prepare data for retrieval
- Maintain source information

Create a modular implementation.

---

## Prompt 52: Create Document Processing Pipeline

Build a document processing pipeline.

Requirements:

Process:

- Curriculum documents
- Technical resources
- Learning materials

Pipeline:

Input Data
↓
Cleaning
↓
Processing
↓
Chunk Creation
↓
Storage

Make it compatible with the RAG system.

---

## Prompt 53: Implement Text Chunking Strategy

Create a chunking system for RAG.

Requirements:

- Split content intelligently
- Preserve context
- Maintain metadata
- Avoid losing important concepts

Each chunk should contain:

- Content
- Source
- Topic
- Concept information

---

## Prompt 54: Create Embedding Pipeline

Implement the embedding generation pipeline.

Requirements:

Generate embeddings for:

- Curriculum chunks
- Technical concepts
- Learning materials

Store:

- Vector representation
- Metadata
- Source information

Make retrieval efficient.

---

## Prompt 55: Create Vector Retrieval System

Build the vector retrieval system.

Requirements:

Input:

- Candidate question
- Knowledge gap
- Topic

Output:

- Relevant curriculum chunks
- Similarity score
- Source information

The retrieval should support explainable AI.

---

## Prompt 56: Build Context Assembly System

Create a context builder for RAG.

The system should:

Take:

- Retrieved chunks
- Candidate state
- Interview context

Generate:

- AI context prompt
- Relevant knowledge
- Grounding information

Prevent irrelevant information from entering prompts.

---

## Prompt 57: Connect RAG With Question Generation

Connect the RAG system with question generation.

Flow:

Candidate Profile

↓

Knowledge State

↓

Retrieve Relevant Concepts

↓

Generate Grounded Question


Ensure:

Questions are based on curriculum knowledge.

---

## Prompt 58: Connect RAG With Answer Evaluation

Connect RAG retrieval with answer evaluation.

Flow:

Candidate Answer

↓

Retrieve Expected Concepts

↓

Compare Response

↓

Generate Evaluation


The AI should identify:

- Covered concepts
- Missing concepts
- Incorrect concepts

---

## Prompt 59: Add RAG Evidence Tracking

Add RAG evidence tracking.

For every AI decision store:

- Retrieved source
- Similarity score
- Used concepts
- Context chunks

Display this information in analytics and reports.

---

## Prompt 60: Create Knowledge Twin Update Logic

Implement Knowledge Twin update logic.

After every answer:

Analyze:

- Topic performance
- Score
- Missing concepts
- Confidence

Update:

- Mastered topics
- Weak topics
- Knowledge score

---

## Prompt 61: Improve Knowledge Twin Visualization

Improve the Knowledge Twin UI.

Display:

- Current knowledge state
- Growth
- Mastered concepts
- Knowledge gaps
- Learning path

Make it look like an AI memory system.

---

## Prompt 62: Create Interview History System

Build interview history tracking.

Store:

- Previous interviews
- Scores
- Topics covered
- Improvement areas
- AI recommendations

Allow users to review past progress.

---

## Prompt 63: Build History Page

Create the History page.

Include:

- Previous interview cards
- Scores
- Date
- Topics
- Performance changes

Design:

- Premium dashboard style
- Dark theme
- Glass cards

---

## Prompt 64: Add AI Recommendations System

Create personalized AI recommendations.

Based on:

- Evaluation results
- Knowledge gaps
- Weak topics

Generate:

- Learning suggestions
- Practice areas
- Improvement roadmap

---

## Prompt 65: Create Recovery Plan Generator

Build an AI recovery plan generator.

Generate:

- Short-term improvement goals
- Topics to study
- Practice strategy
- Timeline

The plan should be personalized.

---

## Prompt 66: Improve Interview Experience

Improve the interview page experience.

Add:

- Smooth transitions
- Better question display
- Answer feedback states
- Progress indicators
- AI thinking animations

Keep the experience professional.

---

## Prompt 67: Add AI Processing States

Create AI processing indicators.

Show states like:

Analyzing answer...
Retrieving knowledge...
Evaluating concepts...
Updating Knowledge Twin...
Preparing next question...

Make the AI feel alive.

---

## Prompt 68: Create AI Telemetry Dashboard

Create AI telemetry visualization.

Display:

- Evaluations completed
- Retrieved contexts
- AI decisions
- Knowledge updates
- Processing status

Make it look like an AI operations center.

---

## Prompt 69: Build Analytics API

Create analytics API.

The API should provide:

- Performance metrics
- Score timeline
- Difficulty changes
- Knowledge growth
- AI decisions

Connect it with frontend charts.

---

## Prompt 70: Build Report API

Create report API.

Return:

- Overall score
- Skill analysis
- Question breakdown
- RAG evidence
- Recommendations
- AI reasoning

Ensure data comes from real interview sessions.

---

## Prompt 71: Add Session Persistence

Improve session persistence.

Requirements:

- Store active session ID
- Restore interview state
- Maintain progress after refresh
- Retrieve correct report

Use reliable session management.

---

## Prompt 72: Integrate Redis Session Storage

Implement Redis-based session storage.

Store:

- Interview state
- Question history
- Evaluations
- Knowledge Twin
- Decisions

Provide fallback handling.

---

## Prompt 73: Create Error Handling System

Improve application error handling.

Handle:

- API failures
- Missing sessions
- Invalid data
- AI failures
- Retrieval failures

Provide user-friendly messages.

---

## Prompt 74: Add Loading States Everywhere

Add professional loading states.

Include:

- Skeleton loaders
- AI processing animations
- Chart loading states
- Page transitions

Maintain premium UX.

---

## Prompt 75: Complete AI Backend Audit

Perform a complete backend audit.

Check:

- API routes
- Controllers
- AI modules
- RAG pipeline
- Session handling
- Data flow

Verify:

Frontend
↓
API
↓
Backend
↓
AI
↓
RAG
↓
Response

Find and fix issues.---

## Prompt 76: Create Explainable AI Decision Center

Add an Explainable AI Decision Center to INTERVUE AI.

Purpose:

The AI should not only provide scores.
It should explain why every decision was made.

Display:

- Question context
- Candidate answer summary
- AI reasoning
- Strengths detected
- Missing concepts
- RAG evidence
- Difficulty decision
- Confidence score

Make every AI decision transparent.

---

## Prompt 77: Improve Explainable AI UI

Improve the Explainable AI section.

Design:

- Dark glassmorphism
- Purple/cyan neon accents
- Evidence cards
- Timeline style
- AI research laboratory feeling

Add:

- Smooth animations
- Data connectors
- Confidence indicators

Do not add random 3D objects.

---

## Prompt 78: Create AI Decision Timeline

Create an adaptive AI decision timeline.

Show:

Question 1

↓

Evaluation

↓

Detected strengths

↓

Detected gaps

↓

Decision

↓

Next difficulty


Each timeline event should explain the AI reasoning.

---

## Prompt 79: Improve Analytics Page

Upgrade the Analytics page to a premium AI intelligence dashboard.

Include:

- Performance radar
- Score evolution
- Difficulty timeline
- Knowledge growth
- AI decisions
- RAG telemetry

The goal is to show how AI thinks and adapts.

---

## Prompt 80: Fix Analytics Data Connections

Audit analytics data flow.

Check:

Frontend components

↓

Analytics API

↓

Interview state

↓

Evaluation results


Verify:

- Real data is used
- No hardcoded values
- Charts update dynamically
- Empty states work correctly

---

## Prompt 81: Fix Score Evolution Chart

Fix the Score & Difficulty Evolution chart.

Requirements:

Display:

- Question number
- Score progression
- Difficulty changes
- Topic information

Add:

- Smooth line animation
- Interactive tooltips
- Empty state handling

Connect with real interview data.

---

## Prompt 82: Fix Performance Evolution Chart

Fix the Performance Evolution trajectory chart.

Problem:

Chart renders but data may not appear.

Check:

- API response
- Data mapping
- Component props
- Chart configuration


Ensure:

- Q1-Q5 timeline
- Score points
- Difficulty progression
- Interactive tooltips

Use real evaluation data.

---

## Prompt 83: Create Performance Radar System

Build the 5-axis performance radar.

Dimensions:

1. Correctness
2. Reasoning
3. Depth
4. Communication
5. Engineering Judgement


Connect it with AI evaluation results.

Do not use static values.

---

## Prompt 84: Create Knowledge Growth Analytics

Create a knowledge growth visualization.

Show:

Before interview:

- Initial knowledge state

After interview:

- Improved concepts
- Remaining gaps
- Learning progress


Use:

- Charts
- Progress bars
- Timeline

---

## Prompt 85: Create RAG Intelligence Visualization

Create a RAG intelligence visualization.

Show:

Curriculum Source

↓

Chunk Selection

↓

Embedding Match

↓

Top-K Retrieval

↓

Context Assembly

↓

AI Decision


Display:

- Similarity score
- Retrieved concepts
- Source information

---

## Prompt 86: Improve Report Page Design

Upgrade the final report page.

Make it look like an enterprise AI assessment report.

Include:

- Executive summary
- Overall score
- Skill analysis
- Performance graphs
- AI reasoning
- Improvement roadmap

Use premium design.

---

## Prompt 87: Add Score Explanation Panel

Create a "Why This Score?" section.

Explain:

How the final score was calculated.

Show:

- Correctness weight
- Reasoning weight
- Depth weight
- Communication weight
- Engineering weight

Make scoring transparent.

---

## Prompt 88: Create Final Assessment Report

Create a complete final interview assessment.

Include:

Candidate performance

↓

AI evaluation

↓

Knowledge gaps

↓

Recommendations

↓

Future learning path


Make it suitable for recruiters.

---

## Prompt 89: Improve PDF Report

Improve PDF report generation.

The PDF should include:

- Candidate summary
- Score breakdown
- Charts
- AI reasoning
- Recommendations

Ensure:

- Professional layout
- Proper spacing
- No broken pages

---

## Prompt 90: Add Built By LogicLoom Section

Add a professional team section.

Location:

Bottom of landing page.

Include:

- Built By LogicLoom
- Team member names
- LinkedIn links


Do not add:

- Phone numbers
- Roles
- GitHub links

Keep it minimal.

---

## Prompt 91: Improve Branding Consistency

Check the complete application branding.

Verify:

- Logo consistency
- Typography
- Colors
- Button styles
- Icons
- Spacing

Ensure every page feels like the same product.

---

## Prompt 92: Remove Unwanted UI Elements

Audit the interface.

Remove:

- Unnecessary text
- Fake company logos
- Random decorative elements
- Excessive 3D objects

Keep:

- Professional AI product appearance

---

## Prompt 93: Improve Responsive Design

Make INTERVUE AI responsive.

Check:

- Desktop
- Tablet
- Mobile

Fix:

- Overlapping components
- Broken layouts
- Text overflow
- Chart issues

---

## Prompt 94: Complete Frontend Testing

Test all frontend pages.

Verify:

- Landing page
- Dashboard
- Interview
- History
- Digital Twin
- Knowledge Graph
- Analytics
- Report


Check:

- Navigation
- Buttons
- Loading states
- Error states

---

## Prompt 95: Complete Backend Testing

Test backend systems.

Verify:

- API responses
- Data validation
- Error handling
- Session management
- AI integration


Ensure all APIs work correctly.

---

## Prompt 96: Run Complete AI Pipeline Test

Test complete AI workflow.

Flow:

Candidate Profile

↓

Interview Start

↓

Question Generation

↓

Answer Submission

↓

Evaluation

↓

RAG Retrieval

↓

Difficulty Update

↓

Knowledge Twin Update

↓

Report Generation


Verify every step.

---

## Prompt 97: Security Audit

Perform security audit.

Check:

- Environment variables
- API keys
- User data
- Session security
- Client exposure

Fix security issues.

---

## Prompt 98: Performance Optimization

Optimize application performance.

Check:

- Bundle size
- Component rendering
- API response time
- Animations
- Database calls


Improve speed without reducing quality.

---

## Prompt 99: Final Hackathon Demo Preparation

Prepare INTERVUE AI for hackathon demo.

Create:

- Demo flow
- Presentation sequence
- Key talking points
- Judge explanation

Focus on:

Problem

↓

Solution

↓

AI Innovation

↓

Live Demo

↓

Impact

---

## Prompt 100: Final Production Verification

Perform final end-to-end verification.

Check:

Frontend

Backend

AI Engine

RAG Pipeline

Knowledge Twin

Analytics

Report

Deployment


Run:

npm test

npm run build


Generate final report:

- System status
- Issues found
- Fixes applied
- Production readiness score

Prepare the project for final submission.---

# CODEX / AI CODING AGENT PROMPTS

## Prompt 101: Initialize Project Implementation

```text
You are working on the INTERVUE AI repository.

Understand the complete project structure first.

Analyze:

- Existing folders
- Current architecture
- Technologies used
- Existing components
- Backend flow
- AI modules

Before modifying anything:
1. Explain the current implementation.
2. Identify missing parts.
3. Create an implementation plan.

Do not randomly modify files.
Follow the existing architecture.
```

---

## Prompt 102: Implement Feature From Architecture

```text
Implement this feature in the existing INTERVUE AI codebase.

Requirements:

- Follow current folder structure
- Use TypeScript
- Keep components modular
- Do not break existing functionality
- Reuse existing utilities

Before coding:
Explain:
- Files that will change
- New files required
- Data flow

After coding:
Run:
npm run build

Fix all errors.
```

---

## Prompt 103: Audit Frontend Connection

```text
Audit the frontend implementation.

Check:

- All pages
- Components
- Navigation
- API calls
- State management

Verify:

User Action
      ↓
Frontend Component
      ↓
API Request
      ↓
Response Handling
      ↓
UI Update

Find broken connections and fix them.
```

---

## Prompt 104: Connect Dashboard Buttons

```text
Fix dashboard navigation.

Problem:

Some buttons redirect incorrectly or ask the user to go to dashboard first.

Check:

- Sidebar navigation
- Header navigation
- Dashboard cards
- Next.js routes

Ensure every button directly opens the correct page.

Verify:

/dashboard
/interview
/history
/analytics
/report
/knowledge-graph
/digital-twin
```

---

## Prompt 105: Fix Page Transition Animations

```text
Improve page navigation animations.

Current issue:

Some pages have animations while others directly open.

Make all major routes consistent.

Add:

- Smooth transitions
- Fade effects
- Loading states

Maintain performance.
```

---

## Prompt 106: Remove Incorrect Branding Text

```text
Remove unwanted branding text from the application.

Example:

Remove:
"INTERVUE OS"

Replace with:
"INTERVUE AI"

Check all:

- Landing page
- Dashboard
- Navbar
- Footer
- Report pages

Ensure branding is consistent.
```

---

## Prompt 107: Fix Logo Consistency

```text
Fix logo inconsistency across the application.

Problem:

Landing page logo and dashboard logo are different.

Create one reusable logo component.

Use the same:

- Icon
- Typography
- Colors
- Size rules

Replace all duplicate logos.
```

---

## Prompt 108: Improve Hero Typography

```text
Improve the typography of:

"The Future of Technical Interviews"

Requirements:

- Premium AI startup style
- Better font pairing
- Strong visual hierarchy
- Better spacing

Use modern typography similar to:

OpenAI
Apple
Tesla

Do not change the content.
```

---

## Prompt 109: Fix Overlapping UI Components

```text
Fix UI layout issues.

Problem:

Some cards and headings overlap.

Check:

- Dashboard
- Analytics
- Report
- Landing page

Improve:

- Spacing
- Container width
- Responsive behavior
- Alignment

Do not remove features.
```

---

## Prompt 110: Improve Feature Card Visuals

```text
Improve feature cards.

Current issue:

Circular images/icons inside cards look basic.

Make them premium.

Add:

- Better icons
- AI-style illustrations
- Glow effects
- Better spacing
- Consistent design

Keep the futuristic theme.
```

---

## Prompt 111: Connect Report Page Backend

```text
Verify and connect the Report page with backend.

Check:

app/report/page.tsx

API:

GET /api/interview/report

Backend:

interview-controller.ts


Verify:

- Score data
- Skill metrics
- Question breakdown
- Recommendations
- RAG evidence

No hardcoded values.
Use real session data.
```

---

## Prompt 112: Report Page Quality Upgrade

```text
Upgrade the report page to an enterprise AI assessment report.

Include:

- Executive summary
- Overall readiness score
- Performance graphs
- Skill analysis
- Knowledge gaps
- AI reasoning
- Recovery plan

Make it visually impressive.
```

---

## Prompt 113: Verify Analytics Backend Connection

```text
Audit analytics connection.

Check:

Frontend:

app/analytics/page.tsx

API:

/api/analytics


Backend:

Interview state


Verify:

- Radar data
- Score timeline
- Difficulty changes
- Knowledge growth

Confirm whether data is real or mocked.
```

---

## Prompt 114: Fix Empty Analytics Charts

```text
Fix empty charts in analytics.

Problem:

Chart container appears but visualization is missing.

Check:

- API response
- Data structure
- Component props
- Chart configuration


Fix:

- Score evolution
- Difficulty timeline
- Performance graphs

Use real data.
```

---

## Prompt 115: Verify RAG Pipeline Connection

```text
Perform a complete RAG audit.

Check:

Curriculum Data

↓

Retrieval

↓

Context Generation

↓

Question Generation

↓

Answer Evaluation


Verify:

- Retrieved chunks
- Similarity scores
- Source information
- Grounding usage

Confirm connection with frontend.
```

---

## Prompt 116: Verify AI Decision Engine

```text
Audit the adaptive AI decision engine.

Check:

- Difficulty calculation
- Score analysis
- Knowledge gap detection
- Next question strategy


Verify:

High performance:
Increase difficulty

Low performance:
Reduce difficulty

Missing concepts:
Probe knowledge gaps
```

---

## Prompt 117: Add Explainable AI Feature

```text
Implement Explainable AI Decision Intelligence.

For every AI decision show:

- Input data
- Reasoning
- Evidence
- Decision
- Confidence


Connect it with:

- Evaluation results
- RAG evidence
- Difficulty engine
```

---

## Prompt 118: Run Complete System Audit

```text
Perform a complete end-to-end audit of INTERVUE AI.

Verify:

Frontend
Backend
AI Engine
RAG Pipeline
Knowledge Twin
Analytics
Report System


Check:

- Data flow
- API connections
- Errors
- Missing functionality


Run:

npm test

npm run build


Generate a detailed verification report.
```

---

## Prompt 119: Git Commit Preparation

```text
Review all current changes.

Before commit:

Check:

- Modified files
- Unnecessary files
- Build status
- Test status


Suggest:

- Commit message
- Files to include

Ensure repository is clean.
```

---

## Prompt 120: Final Hackathon Submission Audit

```text
Prepare INTERVUE AI for final hackathon submission.

Verify:

- UI quality
- Backend stability
- AI functionality
- RAG connection
- Demo flow
- Deployment readiness

Provide:

Final score
Remaining risks
Last improvements needed
```

------

# CODEX / AI CODING AGENT PROMPTS

## Prompt 101: Initialize Project Understanding

```text
You are working inside the INTERVUE AI repository.

Before making any changes, understand the complete project.

Analyze:

- Folder structure
- Frontend architecture
- Backend architecture
- AI modules
- RAG pipeline
- Data flow
- Existing components

Explain:

1. Current implementation
2. Missing features
3. Possible improvements
4. Files that need modification

Do not modify files until you understand the architecture.
```

---

## Prompt 102: Implement Feature Safely

```text
Implement this feature in the existing INTERVUE AI codebase.

Requirements:

- Follow current architecture
- Use TypeScript
- Keep components modular
- Reuse existing utilities
- Do not break existing functionality

Before coding:

Explain:
- Files to modify
- New files required
- Data flow

After implementation:

Run:

npm run build

Fix all errors.
```

---

## Prompt 103: Frontend Connection Audit

```text
Audit the complete frontend.

Check:

- All pages
- Components
- Navigation
- API calls
- State management
- Loading states
- Error states

Verify:

User Action
        ↓
Frontend Component
        ↓
API Request
        ↓
Backend Response
        ↓
UI Update

Find broken connections and fix them.
```

---

## Prompt 104: Fix Dashboard Navigation

```text
Fix dashboard navigation issues.

Problem:

Some buttons redirect incorrectly or ask users to open dashboard first.

Check:

- Sidebar
- Navbar
- Dashboard cards
- Buttons
- Next.js routes

Ensure direct navigation works:

/dashboard
/interview
/history
/analytics
/report
/knowledge-graph
/digital-twin

Do not change the design.
Only fix routing.
```

---

## Prompt 105: Make Page Transitions Consistent

```text
Improve page transition animations.

Currently some pages open with animations and some open instantly.

Make all major pages consistent.

Add:

- Smooth transitions
- Fade animations
- Loading states

Maintain performance.
```

---

## Prompt 106: Remove Incorrect Branding

```text
Audit the application branding.

Remove incorrect text:

"INTERVUE OS"

Replace everywhere with:

"INTERVUE AI"

Check:

- Landing page
- Dashboard
- Navbar
- Footer
- Reports

Ensure consistent branding.
```

---

## Prompt 107: Fix Logo Consistency

```text
Fix logo differences across pages.

Problem:

Landing page logo and internal pages use different logos.

Create a reusable logo component.

Apply everywhere.

Maintain:

- Same icon
- Same typography
- Same colors
- Same spacing
```

---

## Prompt 108: Improve Hero Typography

```text
Improve the typography of:

"The Future of Technical Interviews"

Requirements:

- Premium AI startup feeling
- Modern font pairing
- Better spacing
- Better hierarchy

Style inspiration:

- OpenAI
- Apple
- Tesla

Do not change the message.
Only improve presentation.
```

---

## Prompt 109: Fix UI Overlapping Issues

```text
Fix all UI overlapping problems.

Check:

- Dashboard
- Analytics
- Report
- Landing page

Improve:

- Container sizing
- Spacing
- Alignment
- Responsive behavior

Do not remove existing features.
```

---

## Prompt 110: Improve Feature Cards

```text
Improve the feature cards on the landing page.

Current issue:

Icons/images inside cards look basic.

Improve:

- Icons
- Visual hierarchy
- Glow effects
- Hover animations
- Spacing

Maintain the INTERVUE AI futuristic theme.
```

---

## Prompt 111: Connect Report Page With Backend

```text
Verify and connect the Report page.

Check:

Frontend:

app/report/page.tsx


API:

GET /api/interview/report


Backend:

interview-controller.ts


Verify:

- Overall score
- Skill metrics
- Question breakdown
- Recommendations
- RAG evidence

Remove hardcoded values.

Use real interview session data.
```

---

## Prompt 112: Upgrade Report Page

```text
Upgrade the final report page.

Make it look like an enterprise AI assessment platform.

Include:

- Executive summary
- Readiness score
- Skill analysis
- Performance graphs
- Knowledge gaps
- AI reasoning
- Improvement roadmap

Use premium UI.
```

---

## Prompt 113: Analytics Connection Audit

```text
Audit the analytics system.

Check:

Frontend:

app/analytics/page.tsx


API:

/api/analytics


Backend:

Interview state


Verify:

- Radar metrics
- Score timeline
- Difficulty progression
- Knowledge growth
- AI decisions

Confirm whether data is real or mocked.
```

---

## Prompt 114: Fix Empty Charts

```text
Fix analytics charts that render empty.

Problem:

Chart containers appear but visualization is missing.

Check:

- API response
- Data structure
- Component props
- Chart configuration


Fix:

- Score evolution
- Difficulty chart
- Performance trajectory

Use real data.
```

---

## Prompt 115: RAG Pipeline Audit

```text
Perform a complete RAG pipeline audit.

Verify:

Curriculum Data

↓

Processing

↓

Retrieval

↓

Context Assembly

↓

AI Generation

↓

Evaluation


Check:

- Retrieved chunks
- Similarity scores
- Sources
- Grounding information

Confirm frontend visibility.
```

---

## Prompt 116: AI Decision Engine Audit

```text
Audit the adaptive AI decision engine.

Check:

- Difficulty calculation
- Performance analysis
- Knowledge gaps
- Next question strategy

Verify:

High score:
Increase difficulty

Low score:
Reduce difficulty

Missing concepts:
Generate follow-up questions
```

---

## Prompt 117: Implement Explainable AI

```text
Implement Explainable AI Decision Intelligence.

For every AI decision display:

- Question context
- Candidate response analysis
- Score explanation
- RAG evidence
- Difficulty decision
- Confidence score

Connect with real evaluation data.
```

---

## Prompt 118: Complete System Verification

```text
Perform a complete end-to-end audit of INTERVUE AI.

Verify:

Frontend
Backend
AI Engine
RAG Pipeline
Knowledge Twin
Analytics
Reports


Check:

- Data flow
- API connections
- Runtime errors
- Missing functionality


Run:

npm test

npm run build


Generate a detailed audit report.
```

---

## Prompt 119: Prepare Git Commit

```text
Review all project changes before committing.

Check:

- Modified files
- Unnecessary files
- Build status
- Test status

Provide:

- Recommended commit message
- Files to include

Ensure repository is clean.
```

---

## Prompt 120: Final Hackathon Submission Audit

```text
Prepare INTERVUE AI for final hackathon submission.

Verify:

- UI quality
- Backend stability
- AI functionality
- RAG connection
- Demo flow
- Deployment readiness

Provide:

1. Final system score
2. Remaining risks
3. Last improvements required
4. Submission checklist
```

------

## Prompt 101: Initialize Repository Understanding

Understand the complete INTERVUE AI repository before making changes.

Analyze:

- Current folder structure
- Frontend architecture
- Backend architecture
- AI modules
- RAG implementation
- Data flow
- Existing components

Explain:

- What is already implemented
- What is missing
- Possible improvements
- Files that need changes

Do not modify anything before understanding the existing architecture.

---

## Prompt 102: Implement New Feature Safely

Implement this feature inside the existing INTERVUE AI codebase.

Requirements:

- Follow existing architecture
- Use TypeScript
- Keep components modular
- Reuse existing utilities
- Avoid breaking existing functionality

Before implementation explain:

- Files to modify
- New files required
- Data flow

After implementation:

Run:

npm run build

Fix all errors.

---

## Prompt 103: Complete Frontend Audit

Audit the complete frontend application.

Check:

- All pages
- Components
- Navigation
- State management
- API integration
- Loading states
- Error states

Verify:

User interaction

↓

Frontend component

↓

API request

↓

Backend response

↓

UI update

Find and fix broken connections.

---

## Prompt 104: Fix Dashboard Navigation

Fix dashboard navigation issues.

Some buttons are redirecting incorrectly.

Check:

- Sidebar buttons
- Navbar links
- Dashboard cards
- Page routes

Ensure:

Dashboard
Interview
History
Analytics
Report
Knowledge Graph
Digital Twin

all open directly without unnecessary redirects.

Do not change UI design.

---

## Prompt 105: Improve Page Transition Experience

Improve navigation experience between pages.

Currently some pages have animations and some pages open instantly.

Make all major pages consistent.

Add:

- Smooth transitions
- Fade effects
- Loading animations
- Better user experience

Keep performance optimized.

---

## Prompt 106: Remove Incorrect Branding

Remove incorrect branding text from the application.

Replace:

INTERVUE OS

with:

INTERVUE AI

Check:

- Landing page
- Dashboard
- Navbar
- Footer
- Report page

Ensure branding consistency everywhere.

---

## Prompt 107: Fix Logo Consistency

Fix logo differences across pages.

Problem:

Landing page logo and internal page logo are different.

Create one reusable logo component.

Use the same:

- Icon
- Typography
- Color
- Size

Apply across the entire application.

---

## Prompt 108: Improve Hero Section Typography

Improve the hero heading:

"The Future of Technical Interviews"

Requirements:

- Premium AI startup typography
- Better font pairing
- Better spacing
- Strong visual hierarchy

Make it feel similar to:

- OpenAI
- Apple
- Tesla

Do not change the content.

---

## Prompt 109: Fix UI Overlapping Issues

Audit the complete UI for overlapping problems.

Check:

- Dashboard
- Analytics
- Report
- Landing page

Fix:

- Component spacing
- Container sizes
- Alignment
- Responsive issues

Do not remove features.

---

## Prompt 110: Improve Feature Card Design

Improve feature cards.

Current problem:

Cards look basic.

Upgrade:

- Icons
- Visual hierarchy
- Animations
- Glow effects
- Better spacing

Maintain the futuristic AI theme.

---

## Prompt 111: Connect Report Page Backend

Verify the Report page connection.

Check:

Frontend:

app/report/page.tsx


API:

/api/interview/report


Backend:

interview-controller.ts


Verify:

- Overall score
- Skill metrics
- Question breakdown
- Recommendations
- RAG evidence

Remove any hardcoded data.

Use real interview session data.

---

## Prompt 112: Upgrade Executive Report Page

Improve the final report page.

Make it look like an enterprise AI assessment platform.

Include:

- Candidate summary
- Overall score
- Skill analysis
- Performance graphs
- Knowledge gaps
- AI reasoning
- Recovery plan

Focus on premium presentation.

---

## Prompt 113: Audit Analytics Connection

Audit the analytics pipeline.

Check:

Frontend:

app/analytics/page.tsx


API:

/api/analytics


Backend:

Interview state


Verify:

- Radar metrics
- Score timeline
- Difficulty progression
- Knowledge growth
- AI decisions

Confirm that data is real.

---

## Prompt 114: Fix Empty Analytics Visualizations

Fix analytics charts that render without data.

Check:

- API response
- Data mapping
- Chart props
- Component state

Fix:

- Score evolution chart
- Difficulty chart
- Performance trajectory

Ensure charts display real interview data.

---

## Prompt 115: Verify RAG Pipeline

Perform a complete RAG verification.

Check:

Curriculum data

↓

Processing

↓

Retrieval

↓

Context generation

↓

AI generation

↓

Evaluation


Verify:

- Retrieved chunks
- Similarity scores
- Sources
- Grounding information

Ensure RAG data reaches frontend.

---

## Prompt 116: Verify Adaptive Decision Engine

Audit the adaptive difficulty system.

Check:

- Score analysis
- Difficulty calculation
- Knowledge gap detection
- Next question strategy

Verify:

High performance:
Increase difficulty

Low performance:
Reduce difficulty

Knowledge gap:
Generate follow-up question

---

## Prompt 117: Add Explainable AI Intelligence

Implement Explainable AI Decision Intelligence.

For every AI decision display:

- Question context
- Candidate answer summary
- Score explanation
- Evidence used
- Missing concepts
- Difficulty decision
- Confidence score

Connect everything with real backend data.

---

## Prompt 118: Perform Complete System Audit

Perform a complete end-to-end audit.

Verify:

Frontend

Backend

AI Engine

RAG Pipeline

Knowledge Twin

Analytics

Report System


Check:

- Data flow
- API connections
- Runtime errors
- Missing functionality


Run:

npm test

npm run build


Generate a detailed audit report.

---

## Prompt 119: Prepare Git Commit

Review all project changes before committing.

Check:

- Modified files
- Unnecessary files
- Build status
- Test status

Suggest:

- Commit message
- Files to include

Ensure repository is clean.

---

## Prompt 120: Final Hackathon Submission Audit

Prepare INTERVUE AI for final submission.

Verify:

- UI quality
- Backend stability
- AI functionality
- RAG integration
- Demo flow
- Deployment readiness

Provide:

- Final system score
- Remaining issues
- Last improvements
- Submission checklist

------

## Prompt 146: Complete Database Architecture Review

Review the complete data architecture of INTERVUE AI.

Check:

- Session storage
- Candidate data
- Interview history
- Evaluation records
- Knowledge Twin storage
- Analytics data

Verify:

- Data consistency
- Data relationships
- Storage efficiency
- Scalability

Suggest improvements if required.

---

## Prompt 147: Improve Redis Session Management

Audit Redis session management.

Check:

- Session creation
- Session retrieval
- Session updates
- Session expiration
- Error handling

Ensure:

- No lost interview data
- Fast retrieval
- Reliable state persistence

---

## Prompt 148: Add Interview State Validation

Create interview state validation.

Validate:

- Session ID
- Candidate information
- Question history
- Evaluation data
- Knowledge state

Prevent invalid states from breaking the application.

---

## Prompt 149: Improve Data Flow Documentation

Create complete technical documentation for INTERVUE AI.

Document:

Frontend

↓

API Layer

↓

Backend Services

↓

AI Engine

↓

RAG Pipeline

↓

Storage

↓

Analytics


Make it easy for developers and judges to understand.

---

## Prompt 150: Generate Complete Architecture Diagram

Create a final architecture diagram for INTERVUE AI.

Include:

- User interface
- Frontend components
- API routes
- Backend controllers
- AI agents
- RAG pipeline
- Knowledge Twin
- Database
- Analytics

Make it presentation ready.

---

## Prompt 151: Improve AI Interview Realism

Make the AI interview experience more realistic.

Add:

- Better follow-up questions
- Context awareness
- Previous answer consideration
- Natural conversation flow

The AI should behave like a real technical interviewer.

---

## Prompt 152: Add Follow-Up Question Generation

Implement intelligent follow-up questions.

The AI should generate follow-ups based on:

- Candidate answer
- Missing concepts
- Weak explanations
- Previous discussion

Avoid repeating generic questions.

---

## Prompt 153: Improve Question Difficulty Prediction

Improve question difficulty estimation.

Analyze:

- Candidate level
- Topic complexity
- Previous performance
- Knowledge gaps

Assign accurate difficulty levels.

---

## Prompt 154: Create Interview Strategy Generator

Create an AI interview strategy generator.

Before starting the interview generate:

- Topics to test
- Difficulty plan
- Question distribution
- Evaluation criteria

Make every interview personalized.

---

## Prompt 155: Improve Candidate Profile Experience

Improve candidate profile creation.

Include:

- Skills
- Experience
- Goals
- Preferred role
- Technology interests

Use this information for personalization.

---

## Prompt 156: Add Role-Based Interview Customization

Add role-based interview customization.

Support:

- Frontend Developer
- Backend Developer
- AI Engineer
- Data Scientist
- Full Stack Developer

Generate different interview strategies.

---

## Prompt 157: Improve AI Memory System

Enhance the AI memory system.

The AI should remember:

- Previous sessions
- Previous weaknesses
- Improvement progress
- Learning history

Use memory for future interviews.

---

## Prompt 158: Create Candidate Progress Timeline

Create a candidate growth timeline.

Show:

Previous interviews

↓

Skill improvement

↓

Knowledge growth

↓

Current readiness


Make progress visible.

---

## Prompt 159: Improve Analytics Visual Design

Improve analytics visual quality.

Enhance:

- Charts
- Graphs
- Cards
- Animations
- Tooltips

Make the page look like an enterprise AI analytics platform.

---

## Prompt 160: Add Interactive Chart Features

Improve all charts.

Add:

- Hover details
- Smooth animations
- Data explanations
- Better labels
- Responsive behavior

Charts should communicate insights clearly.

---

## Prompt 161: Improve Report Data Accuracy

Audit report calculations.

Verify:

- Overall score
- Skill averages
- Growth metrics
- Recommendations

Ensure every value comes from real backend data.

---

## Prompt 162: Add Report Empty State Handling

Improve report page when no interview exists.

Display:

- Clear message
- Start interview button
- Helpful explanation

Do not show broken components.

---

## Prompt 163: Improve Loading Experience

Create premium loading experiences.

Add:

- AI processing animations
- Skeleton screens
- Progress indicators
- Smooth transitions

Make waiting time feel intentional.

---

## Prompt 164: Improve Application Accessibility

Audit accessibility.

Check:

- Keyboard navigation
- Text readability
- Contrast
- Screen reader support
- Button labels

Improve usability.

---

## Prompt 165: Add Application Analytics Tracking

Add product analytics.

Track:

- Interview starts
- Completed interviews
- Report views
- Feature usage

Keep user privacy in mind.

---

## Prompt 166: Improve Environment Configuration

Audit environment variables.

Check:

- Missing variables
- Incorrect configuration
- Security risks

Create proper environment documentation.

---

## Prompt 167: Improve Code Organization

Review complete codebase organization.

Find:

- Duplicate files
- Unused code
- Large components
- Poor naming

Refactor for maintainability.

---

## Prompt 168: Add Testing Coverage

Improve test coverage.

Add tests for:

- API routes
- AI functions
- RAG retrieval
- State management
- Utility functions

Ensure important functionality is tested.

---

## Prompt 169: Debug Production Build Issues

Run production build.

Check:

npm run build

Fix:

- TypeScript errors
- Import issues
- Runtime problems
- Deployment issues

Ensure production readiness.

---

## Prompt 170: Optimize Vercel Deployment

Prepare INTERVUE AI for Vercel deployment.

Check:

- Build configuration
- Environment variables
- API routes
- Performance

Ensure successful deployment.

---

## Prompt 171: Create Demo Data Flow

Create a reliable demo flow.

Prepare:

- Candidate profile
- Interview session
- Evaluation data
- Analytics data
- Final report

The demo should always show the complete AI workflow.

---

## Prompt 172: Improve Demo Reliability

Audit the demo experience.

Prevent:

- Empty screens
- Missing data
- API failures
- Slow loading

Ensure a smooth live presentation.

---

## Prompt 173: Final UI Polish

Perform final UI polishing.

Improve:

- Spacing
- Alignment
- Typography
- Animations
- Consistency

Do not add unnecessary features.

---

## Prompt 174: Final Code Review

Perform a complete code review.

Check:

- Code quality
- Architecture
- Security
- Performance
- Maintainability

Provide recommendations.

---

## Prompt 175: Final Product Readiness Check

Perform the final INTERVUE AI readiness check.

Verify:

Frontend

Backend

AI Engine

RAG

Knowledge Twin

Analytics

Report

Deployment


Provide:

- Final score
- Remaining issues
- Submission recommendation

------

# RAG DEVELOPMENT PROMPTS

## Prompt 201: Design RAG Architecture

Design the complete RAG architecture for INTERVUE AI.

The RAG system should support:

- Curriculum knowledge retrieval
- Interview question generation
- Answer evaluation
- Knowledge gap detection
- Explainable AI decisions

Create:

- Data flow
- Components
- Retrieval process
- Storage strategy
- Integration points with AI engine

---

## Prompt 202: Create Curriculum Knowledge Base

Create a curriculum knowledge base system.

The knowledge base should store:

- Technical topics
- Concepts
- Definitions
- Learning objectives
- Difficulty levels
- Examples
- Related concepts

Design the structure so it can be used by RAG retrieval.

---

## Prompt 203: Build Curriculum Data Loader

Implement a curriculum data loader.

Requirements:

Input:

- JSON curriculum data
- Technical documents

Process:

- Load data
- Validate structure
- Extract metadata
- Prepare for indexing

Return clean structured curriculum objects.

---

## Prompt 204: Create Document Preprocessing Pipeline

Build a preprocessing pipeline for RAG documents.

Pipeline:

Raw Data

↓

Cleaning

↓

Normalization

↓

Metadata Extraction

↓

Chunk Generation

↓

Embedding Preparation


Ensure data quality before indexing.

---

## Prompt 205: Implement Intelligent Chunking

Create an intelligent chunking strategy.

Requirements:

- Preserve context
- Avoid breaking concepts
- Maintain topic relationships
- Store metadata

Each chunk should contain:

- Content
- Topic
- Concept
- Source
- Difficulty

---

## Prompt 206: Improve Chunking Strategy

Analyze the current chunking strategy.

Improve:

- Chunk size
- Chunk overlap
- Context preservation
- Retrieval accuracy

Optimize specifically for technical interview questions.

---

## Prompt 207: Create Embedding Pipeline

Implement the embedding generation pipeline.

Requirements:

Convert:

Curriculum chunks

↓

Vector embeddings


Store:

- Embeddings
- Metadata
- Source information

Prepare for semantic retrieval.

---

## Prompt 208: Select Embedding Model

Choose the best embedding model for INTERVUE AI.

Consider:

- Technical knowledge retrieval
- Semantic similarity
- Speed
- Accuracy
- Local execution

Explain the choice.

---

## Prompt 209: Build Vector Database Integration

Implement vector database integration.

Requirements:

Store:

- Embeddings
- Documents
- Metadata

Support:

- Insert
- Update
- Delete
- Search

Keep the system scalable.

---

## Prompt 210: Create Semantic Search System

Build semantic search for curriculum retrieval.

Input:

- Question topic
- Candidate answer
- Knowledge gap

Output:

- Relevant concepts
- Matching chunks
- Similarity scores

---

## Prompt 211: Implement Top-K Retrieval

Create Top-K retrieval logic.

Requirements:

Retrieve:

- Most relevant curriculum chunks
- Supporting concepts
- Source information

Allow configuration of:

- Number of results
- Similarity threshold

---

## Prompt 212: Add Similarity Score Calculation

Implement similarity scoring.

For every retrieval return:

- Chunk relevance
- Similarity percentage
- Ranking position

Use this data for explainable AI.

---

## Prompt 213: Build Context Assembly System

Create a context assembly module.

Combine:

- Retrieved knowledge
- Candidate profile
- Interview state
- Previous answers

Generate optimized AI context.

---

## Prompt 214: Connect RAG With Question Generator

Connect RAG retrieval with question generation.

Flow:

Candidate profile

↓

Retrieve relevant concepts

↓

Generate grounded question


Ensure questions are based on curriculum knowledge.

---

## Prompt 215: Connect RAG With Answer Evaluation

Connect RAG with answer evaluation.

Flow:

Candidate answer

↓

Retrieve expected concepts

↓

Compare answer

↓

Generate evaluation


Identify:

- Covered concepts
- Missing concepts
- Incorrect concepts

---

## Prompt 216: Create RAG Grounded Prompt Templates

Create prompt templates for RAG.

Templates:

- Question generation
- Answer evaluation
- Feedback generation
- Knowledge gap detection

Ensure prompts use retrieved context correctly.

---

## Prompt 217: Prevent RAG Hallucination

Improve hallucination prevention.

Requirements:

AI should:

- Use retrieved context
- Avoid unsupported claims
- Mention uncertainty
- Prefer curriculum evidence

Add validation where required.

---

## Prompt 218: Add RAG Metadata Tracking

Track metadata through the entire pipeline.

Store:

- Source document
- Topic
- Chunk ID
- Similarity score
- Retrieval timestamp

Use for analytics and reports.

---

## Prompt 219: Create RAG Explainability Panel

Create a RAG transparency section.

Display:

- User query
- Retrieved chunks
- Similarity scores
- Source concepts
- Context used by AI

Make retrieval understandable.

---

## Prompt 220: Build RAG Telemetry Dashboard

Create RAG monitoring dashboard.

Show:

- Total retrievals
- Retrieved chunks
- Average similarity
- Token usage
- Retrieval performance

Design like an AI operations dashboard.

---

## Prompt 221: Improve Retrieval Accuracy

Analyze retrieval quality.

Improve:

- Search strategy
- Ranking
- Filtering
- Context selection

Ensure AI receives the most useful information.

---

## Prompt 222: Add Concept Relationship Mapping

Create concept relationship mapping.

Connect:

- Topics
- Concepts
- Prerequisites
- Related skills

Use this for better question generation.

---

## Prompt 223: Create Knowledge Gap Retrieval

Implement knowledge gap based retrieval.

When candidate struggles:

Retrieve:

- Missing concepts
- Related explanations
- Follow-up topics

Use gaps to guide future questions.

---

## Prompt 224: Evaluate RAG Performance

Create RAG evaluation metrics.

Measure:

- Retrieval relevance
- Context quality
- Answer grounding
- Missing information

Generate a RAG quality report.

---

## Prompt 225: Complete RAG Pipeline Audit

Perform a complete RAG audit.

Verify:

Curriculum Data

↓

Processing

↓

Chunking

↓

Embeddings

↓

Vector Search

↓

Context Assembly

↓

AI Generation

↓

Evaluation


Check:

- Data correctness
- Retrieval quality
- Grounding
- Frontend visibility

Generate a complete RAG verification report.

------

# ADVANCED RAG DEVELOPMENT PROMPTS

## Prompt 226: Implement Hybrid Retrieval System

Improve the RAG retrieval system by implementing hybrid search.

Combine:

- Semantic vector search
- Keyword-based search
- Concept matching


The system should rank results using multiple signals.

Return:

- Retrieved chunks
- Ranking score
- Retrieval reason

---

## Prompt 227: Add Query Understanding Layer

Create a query understanding layer before retrieval.

The system should analyze:

- Interview question
- Candidate answer
- Current topic
- Difficulty level

Generate:

- Search query
- Important concepts
- Retrieval keywords

Use this to improve retrieval quality.

---

## Prompt 228: Create RAG Query Rewriter

Implement an AI query rewriting module.

Purpose:

Convert user/interview context into better retrieval queries.

Example:

Original:

"Explain indexing"

Improved:

"Database indexing structures, B-tree indexing, query optimization concepts"

Use rewritten queries for retrieval.

---

## Prompt 229: Add Context Ranking System

Create a context ranking system.

Rank retrieved chunks based on:

- Semantic similarity
- Topic relevance
- Difficulty match
- Candidate skill level
- Previous discussion


Return the highest quality context.

---

## Prompt 230: Implement Context Filtering

Create a context filtering layer.

Before sending context to the LLM:

Remove:

- Duplicate chunks
- Irrelevant information
- Low-quality sources
- Unrelated concepts

Keep only useful knowledge.

---

## Prompt 231: Optimize RAG Token Usage

Optimize RAG context size.

Requirements:

- Reduce unnecessary tokens
- Keep important concepts
- Maintain answer quality
- Improve response speed

Create a token budgeting strategy.

---

## Prompt 232: Add RAG Memory Integration

Connect RAG with Knowledge Twin memory.

Retrieval should consider:

- Candidate strengths
- Weak areas
- Previous mistakes
- Current learning stage

Personalize retrieved context.

---

## Prompt 233: Create Personalized Retrieval Strategy

Build candidate-aware retrieval.

Instead of retrieving only by question:

Use:

Question

+

Candidate knowledge state

+

Interview history

+

Difficulty level


Return personalized context.

---

## Prompt 234: Add Multi-Source RAG Support

Extend RAG to support multiple sources.

Sources:

- Curriculum
- Documentation
- Learning resources
- Internal knowledge


Track source information separately.

---

## Prompt 235: Create RAG Source Attribution

Add source attribution.

Every AI response should show:

- Source used
- Topic
- Retrieved concepts
- Similarity score

Make AI decisions traceable.

---

## Prompt 236: Implement Retrieval Cache

Add caching for RAG retrieval.

Cache:

- Frequently used concepts
- Previous queries
- Retrieved contexts


Improve response speed.

---

## Prompt 237: Add RAG Failure Handling

Handle RAG failures gracefully.

Cases:

- No relevant chunks found
- Vector search failure
- Empty context
- Invalid documents


Provide fallback behavior.

---

## Prompt 238: Create RAG Testing Framework

Create tests for RAG pipeline.

Test:

- Document loading
- Chunking
- Embeddings
- Retrieval
- Ranking
- Context generation

Ensure retrieval quality.

---

## Prompt 239: Evaluate Retrieval Quality

Create retrieval evaluation.

Measure:

- Precision
- Relevance
- Similarity accuracy
- Useful context percentage

Generate evaluation results.

---

## Prompt 240: Improve Embedding Storage

Optimize embedding storage.

Check:

- Storage format
- Metadata handling
- Retrieval speed
- Update strategy

Ensure scalability.

---

## Prompt 241: Add Incremental Knowledge Updates

Implement incremental RAG updates.

When new curriculum is added:

Only update:

- New documents
- New embeddings
- New metadata

Avoid rebuilding everything.

---

## Prompt 242: Create Curriculum Versioning

Add curriculum version management.

Track:

- Curriculum version
- Updated topics
- New concepts
- Retrieval changes

Maintain consistency.

---

## Prompt 243: Add RAG Debug Mode

Create a developer debug mode.

Show:

- Query
- Retrieved chunks
- Scores
- Context sent to AI
- Final response

Useful for debugging and demonstrations.

---

## Prompt 244: Create RAG Performance Dashboard

Build a RAG analytics dashboard.

Display:

- Retrieval count
- Average similarity
- Top concepts retrieved
- Failed retrievals
- Response grounding score

---

## Prompt 245: Connect RAG Analytics With Reports

Add RAG information to reports.

Include:

- Knowledge sources used
- Concepts retrieved
- Evidence supporting evaluation
- Retrieval confidence

Make reports explainable.

---

## Prompt 246: Improve AI Grounding Quality

Improve grounding between retrieval and generation.

Ensure:

AI answers are based on:

- Retrieved context
- Curriculum knowledge
- Candidate response

Reduce unsupported answers.

---

## Prompt 247: Add Semantic Concept Matching

Implement concept-level matching.

Instead of only matching text:

Match:

- Concepts
- Skills
- Technologies
- Learning objectives

Improve technical understanding.

---

## Prompt 248: Create Adaptive Retrieval Depth

Make retrieval depth dynamic.

If question is simple:

Retrieve less context.

If question is complex:

Retrieve more context.

Adjust based on difficulty level.

---

## Prompt 249: Add RAG Confidence Calculation

Create retrieval confidence scoring.

Calculate confidence using:

- Similarity score
- Number of matching concepts
- Source quality
- Retrieval consistency

Display confidence to users.

---

## Prompt 250: Final Advanced RAG System Audit

Perform a complete advanced RAG audit.

Verify:

Data ingestion

↓

Preprocessing

↓

Chunking

↓

Embeddings

↓

Vector storage

↓

Retrieval

↓

Ranking

↓

Context assembly

↓

AI generation


Check:

- Accuracy
- Performance
- Explainability
- Integration with interview engine

Generate final RAG readiness report.

------

# ADVANCED RAG ENGINEERING PROMPTS (CONTINUED)

## Prompt 251: Build Multi-Stage Retrieval Pipeline

Improve the RAG pipeline by adding multiple retrieval stages.

Pipeline:

Query Understanding

↓

Initial Retrieval

↓

Filtering

↓

Ranking

↓

Context Selection

↓

AI Generation


The goal is to improve retrieval accuracy and reduce irrelevant context.

---

## Prompt 252: Add Reranking Model

Implement a reranking layer after vector retrieval.

Current flow:

Query

↓

Vector Search

↓

Top Results


Improve:

Query

↓

Vector Search

↓

Reranker

↓

Best Context


Rank results based on deeper semantic relevance.

---

## Prompt 253: Improve Technical Concept Retrieval

Optimize retrieval specifically for technical interviews.

The system should understand:

- Programming concepts
- Frameworks
- Algorithms
- System design topics
- Engineering practices


Improve concept-level matching instead of simple keyword matching.

---

## Prompt 254: Create Hierarchical Knowledge Retrieval

Implement hierarchical retrieval.

Structure:

Domain

↓

Topic

↓

Concept

↓

Sub-concept

↓

Example


Use hierarchy to retrieve more accurate knowledge.

---

## Prompt 255: Add Topic-Aware Retrieval

Make retrieval aware of interview topics.

The retriever should consider:

- Current topic
- Previous questions
- Candidate expertise
- Interview stage


Avoid retrieving unrelated information.

---

## Prompt 256: Create Knowledge Graph Enhanced RAG

Enhance RAG using knowledge graph information.

Connect:

Concepts

↓

Relationships

↓

Prerequisites

↓

Related Topics


Use graph relationships to improve retrieval.

---

## Prompt 257: Add Conversation-Aware RAG

Make RAG aware of conversation history.

Use:

- Previous questions
- Previous answers
- Discussion context
- Candidate reasoning


Retrieve context based on the entire interview conversation.

---

## Prompt 258: Implement Long-Term Memory Retrieval

Connect long-term candidate memory with RAG.

Retrieve:

- Previous interview weaknesses
- Learning progress
- Past mistakes
- Improved concepts


Use memory to personalize future interviews.

---

## Prompt 259: Improve RAG Prompt Construction

Optimize prompts created from retrieved context.

Ensure prompts contain:

- Clear instructions
- Retrieved evidence
- Candidate information
- Evaluation criteria

Avoid unnecessary context.

---

## Prompt 260: Add Context Compression

Implement context compression.

Before sending data to the AI model:

- Remove repetition
- Summarize large chunks
- Keep important information

Maintain answer quality while reducing tokens.

---

## Prompt 261: Create Retrieval Quality Feedback Loop

Create a feedback loop for retrieval improvement.

After every answer:

Analyze:

- Was retrieved context useful?
- Did it improve evaluation?
- Was information missing?


Use feedback to improve retrieval.

---

## Prompt 262: Add Retrieval Confidence Threshold

Implement retrieval confidence thresholds.

Rules:

High confidence:

Use retrieved context directly.

Medium confidence:

Retrieve additional information.

Low confidence:

Request broader retrieval.

---

## Prompt 263: Create RAG Evaluation Dataset

Create a dataset to evaluate RAG quality.

Include:

- Questions
- Expected concepts
- Relevant documents
- Correct retrieval results

Use it for testing.

---

## Prompt 264: Benchmark RAG Performance

Create a RAG benchmark system.

Measure:

- Retrieval accuracy
- Response quality
- Latency
- Token usage
- Grounding score


Generate performance reports.

---

## Prompt 265: Improve Vector Search Performance

Optimize vector search.

Check:

- Index configuration
- Search parameters
- Storage structure
- Query performance


Improve retrieval speed.

---

## Prompt 266: Add Metadata Filtering

Improve retrieval using metadata filters.

Filter by:

- Topic
- Difficulty
- Role
- Technology
- Curriculum section


Combine filtering with semantic search.

---

## Prompt 267: Create Role-Based RAG Retrieval

Make retrieval role-aware.

Support:

- Frontend Engineer
- Backend Engineer
- AI Engineer
- Data Scientist


Retrieve role-specific knowledge.

---

## Prompt 268: Add Difficulty-Aware Retrieval

Make RAG difficulty aware.

Retrieval should consider:

Beginner:

Basic concepts

Intermediate:

Implementation details

Advanced:

Architecture and tradeoffs

---

## Prompt 269: Improve RAG Explainability

Improve RAG explanation.

Show:

Why this chunk was selected

Why this source is relevant

How it influenced AI decision

Make retrieval transparent.

---

## Prompt 270: Add Retrieval History Tracking

Track retrieval history.

Store:

- Queries
- Retrieved chunks
- Similarity scores
- AI decisions

Use for debugging and analytics.

---

## Prompt 271: Create RAG Monitoring System

Create monitoring for RAG.

Track:

- Retrieval failures
- Slow queries
- Low similarity results
- Incorrect context

Provide alerts.

---

## Prompt 272: Optimize RAG Cost and Efficiency

Optimize RAG resource usage.

Improve:

- Number of retrieved chunks
- Token usage
- Processing time
- Storage efficiency

Maintain accuracy.

---

## Prompt 273: Add Document Update Pipeline

Create automatic document update handling.

When curriculum changes:

- Detect updates
- Process new content
- Generate embeddings
- Update vector database

---

## Prompt 274: Create RAG Recovery Mechanism

Handle RAG failures.

Cases:

- Empty retrieval
- Missing documents
- Vector database failure
- Invalid embeddings


Provide fallback strategies.

---

## Prompt 275: Final Enterprise RAG Architecture Review

Perform a final enterprise-level RAG review.

Verify:

- Data pipeline
- Retrieval accuracy
- Ranking quality
- Context generation
- AI grounding
- Explainability
- Performance


Generate:

- RAG quality score
- Issues found
- Recommended improvements

------

# ADVANCED RAG ENGINEERING PROMPTS (CONTINUED)

## Prompt 276: Implement Agentic RAG Workflow

Convert the current RAG pipeline into an agentic RAG workflow.

The AI agent should decide:

- When retrieval is required
- What information to retrieve
- How much context is needed
- Whether additional retrieval is required

Create a reasoning-based retrieval process.

---

## Prompt 277: Add Retrieval Planning Agent

Create a retrieval planning agent.

Before searching the knowledge base, the agent should analyze:

- User question
- Interview context
- Candidate level
- Previous answers

Generate:

- Retrieval strategy
- Search terms
- Required knowledge areas

---

## Prompt 278: Create Autonomous Context Selection

Improve context selection using AI reasoning.

The system should decide:

- Which chunks are useful
- Which chunks should be ignored
- Which evidence supports evaluation

Avoid blindly passing retrieved documents.

---

## Prompt 279: Add Multi-Hop Retrieval

Implement multi-hop retrieval.

The system should retrieve information through multiple steps.

Example:

Question

↓

Main Concept

↓

Related Concepts

↓

Supporting Knowledge

↓

Final Context


Useful for complex technical questions.

---

## Prompt 280: Improve RAG For System Design Questions

Optimize RAG for system design interviews.

Retrieve:

- Architecture concepts
- Design patterns
- Scalability principles
- Trade-offs
- Engineering decisions

Generate deeper technical evaluations.

---

## Prompt 281: Improve RAG For Coding Questions

Optimize RAG for coding interviews.

Retrieve:

- Algorithms
- Data structures
- Complexity analysis
- Common approaches
- Edge cases

Use retrieved knowledge for evaluation.

---

## Prompt 282: Add RAG Based Follow-Up Generation

Use RAG for generating follow-up questions.

Flow:

Candidate Answer

↓

Identify missing concept

↓

Retrieve related knowledge

↓

Generate deeper question


Make follow-ups meaningful.

---

## Prompt 283: Create RAG-Based Interview Difficulty Adjustment

Connect retrieval with difficulty engine.

Use:

- Retrieved concept complexity
- Candidate performance
- Knowledge gaps

Adjust future question difficulty.

---

## Prompt 284: Add Semantic Similarity Analysis

Improve semantic comparison between:

Candidate answer

and

Expected concepts


Calculate:

- Concept similarity
- Missing information
- Coverage percentage

Use for evaluation.

---

## Prompt 285: Create Answer Grounding System

Build answer grounding verification.

Check:

- Is evaluation supported by retrieved context?
- Are concepts correctly identified?
- Is feedback evidence-based?

Prevent unsupported AI decisions.

---

## Prompt 286: Add RAG Citation System

Create citation tracking.

For every AI output store:

- Source
- Topic
- Retrieved chunk
- Similarity score

Display citations in reports.

---

## Prompt 287: Improve Retrieval With Metadata Intelligence

Enhance metadata usage.

Use metadata:

- Topic
- Difficulty
- Role
- Technology
- Learning stage

Improve retrieval precision.

---

## Prompt 288: Create RAG-Based Knowledge Gap Analyzer

Build a knowledge gap analyzer using RAG.

Analyze:

Candidate response

↓

Expected concepts

↓

Retrieved knowledge

↓

Missing concepts


Generate accurate gaps.

---

## Prompt 289: Implement Dynamic Top-K Retrieval

Make Top-K retrieval adaptive.

Rules:

Simple question:

Retrieve fewer chunks.

Complex question:

Retrieve more chunks.

Adjust automatically.

---

## Prompt 290: Add Context Quality Scoring

Create context quality scoring.

Evaluate retrieved context using:

- Relevance
- Completeness
- Accuracy
- Source quality

Return context confidence.

---

## Prompt 291: Create RAG Experiment Framework

Create a framework to test RAG improvements.

Compare:

- Different chunk sizes
- Different embeddings
- Different retrieval methods
- Different ranking strategies

Generate experiment results.

---

## Prompt 292: Improve Embedding Quality

Analyze embedding performance.

Check:

- Semantic understanding
- Technical concept matching
- Similar concept retrieval

Suggest improvements.

---

## Prompt 293: Add RAG Observability

Create complete RAG observability.

Track:

- Queries
- Retrieval time
- Retrieved documents
- Similarity scores
- Final AI usage

Make debugging easier.

---

## Prompt 294: Create RAG Debug Reports

Generate automatic RAG debug reports.

Include:

- Input query
- Retrieved results
- Ranking
- Context sent to AI
- Final output quality

---

## Prompt 295: Improve RAG Security

Audit RAG security.

Check:

- Unsafe documents
- Data leakage
- Prompt injection
- Malicious content

Add protection mechanisms.

---

## Prompt 296: Add Prompt Injection Protection

Protect RAG prompts.

Handle:

- Malicious instructions inside documents
- Fake system messages
- Incorrect retrieved content

Ensure AI follows application rules.

---

## Prompt 297: Create RAG Data Validation

Validate all RAG data.

Check:

- Missing fields
- Incorrect metadata
- Empty content
- Duplicate documents

Prevent bad retrieval results.

---

## Prompt 298: Implement RAG Version Control

Create version management for RAG data.

Track:

- Document versions
- Embedding versions
- Retrieval changes
- Curriculum updates

Maintain reproducibility.

---

## Prompt 299: Optimize RAG For Production

Prepare RAG system for production.

Improve:

- Reliability
- Speed
- Scalability
- Monitoring
- Error handling

Ensure enterprise readiness.

---

## Prompt 300: Final RAG Intelligence Review

Perform a complete final RAG intelligence review.

Verify:

Data ingestion

↓

Processing

↓

Chunking

↓

Embedding

↓

Vector database

↓

Retrieval

↓

Ranking

↓

Context assembly

↓

AI reasoning

↓

Evaluation


Generate:

- RAG architecture score
- Performance score
- Accuracy score
- Remaining improvements

------

# FINAL AI ENGINEERING, TESTING, DEPLOYMENT & SUBMISSION PROMPTS

## Prompt 301: Complete System Architecture Review

Perform a complete architecture review of INTERVUE AI.

Analyze:

- Frontend architecture
- Backend architecture
- AI engine
- RAG system
- Knowledge Twin
- Database
- Deployment structure

Check:

- Scalability
- Maintainability
- Production readiness

Provide improvement suggestions.

---

## Prompt 302: Full Codebase Understanding

Analyze the complete codebase.

Understand:

- Every major folder
- Important files
- Data flow
- Dependencies
- External integrations

Create a complete technical overview.

Do not modify code.

---

## Prompt 303: Production Code Quality Audit

Review the complete code quality.

Check:

- Clean architecture
- Naming conventions
- Duplicate code
- Unused files
- Maintainability
- Best practices

Suggest improvements.

---

## Prompt 304: Remove Unnecessary Code

Audit the repository.

Find:

- Unused components
- Dead code
- Unused imports
- Temporary files
- Debug code

Remove safely without breaking functionality.

---

## Prompt 305: Improve Application Reliability

Improve reliability of the application.

Handle:

- API failures
- AI failures
- Missing data
- Network issues
- Invalid states

The application should fail gracefully.

---

## Prompt 306: Complete API Testing

Test every backend API.

Verify:

- Request format
- Response format
- Error handling
- Data correctness
- Frontend integration

Generate API verification results.

---

## Prompt 307: Complete Frontend Testing

Test all frontend pages.

Verify:

- Navigation
- Components
- Buttons
- Forms
- Charts
- Loading states
- Error states

Fix all issues found.

---

## Prompt 308: AI Pipeline Testing

Test the complete AI workflow.

Flow:

Candidate Profile

↓

Interview Planning

↓

Question Generation

↓

Answer Evaluation

↓

Decision Engine

↓

Knowledge Twin Update

↓

Report Generation

Verify every step.

---

## Prompt 309: RAG Pipeline Testing

Test complete RAG functionality.

Verify:

- Data loading
- Chunking
- Embeddings
- Retrieval
- Ranking
- Context generation
- AI grounding

Ensure retrieval works correctly.

---

## Prompt 310: Add Automated Testing

Increase automated test coverage.

Add tests for:

- AI functions
- API routes
- RAG retrieval
- Data processing
- State management

Ensure important workflows are covered.

---

## Prompt 311: Improve Error Messages

Improve all error messages.

Requirements:

- Clear explanation
- Helpful solution
- Professional wording

Avoid technical errors being shown directly to users.

---

## Prompt 312: Improve User Experience Flow

Review complete user journey.

Flow:

Landing page

↓

Dashboard

↓

Interview

↓

Analytics

↓

Report


Improve:

- Navigation
- Clarity
- User guidance
- Transitions

---

## Prompt 313: Final UI Design Audit

Audit complete UI.

Check:

- Typography
- Colors
- Spacing
- Animations
- Cards
- Consistency

Make every page feel like one premium AI product.

---

## Prompt 314: Improve Premium AI Feel

Upgrade the application visual quality.

Add:

- Better animations
- Better interactions
- Better visual hierarchy
- Better micro-interactions

Maintain professional design.

---

## Prompt 315: Optimize 3D Experience

Improve 3D elements.

Check:

- Performance
- Loading speed
- Visual quality
- User experience

Avoid unnecessary complexity.

---

## Prompt 316: Responsive Design Audit

Check responsiveness.

Test:

- Desktop
- Tablet
- Mobile

Fix:

- Overflow
- Broken layouts
- Text issues
- Component alignment

---

## Prompt 317: Accessibility Audit

Improve accessibility.

Check:

- Keyboard navigation
- Color contrast
- Labels
- Screen reader support
- Font readability

---

## Prompt 318: Security Audit

Perform complete security review.

Check:

- API keys
- Environment variables
- Authentication
- User data
- Backend exposure

Fix security issues.

---

## Prompt 319: Performance Optimization

Optimize application performance.

Check:

- Bundle size
- Rendering
- API speed
- Database queries
- AI processing time

Improve overall speed.

---

## Prompt 320: Deployment Preparation

Prepare application for deployment.

Check:

- Environment variables
- Build configuration
- Dependencies
- Production settings

Ensure successful deployment.

---

## Prompt 321: Vercel Deployment Audit

Prepare INTERVUE AI for Vercel.

Verify:

- Next.js configuration
- API routes
- Build process
- Environment variables

Fix deployment issues.

---

## Prompt 322: Create Production README

Create a professional README.

Include:

- Project overview
- Features
- Architecture
- Tech stack
- Installation
- Usage
- Screenshots
- Future roadmap

Make it GitHub ready.

---

## Prompt 323: Create Technical Documentation

Create developer documentation.

Include:

- Folder structure
- API documentation
- AI workflow
- RAG pipeline
- Data flow

---

## Prompt 324: Create Hackathon Presentation Content

Create presentation content.

Include:

- Problem
- Solution
- Innovation
- Architecture
- Demo flow
- Impact

Make it judge-focused.

---

## Prompt 325: Create Demo Script

Create a live demo script.

Flow:

Problem explanation

↓

Landing page

↓

Start interview

↓

AI interaction

↓

Evaluation

↓

Analytics

↓

Final report


Make it impressive.

---

## Prompt 326: Prepare Judge Questions

Generate possible judge questions.

Include:

- Technical questions
- AI questions
- RAG questions
- Scalability questions
- Business questions

Provide strong answers.

---

## Prompt 327: Improve Hackathon Pitch

Improve the final pitch.

Make it:

- Short
- Clear
- Impactful
- Technical

Highlight AI innovation.

---

## Prompt 328: Create Product Roadmap

Create future roadmap.

Include:

Phase 1:

Hackathon MVP

Phase 2:

Student platform

Phase 3:

Enterprise hiring solution

Phase 4:

AI career intelligence platform

---

## Prompt 329: Business Model Analysis

Analyze business potential.

Define:

- Target customers
- Pricing strategy
- Market opportunity
- Revenue model

---

## Prompt 330: Competitive Analysis

Compare INTERVUE AI with existing solutions.

Compare:

- Features
- AI capability
- Personalization
- Explainability
- Market advantage

---

## Prompt 331: Final Innovation Review

Evaluate innovation level.

Analyze:

- AI uniqueness
- Technical complexity
- User impact
- Market potential

Provide score.

---

## Prompt 332: Final Bug Hunt

Perform a complete bug hunt.

Check:

- UI bugs
- API bugs
- AI issues
- Data issues
- Deployment issues

Fix everything possible.

---

## Prompt 333: Final Build Verification

Run:

npm run build

Verify:

- No errors
- No warnings
- All routes working
- Production ready

---

## Prompt 334: Final Test Verification

Run:

npm test

Verify:

- All tests passing
- No failures
- Stable application

---

## Prompt 335: Complete End-To-End Verification

Verify complete flow:

User

↓

Frontend

↓

API

↓

Backend

↓

AI Engine

↓

RAG

↓

Knowledge Twin

↓

Analytics

↓

Report


Generate verification report.

---

## Prompt 336: Create Final Audit Report

Generate final technical audit.

Include:

- System status
- Components verified
- Issues fixed
- Performance
- Production score

---

## Prompt 337: Review Git Repository

Audit GitHub repository.

Check:

- Commit history
- Branch status
- README
- Files
- Secrets

Prepare for public repository.

---

## Prompt 338: Prepare Final Git Commit

Review changes.

Run:

git status

git add .

git commit

git push


Create a clean final commit.

---

## Prompt 339: Final Repository Cleanup

Clean repository.

Remove:

- Temporary files
- Logs
- Debug files
- Unnecessary assets

Keep professional structure.

---

## Prompt 340: Create Project Showcase

Create showcase content.

Include:

- Project description
- Key features
- Technology stack
- AI innovation
- Demo explanation

---

## Prompt 341: Create LinkedIn Post

Create a professional LinkedIn announcement.

Include:

- Problem
- Solution
- Technologies
- AI features
- Learning experience

---

## Prompt 342: Create Portfolio Description

Create portfolio description.

Make it suitable for:

- Resume
- LinkedIn
- GitHub
- Personal website

---

## Prompt 343: Create Interview Explanation

Prepare explanation for technical interviews.

Explain:

- Why this project
- Architecture
- AI implementation
- RAG pipeline
- Challenges solved

---

## Prompt 344: Final AI Project Evaluation

Act as an AI expert reviewer.

Evaluate:

- Innovation
- Technical depth
- UI quality
- AI implementation
- Production readiness

Provide final rating.

---

## Prompt 345: Improve Remaining Weak Areas

Analyze the project score.

Identify:

- Weak areas
- Missing features
- Improvements

Implement high-impact improvements.

---

## Prompt 346: Final Production Checklist

Create final checklist.

Verify:

Frontend ✓

Backend ✓

AI ✓

RAG ✓

Testing ✓

Deployment ✓

Documentation ✓

---

## Prompt 347: Final Hackathon Submission Review

Review project as a hackathon judge.

Answer:

Would this qualify for top projects?

Why?

What can improve ranking?

---

## Prompt 348: Create Final Project Summary

Create complete project summary.

Include:

- Vision
- Features
- Architecture
- AI workflow
- Impact

---

## Prompt 349: Final Quality Score

Give final score for:

- UI
- Backend
- AI
- RAG
- Innovation
- Presentation

Provide improvement suggestions.

---

## Prompt 350: Final INTERVUE AI Completion Prompt

Perform the final review of INTERVUE AI.

Confirm:

- All features working
- AI pipeline connected
- RAG operational
- Reports generated
- Deployment ready

Prepare the project for final submission.

------

# FINAL ADVANCED AI ENGINEERING PROMPTS (351 - 377)

## Prompt 351: Complete System Dependency Audit

Audit all project dependencies.

Check:

- Outdated packages
- Security vulnerabilities
- Unused dependencies
- Version conflicts

Recommend improvements without breaking the application.

---

## Prompt 352: Improve Application Startup Time

Optimize application startup performance.

Check:

- Initial loading
- Component rendering
- API initialization
- AI service connection

Reduce unnecessary startup delays.

---

## Prompt 353: Add Application Monitoring

Implement application monitoring.

Track:

- Errors
- API performance
- AI response time
- User actions
- System health

Create useful monitoring information.

---

## Prompt 354: Improve Backend Architecture

Review backend architecture.

Check:

- Controllers
- Services
- Routes
- Utilities
- Business logic separation

Refactor for better scalability.

---

## Prompt 355: Improve AI Module Organization

Review AI module structure.

Organize:

- Candidate profiler
- Question generator
- Evaluator
- Decision engine
- Memory system

Make AI modules independent and maintainable.

---

## Prompt 356: Create AI Service Layer

Create a dedicated AI service layer.

Responsibilities:

- Model communication
- Prompt handling
- Response validation
- Error handling
- Retry logic

Keep AI integration clean.

---

## Prompt 357: Improve Prompt Management System

Create a centralized prompt management system.

Store:

- Question generation prompts
- Evaluation prompts
- Feedback prompts
- Decision prompts

Make prompts easy to update.

---

## Prompt 358: Add AI Response Schema Validation

Validate all AI responses.

Check:

- Required fields
- Correct data types
- Score ranges
- Decision values

Prevent invalid outputs.

---

## Prompt 359: Improve AI Retry Strategy

Implement AI retry handling.

Handle:

- Timeout
- Invalid response
- Model failure
- API errors

Use intelligent retry logic.

---

## Prompt 360: Add Interview Session Analytics

Track detailed interview analytics.

Store:

- Time spent
- Questions answered
- Topic performance
- Difficulty changes
- AI decisions

Use for future improvements.

---

## Prompt 361: Improve Candidate Experience

Analyze the complete candidate experience.

Improve:

- Interview flow
- Feedback quality
- Report clarity
- User confidence

Make the platform candidate-friendly.

---

## Prompt 362: Create AI Interview Personality

Improve AI interviewer personality.

Define:

- Communication style
- Professional tone
- Feedback behavior
- Question style

Make interaction more realistic.

---

## Prompt 363: Add Voice Interview Support Planning

Design future voice interview support.

Include:

- Speech recognition
- Voice response
- AI voice generation
- Real-time conversation

Create future architecture.

---

## Prompt 364: Improve Real-Time Experience

Improve real-time interactions.

Optimize:

- Response streaming
- Status updates
- Animations
- User feedback

Make AI interaction feel immediate.

---

## Prompt 365: Add Feature Flag System

Create feature flags.

Allow enabling/disabling:

- Experimental AI features
- New UI components
- Beta functionality

Improve development workflow.

---

## Prompt 366: Improve Configuration Management

Review application configuration.

Organize:

- Environment variables
- Constants
- AI settings
- Feature settings

Keep configuration clean.

---

## Prompt 367: Add Backup and Recovery Strategy

Create data recovery strategy.

Protect:

- Interview sessions
- Reports
- Candidate progress
- Knowledge Twin data

Define recovery process.

---

## Prompt 368: Improve Database Performance

Optimize database operations.

Check:

- Queries
- Indexing
- Data structure
- Storage strategy

Improve response time.

---

## Prompt 369: Create API Documentation

Generate complete API documentation.

Include:

- Endpoints
- Methods
- Parameters
- Responses
- Error cases

Make it developer friendly.

---

## Prompt 370: Improve Open Source Readiness

Prepare repository for public release.

Check:

- Documentation
- Folder structure
- Setup process
- Contribution guidelines

Make it professional.

---

## Prompt 371: Create Contribution Guide

Create CONTRIBUTING.md.

Include:

- Development setup
- Branch strategy
- Commit rules
- Pull request process

---

## Prompt 372: Improve Repository Presentation

Improve GitHub repository appearance.

Add:

- Better README
- Screenshots
- Architecture diagrams
- Demo information
- Feature highlights

Make it attractive.

---

## Prompt 373: Create Demo Screenshots

Prepare professional screenshots.

Capture:

- Landing page
- Dashboard
- Interview page
- Analytics
- Report

Make them suitable for GitHub and LinkedIn.

---

## Prompt 374: Create Project Trailer Script

Create a short product demo script.

Include:

- Problem introduction
- Product walkthrough
- AI capabilities
- Final impact

Keep it engaging.

---

## Prompt 375: Final Judge Perspective Review

Act as a hackathon judge.

Review INTERVUE AI.

Evaluate:

- Innovation
- Technical complexity
- AI usage
- User experience
- Demo quality

Provide ranking probability.

---

## Prompt 376: Final Improvement Recommendations

Analyze the complete project.

Find the highest impact improvements.

Prioritize:

- Features
- UI improvements
- AI improvements
- Performance improvements

Only suggest changes with strong value.

---

## Prompt 377: Final Project Completion Confirmation

Perform final completion verification.

Confirm:

✓ Frontend completed  
✓ Backend completed  
✓ AI engine completed  
✓ RAG completed  
✓ Knowledge Twin completed  
✓ Analytics completed  
✓ Reports completed  
✓ Testing completed  
✓ Deployment completed  

Generate the final project completion report.

---
