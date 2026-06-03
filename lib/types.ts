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

export type LeadQualificationRow = {
  id: string;
  user_id: string;
  run_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  budget?: string;
  use_case?: string;
  timeline?: string;
  team_size?: string;
  current_tools?: string;
  decision_maker?: boolean;
  score?: number;
  tier?: QualificationResult["tier"];
  summary?: string;
  strengths?: string[];
  concerns?: string[];
  recommendation?: string;
  confidence?: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
};
