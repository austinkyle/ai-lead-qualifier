# CLAUDE.md — AI Lead Qualifier (Full Stack)

This file is the primary context document for Claude Code working in this repository.
Read it fully before making any changes.

---

## WAT Framework

This project is organized using the **WAT framework**:

| Letter | Meaning | Location |
|--------|---------|----------|
| **W** | Workflows / Instructions | `/workflows/` |
| **A** | Agent (Claude Code) | _(no folder — you are the agent)_ |
| **T** | Tools / Scripts | `/tools/` |

### W — Workflows (`/workflows/`)

Contains human-readable definitions of how work gets done:

- `workflows/lead-qualifier.md` — Step-by-step workflow definition: what inputs are collected, how the AI processes them, what output is expected, and how results are surfaced to the user.
- `workflows/prompts/qualify-lead.md` — The Claude prompt template used inside the Trigger.dev task. Contains the system prompt, variable slots for lead data, the scoring rubric, and the expected JSON output schema.

When changing AI behavior (scoring logic, prompt instructions, output format), edit the files in `/workflows/` first, then reflect those changes in `/trigger/qualify-lead.ts`.

### A — Agent

Claude Code is the agent. No folder needed. Claude reads this CLAUDE.md plus the `/workflows/` files to understand context and intent before writing or modifying any code.

### T — Tools (`/tools/`)

Standalone TypeScript utility scripts. They do not run inside Trigger.dev tasks — they are run manually from the terminal by a developer or by Claude Code during development:

- `tools/seed-test-leads.ts` — Sends sample lead payloads to the Next.js API route or directly to Trigger.dev to test the qualification pipeline end-to-end without a browser.
- `tools/validate-env.ts` — Checks that all required environment variables are set in the current shell / `.env.local` before starting any dev servers. Run this first when onboarding or after pulling new changes.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Next.js Frontend (Vercel)             │    │
│  │                                                 │    │
│  │  LeadForm.tsx  ──► /api/qualify/route.ts        │    │
│  │                         │                       │    │
│  │                         │ 1. Triggers task      │    │
│  │                         │ 2. Creates token      │    │
│  │                         │ 3. Returns token +    │    │
│  │                         │    runId to client    │    │
│  │                         ▼                       │    │
│  │  QualificationResult.tsx                        │    │
│  │  useRealtimeRun(runId, { accessToken })         │    │
│  │         │  streams back live AI output          │    │
│  └─────────┼───────────────────────────────────────┘    │
└────────────┼─────────────────────────────────────────────┘
             │  HTTPS / SSE (Trigger.dev Realtime)
             ▼
