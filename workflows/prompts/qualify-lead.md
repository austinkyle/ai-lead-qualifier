# Prompt Template: qualify-lead

This file defines the exact prompt sent to `claude-sonnet-4-6` inside the `qualify-lead` Trigger.dev task. Edit this file to change AI behavior. After editing, re-deploy the Trigger.dev task (`npx trigger.dev@latest deploy`) for changes to take effect.

Variable slots are written as `{{VARIABLE_NAME}}` and are interpolated by the task at runtime.

---

## System Prompt

```
You are an expert sales qualification specialist. Your job is to analyze inbound lead data and produce a structured qualification assessment.

You evaluate leads objectively, with budget, timeline, and revenue carrying the most weight (they represent ~80% of buying intent). You are honest about weak or missing data — a lead with no budget or revenue information should not score highly even if other signals look good.

You always respond with valid JSON matching the exact schema provided. No markdown, no explanation outside the JSON.
```

---

## User Prompt

```
Analyze the following inbound lead and qualify them according to the scoring rubric below.

## Lead Information

- Full Name: {{fullName}}
- Business Name: {{businessName}}
- Email: {{email}}
- Biggest Challenge: {{challenge}}
- Business Type: {{businessType}}
- Years in Business: {{yearsInBusiness}}
- Employees: {{employeeCount}}
- Monthly Revenue: {{monthlyRevenue}}
- Monthly Budget: {{monthlyBudget}}
- Timeline: {{timeline}}
- Referral Source: {{referralSource}}

## Scoring Rubric

Score the lead from 0–100. Budget, timeline, and revenue are the primary signals (80 points total). Apply each criterion independently.

### Monthly Budget (max 30 points)
- 30 pts: $5,000+ per month
- 20 pts: $1,500–$5,000 per month
- 10 pts: $500–$1,500 per month
- 3 pts: Under $500 per month
- 0 pts: Not provided

### Timeline Urgency (max 25 points)
- 25 pts: Immediately
- 18 pts: Within 30 days
- 10 pts: 1–3 months
- 2 pts: Just researching
- 0 pts: Not provided

### Monthly Revenue (max 25 points)
- 25 pts: $100k+
- 18 pts: $50k–$100k
- 12 pts: $10k–$50k
- 5 pts: Under $10k
- 2 pts: Pre-revenue
- 0 pts: Not provided

### Challenge / Use Case (max 12 points)
- 12 pts: Specific, detailed challenge with a clear pain point or business problem
- 6 pts: Challenge mentioned but generic or lacking detail
- 0 pts: Extremely vague or not provided

### Business Context (max 5 points)
- 5 pts: Business type, years in business, and employee count all provided
- 3 pts: Two of three provided
- 1 pt: One of three provided
- 0 pts: None provided

### Contact Completeness (max 3 points)
- 3 pts: Full name, business name, and email all present
- 1 pt: One field missing
- 0 pts: Two or more fields missing

## Tier Mapping
- 80–100: hot
- 60–79: warm
- 40–59: cold
- 0–39: disqualified

## Output Format

Respond ONLY with a JSON object matching this exact schema. No other text.

{
  "score": <integer 0-100>,
  "tier": <"hot" | "warm" | "cold" | "disqualified">,
  "summary": "<2-3 sentence plain English summary of this lead's qualification status>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "recommendation": "<one clear, actionable next step>",
  "confidence": <float 0.0-1.0>
}

Rules:
- strengths: 1–5 items, each a short phrase (not a full sentence)
- concerns: 1–5 items, each a short phrase describing a risk or missing signal
- recommendation: one sentence, action-oriented (e.g. "Schedule a discovery call this week to discuss their automation challenge")
- confidence: lower when budget, timeline, or revenue are missing or low
```

---

## Variable Reference

| Variable | Source Field | Notes |
|----------|-------------|-------|
| `{{fullName}}` | `LeadPayload.fullName` | Required |
| `{{businessName}}` | `LeadPayload.businessName` | Required |
| `{{email}}` | `LeadPayload.email` | Required |
| `{{challenge}}` | `LeadPayload.challenge` | Required; truncate at 2,000 chars |
| `{{businessType}}` | `LeadPayload.businessType` | Use "Not provided" if empty |
| `{{yearsInBusiness}}` | `LeadPayload.yearsInBusiness` | Use "Not provided" if empty |
| `{{employeeCount}}` | `LeadPayload.employeeCount` | Use "Not provided" if empty |
| `{{monthlyRevenue}}` | `LeadPayload.monthlyRevenue` | Use "Not provided" if empty |
| `{{monthlyBudget}}` | `LeadPayload.monthlyBudget` | Use "Not provided" if empty |
| `{{timeline}}` | `LeadPayload.timeline` | Use "Not provided" if empty |
| `{{referralSource}}` | `LeadPayload.referralSource` | Use "Not provided" if empty |

---

## Scoring Philosophy

Budget, timeline, and revenue together account for 80 points — they are the primary buying-intent signals:

| Signal | Points | Why |
|--------|--------|-----|
| Monthly Budget | 30 | Highest-signal: shows willingness to pay |
| Timeline | 25 | Urgency determines pipeline velocity |
| Monthly Revenue | 25 | Ability to pay; company health proxy |
| Challenge specificity | 12 | Validates real pain vs. curiosity |
| Business context | 5 | Fit signal (type, size, maturity) |
| Contact completeness | 3 | Reachability |

## Example Output

```json
{
  "score": 78,
  "tier": "warm",
  "summary": "Strong buying intent with a $1,500–$5,000 budget and a within-30-days timeline, though revenue is in the $10k–$50k range which limits deal size. The challenge description is specific and shows genuine pain around manual processes.",
  "strengths": [
    "Clear budget in mid-range ($1,500–$5,000)",
    "Short 30-day timeline signals urgency",
    "Specific, detailed challenge described",
    "Service-based business — common use case"
  ],
  "concerns": [
    "Revenue in lower mid-range — may limit expansion",
    "Solo operator — implementation bandwidth may be constrained"
  ],
  "recommendation": "Schedule a 20-minute discovery call this week to validate the automation fit and confirm budget approval authority.",
  "confidence": 0.82
}
```

---

## Prompt Engineering Notes

- Budget, timeline, and revenue dominate the score intentionally — a "just researching" lead with $0 budget should never qualify as hot regardless of how compelling their challenge sounds.
- The `confidence` field drops when the big three signals are missing, signaling to sales that more discovery is needed before trusting the score.
- Dropdown values (e.g. "within-30-days", "1500-5000") are human-readable labels by the time they reach the prompt — the task formats them before interpolation.
