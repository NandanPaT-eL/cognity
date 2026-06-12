# Cognity — Database Schema

**Database:** PostgreSQL 15 (Neon.tech)  
**ORM:** Drizzle ORM  
**Convention:** UUID primary keys, timestamptz timestamps, snake_case columns

---

## organizations
Stores each SaaS company using Cognity.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto-generated |
| name | text NOT NULL | company name |
| plan | text DEFAULT 'free' | free / beta / paid |
| api_key | text UNIQUE | SDK auth key |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## activation_goals
The one action that means a user is activated, defined per org.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK → organizations | cascades on delete |
| event_name | text | e.g. 'bot_created' |
| description | text | human-readable label |
| created_at | timestamptz | |

---

## documents
Files uploaded by SaaS companies for RAG.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| file_name | text | original filename |
| file_url | text | Uploadthing CDN URL |
| parsed_text | text | extracted plain text |
| embedding_status | text | pending/processing/done/failed |
| chunk_count | integer | number of vectors stored |
| created_at | timestamptz | |

---

## chat_sessions
One session per end user per visit.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| end_user_id | text | SHA-256 hashed anonymous ID |
| goal_text | text | user's first message |
| status | text | active/completed/abandoned |
| activated_at | timestamptz | set when activation event fires |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## messages
All chat messages in a session.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| session_id | uuid FK → chat_sessions | cascades on delete |
| role | text | user / assistant |
| content | text | message body |
| created_at | timestamptz | |

---

## activity_events
User activity tracking — page views, idle events, activations.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| session_id | uuid FK → chat_sessions | |
| org_id | uuid FK → organizations | for fast analytics queries |
| event_type | text | page_view/idle/activation/custom |
| page_path | text | URL path |
| metadata | jsonb | flexible extra data |
| created_at | timestamptz | |

---

## Indexes (recommended for V1)
```sql
CREATE INDEX idx_sessions_org_id ON chat_sessions(org_id);
CREATE INDEX idx_sessions_status ON chat_sessions(org_id, status);
CREATE INDEX idx_events_org_type ON activity_events(org_id, event_type);
CREATE INDEX idx_events_session ON activity_events(session_id);
CREATE INDEX idx_messages_session ON messages(session_id, created_at DESC);
```
