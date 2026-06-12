# Cognity — API Reference

**Base URL:** `https://api.cognity.ai/v1`  
**Auth (SDK routes):** `Authorization: Bearer <org_api_key>`  
**Auth (Dashboard routes):** Clerk JWT via `x-org-id` header

---

## Sessions

### POST /sessions
Create a new user session.

**Request**
```json
{ "end_user_id": "sha256-hash", "page_path": "/dashboard", "metadata": {} }
```
**Response 201**
```json
{ "session_id": "uuid", "opening_message": "Welcome! What are you trying to achieve today?", "status": "active" }
```

### GET /sessions/:id
Get current session state.

**Response 200**
```json
{ "session_id": "uuid", "status": "active", "goal_text": "Build a support bot", "activated_at": null }
```

---

## Messages

### POST /sessions/:id/messages
Send a message and receive a streaming AI response (SSE).

**Request**
```json
{ "content": "I want to build a customer support bot" }
```
**Response:** `text/event-stream`
```
data: {"delta": "Perfect! Let"}
data: {"delta": "'s start by"}
data: {"done": true, "message_id": "uuid"}
```
**Rate limit:** 30 requests/session/minute

---

## Events

### POST /sessions/:id/events
Track user activity. Returns a nudge if user is stuck.

**Request**
```json
{ "event_type": "idle", "page_path": "/setup/connect", "idle_seconds": 45 }
```
**Response 200**
```json
{ "received": true, "nudge": "Looks like you might be stuck here. Want help?" }
```
Event types: `page_view` | `idle` | `activation` | `custom`  
**Rate limit:** 60 requests/session/minute

---

## Documents

### POST /documents
Upload documentation file (multipart/form-data). Triggers async embedding job.

**Response 201**
```json
{ "document_id": "uuid", "file_name": "docs.pdf", "embedding_status": "pending" }
```

### GET /documents
List all documents for the organisation.

**Response 200**
```json
{ "documents": [{ "id": "uuid", "file_name": "docs.pdf", "embedding_status": "done", "chunk_count": 42 }] }
```

---

## Analytics

### GET /analytics/overview
Get activation overview for the organisation.

**Response 200**
```json
{
  "total_sessions": 143,
  "activated_sessions": 89,
  "activation_rate": 0.623,
  "top_stuck_pages": [
    { "page_path": "/setup/connect", "idle_count": 34 }
  ]
}
```

---

## Error Responses

| Code | Meaning |
|------|---------|
| 400 | Bad request — invalid body |
| 401 | Invalid or missing API key / JWT |
| 404 | Resource not found |
| 429 | Rate limit exceeded — check Retry-After header |
| 500 | Internal server error |
