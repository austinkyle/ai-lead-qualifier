import { schemaTask, metadata, logger } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const LeadPayloadSchema = z.object({
  fullName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email(),
  challenge: z.string().min(1),
  businessType: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  employeeCount: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  monthlyBudget: z.string().optional(),
  timeline: z.string().optional(),
  referralSource: z.string().optional(),
});

const QualificationResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  tier: z.enum(["hot", "warm", "cold", "disqualified"]),
  summary: z.string(),
  strengths: z.array(z.string()).min(1).max(5),
  concerns: z.array(z.string()).min(1).max(5),
  recommendation: z.string(),
  confidence: z.number().min(0).max(1),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;
export type QualificationResult = z.infer<typeof QualificationResultSchema>;

// ─── Prompt builders ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert sales qualification specialist. Your job is to analyze inbound lead data and produce a structured qualification assessment.

You evaluate leads objectively, with budget, timeline, and revenue carrying the most weight (they represent ~80% of buying intent). You are honest about weak or missing data — a lead with no budget or revenue information should not score highly even if other signals look good.

You always respond with valid JSON matching the exact schema provided. No markdown, no explanation outside the JSON.`;

function buildUserPrompt(lead: LeadPayload): string {
  const or = (val: string | undefined) => val?.trim() || "Not provided";

  return `Analyze the following inbound lead and qualify them according to the scoring rubric below.

## Lead Information

- Full Name: ${lead.fullName}
- Business Name: ${lead.businessName}
- Email: ${lead.email}
- Biggest Challenge: ${lead.challenge.slice(0, 2000)}
- Business Type: ${or(lead.businessType)}
- Years in Business: ${or(lead.yearsInBusiness)}
- Employees: ${or(lead.employeeCount)}
- Monthly Revenue: ${or(lead.monthlyRevenue)}
- Monthly Budget: ${or(lead.monthlyBudget)}
- Timeline: ${or(lead.timeline)}
- Referral Source: ${or(lead.referralSource)}

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
  "summary": "<2-3 sentence plain English summary>",
  "strengths": ["<strength 1>", ...],
  "concerns": ["<concern 1>", ...],
  "recommendation": "<one clear, actionable next step>",
  "confidence": <float 0.0-1.0>
}

Rules:
- strengths: 1–5 items, each a short phrase (not a full sentence)
- concerns: 1–5 items, each a short phrase describing a risk or missing signal
- recommendation: one sentence, action-oriented
- confidence: lower when budget, timeline, or revenue are missing or low`;
}

// ─── JSON extraction helper ───────────────────────────────────────────────────

function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) return objMatch[0].trim();

  return raw.trim();
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export const qualifyLead = schemaTask({
  id: "qualify-lead",
  schema: LeadPayloadSchema,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    randomize: true,
  },
  run: async (payload) => {
    const anthropic = new Anthropic();

    metadata.set("status", "analyzing");
    metadata.set("businessName", payload.businessName);

    logger.info("Qualifying lead", {
      business: payload.businessName,
      contact: payload.fullName,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(payload),
        },
      ],
    });

    metadata.set("status", "parsing");

    const rawText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    logger.debug("Raw Claude response", { rawText });

    const jsonString = extractJson(rawText);
    const parsed = JSON.parse(jsonString) as unknown;
    const result = QualificationResultSchema.parse(parsed);

    metadata.set("status", "complete");
    metadata.set("score", result.score);
    metadata.set("tier", result.tier);

    logger.info("Lead qualified", {
      business: payload.businessName,
      score: result.score,
      tier: result.tier,
    });

    return result;
  },
});
