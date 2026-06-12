# Cognity — Forward Deployment Engineer (FDE) Runbook

This is the step-by-step playbook for onboarding each beta customer.
Nandan runs this for every new SaaS company during the beta phase.

---

## Before the Call — Prep (15 min)

- [ ] Read their website and understand their product
- [ ] Identify their likely activation event (first bot created? first workflow? first report?)
- [ ] Note where their onboarding probably breaks down based on product complexity
- [ ] Create their org in Cognity dashboard and have the install snippet ready

---

## Step 1 — Discovery Call (30 min)

**Goal:** Understand their product and define their activation goal.

Questions to ask:
1. "Walk me through what a new user does in your product in the first 10 minutes."
2. "What is the one moment when a user has successfully set up and seen value?"
3. "Where do users most commonly get confused or drop off?"
4. "Do you have product documentation, help articles, or onboarding guides?"

**Output:** A clear activation goal (e.g. `bot_created`, `workflow_published`) and a documentation file to upload.

---

## Step 2 — Configure Cognity (you do this — 30 min)

- [ ] Log into Cognity dashboard with their org
- [ ] Upload their documentation (PDF or paste as text)
- [ ] Wait for embedding status to show `done`
- [ ] Set activation goal: event name + description
- [ ] Customise opening message to match their product tone

Example opening messages:
- "Welcome to [Product]! What are you trying to build today?"
- "Hi! I'm here to help you get set up. What's your main goal?"

---

## Step 3 — Deploy SDK (with them on screenshare — 15 min)

- [ ] Share their install snippet: `<script src="..." data-key="org_live_xxx" async></script>`
- [ ] Guide them to paste it before `</body>` in their product
- [ ] If they use Next.js: paste in `_document.tsx` or `layout.tsx`
- [ ] If they use React: paste in `index.html`
- [ ] Verify widget appears on their staging environment
- [ ] Check browser console for any errors

---

## Step 4 — Test Together (1 hour)

- [ ] Open their product as a new user in an incognito window
- [ ] Confirm opening message appears
- [ ] Type a realistic user goal and confirm AI response is relevant
- [ ] Navigate to a setup page and wait 45 seconds — confirm nudge fires
- [ ] Complete the activation goal — confirm session shows as activated in dashboard
- [ ] Review analytics together — confirm data is flowing

Adjustments to make live:
- Tweak opening message if it doesn't match their tone
- Re-upload better documentation if AI responses are off
- Adjust activation goal event name if needed

---

## Step 5 — Go Live

- [ ] Move install snippet from staging to production
- [ ] Confirm widget live on production
- [ ] Share dashboard login with their team
- [ ] Set up weekly 15-minute check-in for first month

---

## Step 6 — Week 1-4 Monitoring

Check their dashboard every 2 days and proactively message them:

**Example message:**
> "Hey [Name] — just checked your Cognity dashboard. 8 users got stuck on the /connect-datasource page this week.
> I've updated the guidance for that step — should be smoother now. Let me know if you want to jump on a call."

Track and report back:
- Activation rate this week vs last week
- Top stuck pages (and whether they improved)
- Any AI responses that seem wrong or off-topic

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Widget not appearing | Check `data-key` is correct, check browser console for errors |
| AI responses irrelevant | Re-upload better documentation, check embedding status is `done` |
| Nudge not firing | Confirm idle threshold — user must be inactive for 45 seconds |
| Session not persisting | Check localStorage is enabled in their product (some restrict it) |
| CORS error in console | Add their production domain to the org's allowed origins in dashboard |