┌─────────────────────────────────────────────────────────┐
│              Trigger.dev Cloud (task runner)            │
│                                                         │
│  qualify-lead task (Node.js 22, TypeScript)             │
│    1. Receives lead payload                             │
│    2. Builds prompt from workflows/prompts/             │
│    3. Calls Anthropic SDK (claude-sonnet-4-6)           │
│    4. Updates metadata with streaming progress          │
│    5. Returns structured QualificationResult            │
└─────────────────────────────────────────────────────────┘
```

### Communication Pattern (Frontend → Trigger.dev → Frontend)

1. User submits the lead form on the client.
2. Client `POST`s lead data to `frontend/app/api/qualify/route.ts` (Next.js Route Handler, server-side).
3. The Route Handler uses `@trigger.dev/sdk` (with `TRIGGER_SECRET_KEY`) to:
   - Trigger the `qualify-lead` task via `tasks.trigger("qualify-lead", payload)`.
   - Generate a one-time **public access token** via `auth.createPublicToken({ scopes: { read: { runs: [handle.id] } } })`.
   - Return `{ runId, publicAccessToken }` as JSON to the client.
4. The client component (`QualificationResult.tsx`) receives `runId` + `publicAccessToken` and passes them to `useRealtimeRun` from `@trigger.dev/react-hooks`.
5. Trigger.dev Realtime opens a Server-Sent Events (SSE) connection that pushes run status and metadata updates to the browser in real time.
6. When the run completes, `run.output` contains the final structured `QualificationResult`.

**Why this pattern?**
- `TRIGGER_SECRET_KEY` never reaches the browser.
- Public tokens are scoped to a single run — no over-permissioning.
- SSE streaming avoids polling and gives a live "AI is thinking" experience.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22.x |
| Language | TypeScript | 5.x (strict mode) |
| Frontend framework | Next.js (App Router) | 15.x |
| Frontend deployment | Vercel | (auto via GitHub) |
| Styling | Tailwind CSS | 4.x |
| Component library | shadcn/ui | latest |
| Background tasks | @trigger.dev/sdk | 4.x |
| Realtime frontend | @trigger.dev/react-hooks | 4.x |
| AI model | Anthropic SDK (`claude-sonnet-4-6`) | latest |
| Package manager | npm | (workspace root) |

### Key Architectural Constraints

- **Never import `trigger/` files from `frontend/`**. Use `tasks.trigger("qualify-lead", payload)` (string ID) from the API route — not a direct import of the task function. This prevents Trigger.dev internals from being bundled into the Vercel deployment.
- **All AI logic lives exclusively inside Trigger.dev tasks** (`trigger/`). The Next.js app never calls the Anthropic SDK directly.
- **Environment variables for Trigger.dev tasks** (e.g., `ANTHROPIC_API_KEY`) are set in the **Trigger.dev dashboard**, not in Vercel.
- **Environment variables for Next.js API routes** (e.g., `TRIGGER_SECRET_KEY`) are set in **Vercel environment variables** and locally in `frontend/.env.local`.

---

## Project Folder Structure

```
/
├── CLAUDE.md                         # This file
│
├── workflows/                        # W: Workflow definitions & prompts
│   ├── lead-qualifier.md             # End-to-end workflow definition
│   └── prompts/
│       └── qualify-lead.md           # Claude prompt template + scoring rubric
│
├── tools/                            # T: Developer utility scripts
│   ├── seed-test-leads.ts            # Sends test lead payloads to trigger the task
│   └── validate-env.ts               # Validates all required env vars are present
│
├── trigger/                          # Trigger.dev background tasks
│   └── qualify-lead.ts               # Main AI qualification task
│
├── frontend/                         # Next.js application (deployed to Vercel)
│   ├── app/
│   │   ├── page.tsx                  # Main page: renders LeadForm + QualificationResult
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   └── api/
│   │       └── qualify/
│   │           └── route.ts          # POST handler: triggers task, returns token
│   ├── components/
│   │   ├── LeadForm.tsx              # Controlled form component (all lead fields)
│   │   └── QualificationResult.tsx   # Realtime result display (score, summary, CTA)
│   ├── lib/
│   │   └── types.ts                  # Shared TypeScript types (LeadPayload, QualificationResult)
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── components.json               # shadcn/ui configuration
│   └── package.json
│
├── trigger.config.ts                 # Trigger.dev project configuration
└── package.json                      # Root workspace (scripts for both sub-projects)
```

---

## Lead Qualification Workflow

Full definition in `workflows/lead-qualifier.md`. Summary:

### Step 1 — Lead Data Collection (Frontend)

`LeadForm.tsx` collects the following fields:

| Field | Type | Notes |
|-------|------|-------|
| `companyName` | string | Required |
| `contactName` | string | Required |
| `email` | string | Required, validated |
| `budget` | string | e.g. "$10k–$50k / month" |
| `useCase` | string | Free text, 2–3 sentences |
| `timeline` | string | e.g. "Within 30 days" |
| `teamSize` | string | e.g. "11–50" |
| `currentTools` | string | What they use today |
| `decisionMaker` | boolean | Are they the decision maker? |

### Step 2 — API Route (Next.js, server-side)

`frontend/app/api/qualify/route.ts`:
1. Validates the incoming POST body.
2. Calls `tasks.trigger("qualify-lead", leadPayload)` using `@trigger.dev/sdk`.
3. Creates a scoped public token via `auth.createPublicToken(...)`.
4. Returns `{ runId: string, publicAccessToken: string }` to the client.

### Step 3 — Task Execution (Trigger.dev)

`trigger/qualify-lead.ts` runs on Trigger.dev with Node.js 22:
1. Receives the lead payload.
2. Reads the prompt template from `workflows/prompts/qualify-lead.md` (embedded as a constant or bundled via `additionalFiles` in `trigger.config.ts`).
3. Constructs the full prompt by interpolating lead fields.
4. Calls `anthropic.messages.create(...)` with model `claude-sonnet-4-6`.
5. Updates `metadata` with progress as the response streams.
6. Parses the structured JSON from Claude's response.
7. Returns a `QualificationResult`:

```typescript
type QualificationResult = {
  score: number;           // 0–100
  tier: "hot" | "warm" | "cold" | "disqualified";
  summary: string;         // 2–3 sentence human-readable summary
  strengths: string[];     // Positive signals
  concerns: string[];      // Risk factors or missing info
  recommendation: string;  // Suggested next step
  confidence: number;      // 0–1
};
```

Tier mapping: **80–100** = hot, **60–79** = warm, **40–59** = cold, **0–39** = disqualified.

### Step 4 — Realtime Result Display (Frontend)

`QualificationResult.tsx` uses `useRealtimeRun` from `@trigger.dev/react-hooks`:
- While running: displays a loading/progress state driven by `run.metadata`.
- On completion: renders the full structured result — score badge, tier indicator, strengths/concerns lists, recommendation CTA.

### Scoring Rubric (Summary — full version in `workflows/prompts/qualify-lead.md`)

| Signal | Max Points |
|--------|-----------|
| Budget clearly stated and realistic | 25 |
| Decision maker confirmed | 20 |
| Specific use case with clear pain | 20 |
| Timeline defined (< 90 days) | 15 |
| Team size and current tools provided | 10 |
| Contact information complete | 10 |
| **Total** | **100** |

---

## Environment Variables

### Trigger.dev Dashboard (task runner environment)

Set under "Environment Variables" for each environment (dev / staging / prod):

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for `claude-sonnet-4-6` calls inside the task |

### Vercel + `frontend/.env.local` (Next.js app)

| Variable | Description |
|----------|-------------|
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key. DEV key for local dev, PROD key in Vercel. Found in Trigger.dev dashboard → API Keys. |

### Root `.env` (for `tools/` scripts)

| Variable | Description |
|----------|-------------|
| `TRIGGER_SECRET_KEY` | Same DEV secret key as above, used by seed and validate scripts |

Run `npx tsx tools/validate-env.ts` to verify all variables are present before starting dev servers.

---

## Running Locally

Two terminal sessions must run simultaneously.

### Terminal 1 — Trigger.dev dev server (from repo root)

```bash
npx trigger.dev@latest dev
```

Starts the Trigger.dev local proxy. Connects to Trigger.dev Cloud and forwards task invocations to your local machine. Tasks in `trigger/` are hot-reloaded on save.

### Terminal 2 — Next.js frontend

```bash
cd frontend
npm run dev
```

App available at `http://localhost:3000`.

