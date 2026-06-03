# Workflow: AI Lead Qualifier

This document defines the end-to-end lead qualification workflow. It is the authoritative source of truth for how this system works. Any changes to AI behavior, form fields, or output format must be reflected here first, then implemented in code.

---

## Purpose

Qualify inbound leads quickly and consistently using AI. The goal is to score each lead on a 0–100 scale, categorize them into a tier (hot / warm / cold / disqualified), and produce a human-readable summary with a recommended next action — all within seconds of form submission.

---

## Actors

| Actor | Role |
|-------|------|
| User (sales/marketing) | Fills out the lead form with information about a prospect |
| Claude Code (Agent) | Builds and maintains this system |
| Trigger.dev task | Runs the AI qualification logic in the background |
| Anthropic Claude (`claude-sonnet-4-6`) | The AI model that scores and analyzes the lead |

---

## Workflow Steps

### 1. Lead Data Entry

The user opens the frontend at `https://<vercel-url>` and fills out the Lead Form (`LeadForm.tsx`).

Required fields:
- **Company Name** — the prospect's company
- **Contact Name** — the person who reached out
- **Email** — contact email address

Optional but high-signal fields:
- **Budget** — stated budget range (e.g. "$10k–$50k/month")
- **Use Case** — free-text description of what they want to accomplish (2–3 sentences minimum recommended)
- **Timeline** — when they want to start or go live (e.g. "Within 30 days", "Q3 2026")
- **Team Size** — number of people at the company (e.g. "11–50", "51–200")
- **Current Tools** — what they are using today that this might replace or complement
- **Decision Maker** — checkbox: is this person the final decision maker?

The form validates required fields client-side before submission.

### 2. Form Submission → API Route

On "Analyze" click, the form `POST`s the lead payload as JSON to:

```
POST /api/qualify
Content-Type: application/json
```

The Next.js API Route Handler (`frontend/app/api/qualify/route.ts`) runs server-side and:
1. Parses and validates the request body.
2. Calls `tasks.trigger("qualify-lead", leadPayload)` via `@trigger.dev/sdk` to enqueue the task.
3. Creates a scoped public access token for this specific run.
4. Returns `{ runId, publicAccessToken }` to the browser.

The `TRIGGER_SECRET_KEY` is used here — it never leaves the server.

### 3. Background Task Execution (Trigger.dev)

The `qualify-lead` task (`trigger/qualify-lead.ts`) executes on Trigger.dev Cloud:

1. **Receive payload** — the full `LeadPayload` object from the form.
2. **Set initial metadata** — `metadata.set("status", "analyzing")` so the frontend can show a loading state.
3. **Build prompt** — interpolate lead fields into the prompt template defined in `workflows/prompts/qualify-lead.md`.
4. **Call Claude** — send the prompt to `claude-sonnet-4-6` via the Anthropic SDK.
5. **Update metadata** — set `metadata.set("status", "scoring")` partway through to signal progress.
6. **Parse response** — extract the structured JSON from Claude's response (score, tier, summary, strengths, concerns, recommendation, confidence).
7. **Return result** — the task returns the `QualificationResult` object as its output.

### 4. Realtime Result Display

While the task runs, the frontend (`QualificationResult.tsx`) is subscribed to the run via `useRealtimeRun` from `@trigger.dev/react-hooks`:

- **Queued / Executing** → show a "Analyzing lead..." skeleton/spinner, optionally showing `run.metadata.status`.
- **Completed** → render the full result UI:
  - Score badge (0–100) with color-coded tier (hot = green, warm = yellow, cold = blue, disqualified = red)
  - Summary paragraph
  - Strengths list (green checkmarks)
  - Concerns list (orange warnings)
  - Recommendation callout (bold, action-oriented)
  - Confidence indicator
- **Failed** → show an error state with a retry option.

---

## Output Schema

The `qualify-lead` task returns a `QualificationResult`:

```typescript
type QualificationResult = {
  score: number;           // Integer 0–100
  tier: "hot" | "warm" | "cold" | "disqualified";
  summary: string;         // 2–3 sentences, plain English
  strengths: string[];     // 1–5 positive signals from the lead data
  concerns: string[];      // 1–5 risk factors or missing information flags
  recommendation: string;  // Suggested next action (e.g. "Schedule a demo this week")
  confidence: number;      // Float 0–1; model's confidence in this assessment
};
```

**Tier mapping:**

| Score | Tier |
|-------|------|
| 80–100 | hot |
| 60–79 | warm |
| 40–59 | cold |
| 0–39 | disqualified |

---

## Scoring Rubric

See the full rubric in `workflows/prompts/qualify-lead.md`. Summary:

| Signal | Max Points | Notes |
|--------|-----------|-------|
| Budget clearly stated and realistic | 25 | Vague or no budget = 0–5 pts |
| Decision maker confirmed | 20 | "Maybe" or unclear = 5–10 pts |
| Specific use case with clear pain | 20 | Generic use case = 0–5 pts |
| Timeline defined (< 90 days) | 15 | No timeline = 0 pts |
| Team size and current tools provided | 10 | Partial info = 5 pts |
| Contact information complete | 10 | Missing email = 0 pts |
| **Total** | **100** | |

---

## Edge Cases

| Scenario | Behavior |
|----------|---------|
| Required fields missing | Client-side validation blocks submission |
| Trigger.dev task fails | `run.status === "FAILED"` → frontend shows error with retry |
| Claude returns malformed JSON | Task retries up to 3 times; if all fail, task fails with error details |
| User submits twice | Each submission creates a new independent run |
| Extremely long use case text | Truncate at 2,000 characters before sending to Claude |

---

## Future Enhancements (not yet implemented)

- CRM integration: auto-create a contact record on "hot" qualification
- Email draft: generate a personalized follow-up email as a separate Trigger.dev task
- Lead history: store past qualifications in a database for comparison
- Bulk import: qualify multiple leads via CSV upload
