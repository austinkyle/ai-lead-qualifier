export type LeadPayload = {
  fullName: string;
  businessName: string;
  email: string;
  challenge: string;
  businessType?: string;
  yearsInBusiness?: string;
  employeeCount?: string;
  monthlyRevenue?: string;
  monthlyBudget?: string;
  timeline?: string;
  referralSource?: string;
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

export type UsageStatus = {
  isPro: boolean;
  used: number;
  limit: number | null;
};

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