### Utility scripts

```bash
# Validate all environment variables
npx tsx tools/validate-env.ts

# Send test lead payloads end-to-end (no browser needed)
npx tsx tools/seed-test-leads.ts
```

---

## Deployment

### Trigger.dev Tasks → Trigger.dev Cloud

```bash
# From repo root
npx trigger.dev@latest deploy
```

Compiles and bundles all tasks in `trigger/` and registers them as a new version in production. Verify the deployment in the Trigger.dev dashboard before deploying the frontend.

### Frontend → Vercel (via GitHub)

Vercel is connected to this GitHub repository. Every push to `main` triggers an automatic production deployment. Preview deployments are created for every pull request.

**First-time Vercel setup:**
1. Import the repository in Vercel.
2. Set "Root Directory" to `frontend/`.
3. Framework preset: Next.js (auto-detected).
4. Add `TRIGGER_SECRET_KEY` under Environment Variables in Vercel project settings.

---

## Development Guidelines for Claude Code

1. **Read `workflows/` before writing task code.** The prompt template and scoring rubric in `workflows/prompts/qualify-lead.md` define the AI behavior. Code in `trigger/qualify-lead.ts` must implement what is described there.

2. **Never import `trigger/` files from `frontend/`.** Use string-based task IDs (`tasks.trigger("qualify-lead", ...)`) in API routes. Direct imports cause Trigger.dev internals to be bundled into the Vercel deployment.

3. **TypeScript strict mode is on everywhere.** No `any` types. Define all payload and result shapes in `frontend/lib/types.ts` and import them in both `trigger/qualify-lead.ts` and frontend components.

4. **Streaming is the default UX.** The task should emit progress updates via `metadata` so the frontend can display a live state while the AI processes. Do not make users stare at a spinner with no feedback.

5. **Keep tasks focused.** `trigger/qualify-lead.ts` does one thing: qualify a lead. If new AI capabilities are added (e.g., CRM enrichment, email drafting), create separate task files.

6. **Run `tools/validate-env.ts` after any `.env` changes** to catch missing variables before they cause runtime failures.

7. **shadcn/ui components are the default** for all new UI elements. Run `npx shadcn@latest add <component>` from the `frontend/` directory to add components.

8. **Tailwind CSS v4 uses CSS-first configuration.** Edit `frontend/app/globals.css` for theme tokens — not `tailwind.config.ts`.
