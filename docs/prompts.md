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