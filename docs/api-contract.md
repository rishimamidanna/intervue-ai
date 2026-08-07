# INTERVUE — API Contract

## OFFICIAL HACKATHON API

The primary evaluator-facing endpoint exposed by INTERVUE is:

```http
POST /api/interview
```

This single endpoint handles both interview initialization (**Start Request**) and ongoing interview responses (**Conversation Request**).

---

### 1. START REQUEST

Initializes a new adaptive interview session for a candidate.

**Request Payload:**
```json
{
  "sessionId": "abc-123",
  "candidate": {
    "member": {
      "id": "c101",
      "name": "Jane Doe",
      "jobRole": "AI Engineer",
      "yearsExperience": 2,
      "education": "BS Computer Science",
      "status": "Active"
    },
    "missions": [
      {
        "day": 1,
        "title": "RAG Implementation",
        "passed": true,
        "attempts": 1
      }
    ],
    "signals": {
      "commitDays": 30,
      "missionsCompleted": 25,
      "missionsFirstTry": 20
    }
  }
}
```

**In-Progress Response (200 OK):**
```json
{
  "reply": "Welcome Jane. Let's begin with Vector Databases. How do you handle high-dimensional vector index scaling?",
  "done": false
}
```

---

### 2. CONVERSATION REQUEST

Submits a candidate's turn response during an active interview session.

**Request Payload:**
```json
{
  "sessionId": "abc-123",
  "message": "We can use HNSW or IVF index quantization in Milvus/Qdrant to trade off precision for lower memory overhead and search latency."
}
```

**In-Progress Response (200 OK):**
```json
{
  "reply": "Good. What happens when your vector embeddings exhibit significant distribution drift over time?",
  "done": false
}
```

---

### 3. COMPLETED RESPONSE

Returned when completion criteria are met (at least **8 questions** asked across at least **4 distinct curriculum days**).

**Completed Response (200 OK):**
```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "Demonstrated strong applied RAG engineering knowledge with high proficiency in vector indexing and prompt engineering.",
    "strengths": [
      "Vector Databases: Excellent understanding of HNSW vs IVF indexing trade-offs",
      "Agentic AI: Clear articulation of tool-calling loop state machines"
    ],
    "gaps": [
      "MCP Protocol: Needs deeper review of JSON-RPC transport constraints on Day 18"
    ],
    "next": [
      "MCP Protocol: Revisit Day 18 server transport lab exercises"
    ]
  }
}
```

**Error Responses:**
- `400` — Invalid request format or missing required fields (`sessionId`, `candidate`, or `message`)
- `404` — Session not found
- `500` — Internal server error

---

## INTERNAL DEVELOPMENT API (HELPERS)

For local UI development, the following internal endpoints are also available:

- `POST /api/interview/start` — Internal start route helper
- `POST /api/interview/answer` — Internal answer turn helper
- `GET /api/interview/report?sessionId=<id>` — Internal rich feedback report helper
