# Demo Lead Qualifier

A full-stack lead qualification web application that captures, scores, and routes inbound leads automatically. Built with a React front-end, Supabase backend, and deployed live on Vercel.

🔗 **[Live Demo](https://frontend-tawny-theta.vercel.app/login)**

---

## What It Does

Businesses waste time manually sorting through unqualified leads. This application replaces that manual process with an automated intake and qualification system — leads submit their information, the system scores them, and routes them accordingly.

---

## Features

- **User authentication** — secure login and signup via Supabase Auth
- **Lead intake form** — structured data capture from prospective leads
- **Qualification logic** — scoring system that evaluates and routes leads based on responses
- **Database integration** — all submissions stored and managed in Supabase
- **Live deployment** — fully deployed and accessible via Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel |
| AI Integration | Claude API |

---

## Architecture

```
User Submits Form
      ↓
React Frontend (Vercel)
      ↓
Supabase Auth → Validates Session
      ↓
Lead Scoring Logic
      ↓
Supabase Database → Stores Result
      ↓
Qualified / Unqualified Routing
```

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/austinkyle/demo-lead-qualifier

# Install dependencies
npm install

# Add environment variables
cp .env.example .env
# Fill in your Supabase URL, anon key, and Claude API key

# Run locally
npm run dev
```

---

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLAUDE_API_KEY=your_claude_api_key
```

---

## Live Demo

**URL:** [https://frontend-tawny-theta.vercel.app/login](https://frontend-tawny-theta.vercel.app/login)
