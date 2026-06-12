# Cognity — Product Requirements Document (PRD)

## Overview
Cognity is an AI onboarding assistant for SaaS companies. It helps new users get started
faster through natural conversation, step-by-step guidance, and proactive stuck-user detection.

**Version:** 1.0  
**Status:** In Development  
**Authors:** Nandan Patel (Tech), Aylin Toopchi (Business & Design)

---

## Problem Statement
Most SaaS users churn before they ever see value. Generic product tours are skipped.
Users get confused, open support tickets, or leave. Cognity solves this by replacing
static tours with a real conversation that guides each user to their specific goal.

---

## Goals for V1
- Ship a working beta to 3-5 SaaS companies
- Users who interact with Cognity complete setup at a higher rate than those who do not
- SaaS companies can see activation data in the dashboard

---

## User Stories

### End User (inside a SaaS product)
- As a new user, I want to be asked what I want to achieve so I get relevant guidance
- As a new user, I want step-by-step help through setup so I don't get lost
- As a stuck user, I want to be offered help automatically so I don't have to open a support ticket

### SaaS Company (Cognity customer)
- As a SaaS founder, I want to install Cognity with one line of code
- As a SaaS founder, I want to upload my documentation so Cognity learns my product
- As a SaaS founder, I want to define what activation means for my users
- As a SaaS founder, I want to see how many users activated and where they got stuck

---

## Features — V1 Scope

| # | Feature | Priority |
|---|---------|----------|
| 1 | JavaScript SDK install snippet | P0 |
| 2 | Chat widget (text only, no voice) | P0 |
| 3 | Session creation and resumption | P0 |
| 4 | Streaming AI responses via Gemini | P0 |
| 5 | Document upload + RAG pipeline | P0 |
| 6 | Stuck-user detection (45s idle) | P0 |
| 7 | Activation goal configuration | P0 |
| 8 | Analytics dashboard | P1 |
| 9 | SaaS company auth via Clerk | P0 |

---

## Out of Scope for V1
- Voice assistant
- Pre-signup visitor engagement
- Churn prediction
- Multi-language support
- Mobile SDK
- Self-serve billing

---

## Acceptance Criteria

### Chat Widget
- [ ] Widget appears as chat bubble bottom-right on host product
- [ ] Opening message appears on first load
- [ ] User can type and receive streaming responses
- [ ] Widget survives page navigation without losing session

### Stuck Detection
- [ ] Idle event fires after 45 seconds of inactivity
- [ ] Nudge message appears in widget automatically
- [ ] Nudge is contextual to current page

### Analytics
- [ ] Total sessions, activated sessions, activation rate visible
- [ ] Top stuck pages listed with idle counts
- [ ] Data refreshes on page load

---

## Success Metrics for Beta
- Activation rate with Cognity vs without: target 20% improvement
- Support ticket reduction: target 15% reduction reported by beta customers
- Time-to-activate: target 25% faster with Cognity
