export type LeadPayload = {
  companyName: string;
  contactName: string;
  email: string;
  budget?: string;
  useCase?: string;
  timeline?: string;
  teamSize?: string;
  currentTools?: string;
  decisionMaker?: boolean;
};

export type QualificationResult = {
  score: number;
  tier: "hot" | "warm" | "cold" | "disqualified";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  confidence: number;
};

export type QualifyApiResponse = {
  runId: string;
  publicAccessToken: string;
};

export type RunState = {
  runId: string;
  accessToken: string;
} | null;
