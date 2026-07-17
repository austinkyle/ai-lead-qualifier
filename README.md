# AI Lead Qualifier

A small SaaS app that scores inbound sales leads with AI. A user fills out a lead form (budget, timeline, revenue, challenge, etc.), and Claude analyzes it in the background and returns a 0–100 score, a hot/warm/cold/disqualified tier, and a plain-English recommendation — instead of a human having to read every submission and guess.

🔗 **[Live Demo](https://frontend-tawny-theta.vercel.app/login)**

---

## What It Does

Businesses waste time manually sorting through unqualified leads. This app replaces that with an automated intake and qualification flow: a logged-in user submits a lead's info, a background job scores it against a weighted rubric (budget, timeline, and revenue count for ~80% of the score), and the result — tier, strengths, concerns, and a recommended next step — is shown in the UI and stored for later review.

---

## Features

- **User authentication** — email/password auth via Supabase
- **Lead intake form** — structured capture of company, contact, budget, timeline, revenue, and use case
- **AI qualification** — a Trigger.dev background task calls the Claude API with a fixed scoring rubric and returns structured JSON (score, tier, summary, strengths, concerns, recommendation, confidence)
- **History view** — past qualifications are stored in Supabase and browsable per user
- **Usage limits + billing** — free users get 2 qualifications/day; Stripe Checkout and a billing portal unlock unlimited usage
- **Live deployment** — running on Vercel with a Supabase backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL + Auth) |
| Background jobs | Trigger.dev |
| AI | Anthropic Claude API |
| Billing | Stripe (Checkout + customer portal + webhooks) |
| Deployment | Vercel |

---

## Architecture

```
User submits Lead Form (Next.js frontend)
      ↓
/api/qualify → checks auth + daily usage limit
      ↓
Trigger.dev background task ("qualify-lead")
      ↓
Claude API scores the lead against a fixed rubric
      ↓
Result written to Supabase, streamed back to the UI
      ↓
Stripe Checkout / portal handle upgrades past the free daily limit
```

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/austinkyle/ai-lead-qualifier

# Trigger.dev task (root)
npm install
cp .env.example .env   # ANTHROPIC_API_KEY, TRIGGER_SECRET_KEY
npm run dev            # npx trigger.dev dev

# Frontend
cd frontend
npm install
npm run dev             # Supabase + Stripe env vars required, see lib/supabase and lib/stripe
```

---

## Live Demo

**URL:** [https://frontend-tawny-theta.vercel.app/login](https://frontend-tawny-theta.vercel.app/login)
