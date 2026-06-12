# Cognity — SDK Reference

## Installation
Paste this one line before the closing `</body>` tag of your product:

```html
<script src="https://cdn.jsdelivr.net/npm/@cognity/sdk/dist/index.js"
        data-key="org_live_YOUR_API_KEY"
        async></script>
```

That's it. The Cognity chat widget will appear automatically.

## How It Works

### 1. Initialisation
On load, the SDK reads the `data-key` attribute, creates or resumes a session via the API,
and renders the chat widget using Shadow DOM (isolated from your product's CSS).

### 2. Session Management
Sessions are persisted in `localStorage` by session ID. If the user refreshes or navigates,
the same session is resumed — conversation history is maintained.

### 3. Widget
- Renders as a chat bubble in the bottom-right corner
- Opening message fetched from the API on session start
- Responses stream token-by-token via Server-Sent Events
- All styles scoped inside Shadow DOM — zero CSS conflicts with your product

### 4. Activity Tracking
The SDK automatically tracks:
- `page_view` — on every client-side navigation
- `idle` — after 45 seconds of no mouse/keyboard activity on the same page
- `activation` — call `window.cognity.activate('event_name')` when user completes setup

### 5. Stuck Detection
When an `idle` event is sent, the API checks if the user needs a nudge.
If so, the widget opens automatically and shows a contextual help message.

## Manual Activation Trigger
Call this from your product code when the user completes the activation goal:

```javascript
window.dispatchEvent(new CustomEvent('cognity:activate', { detail: { goal_event: 'bot_created' } }))
```

## File Structure
```
packages/sdk/src/
├── index.ts      # Entry point, bootstraps everything
├── session.ts    # Create/resume session via API
├── widget.ts     # Shadow DOM chat UI
├── tracker.ts    # Page view + idle detection
├── stream.ts     # SSE streaming response handler
└── types.ts      # TypeScript type definitions
```
