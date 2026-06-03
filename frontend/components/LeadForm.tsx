"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadPayload, QualifyApiResponse, RunState } from "@/lib/types";

type Props = {
  onResult: (state: RunState) => void;
  onLimitReached: () => void;
  isRunning: boolean;
};

const BUSINESS_TYPE_OPTIONS = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "service-based", label: "Service-based" },
  { value: "saas-tech", label: "SaaS / Tech" },
  { value: "brick-and-mortar", label: "Brick & mortar" },
  { value: "agency", label: "Agency" },
  { value: "other", label: "Other" },
];

const YEARS_IN_BUSINESS_OPTIONS = [
  { value: "less-than-1-year", label: "Less than 1 year" },
  { value: "1-3-years", label: "1–3 years" },
  { value: "3-5-years", label: "3–5 years" },
  { value: "5-plus-years", label: "5+ years" },
];

const EMPLOYEE_COUNT_OPTIONS = [
  { value: "just-me", label: "Just me" },
  { value: "2-5", label: "2–5" },
  { value: "6-20", label: "6–20" },
  { value: "21-50", label: "21–50" },
  { value: "50-plus", label: "50+" },
];

const MONTHLY_REVENUE_OPTIONS = [
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "under-10k", label: "Under $10k" },
  { value: "10k-50k", label: "$10k–$50k" },
  { value: "50k-100k", label: "$50k–$100k" },
  { value: "100k-plus", label: "$100k+" },
];

const MONTHLY_BUDGET_OPTIONS = [
  { value: "under-500", label: "Under $500" },
  { value: "500-1500", label: "$500–$1,500" },
  { value: "1500-5000", label: "$1,500–$5,000" },
  { value: "5000-plus", label: "$5,000+" },
];

const TIMELINE_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "within-30-days", label: "Within 30 days" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "just-researching", label: "Just researching" },
];

const REFERRAL_SOURCE_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "referral", label: "Referral" },
  { value: "social-media", label: "Social media" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
];

type FormData = {
  fullName: string;
  businessName: string;
  email: string;
  challenge: string;
  businessType: string;
  yearsInBusiness: string;
  employeeCount: string;
  monthlyRevenue: string;
  monthlyBudget: string;
  timeline: string;
  referralSource: string;
};

const INITIAL_FORM: FormData = {
  fullName: "",
  businessName: "",
  email: "",
  challenge: "",
  businessType: "",
  yearsInBusiness: "",
  employeeCount: "",
  monthlyRevenue: "",
  monthlyBudget: "",
  timeline: "",
  referralSource: "",
};

export function LeadForm({ onResult, onLimitReached, isRunning }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormData, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: LeadPayload = {
      fullName: form.fullName.trim(),
      businessName: form.businessName.trim(),
      email: form.email.trim(),
      challenge: form.challenge.trim(),
      ...(form.businessType && { businessType: form.businessType }),
      ...(form.yearsInBusiness && { yearsInBusiness: form.yearsInBusiness }),
      ...(form.employeeCount && { employeeCount: form.employeeCount }),
      ...(form.monthlyRevenue && { monthlyRevenue: form.monthlyRevenue }),
      ...(form.monthlyBudget && { monthlyBudget: form.monthlyBudget }),
      ...(form.timeline && { timeline: form.timeline }),
      ...(form.referralSource && { referralSource: form.referralSource }),
    };

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        onLimitReached();
        return;
      }

      const data = (await res.json()) as
        | QualifyApiResponse
        | { error: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        return;
      }

      onResult({
        runId: data.runId,
        accessToken: data.publicAccessToken,
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Section: Contact */}
      <SectionCard title="Your Information">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" required>
            <Input
              placeholder="Jane Smith"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              required
              className="focus-glow"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
            />
          </Field>
          <Field label="Business Name" required>
            <Input
              placeholder="Acme Co."
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              required
              className="focus-glow"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
            />
          </Field>
        </div>
        <Field label="Email Address" required>
          <Input
            type="email"
            placeholder="jane@acme.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            className="focus-glow"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
          />
        </Field>
      </SectionCard>

      {/* Section: Challenge */}
      <SectionCard title="Your Challenge">
        <Field label="What's your biggest challenge right now?" required>
          <Textarea
            placeholder="Describe the main problem you're trying to solve in 2–3 sentences…"
            value={form.challenge}
            onChange={(e) => set("challenge", e.target.value)}
            required
            rows={3}
            className="focus-glow resize-none"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
          />
        </Field>
      </SectionCard>

      {/* Section: Business Profile */}
      <SectionCard title="About Your Business">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Business Type">
            <StyledSelect value={form.businessType} onValueChange={(v) => set("businessType", v)} placeholder="Select type">
              {BUSINESS_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </StyledSelect>
          </Field>
          <Field label="Years in Business">
            <StyledSelect value={form.yearsInBusiness} onValueChange={(v) => set("yearsInBusiness", v)} placeholder="Select range">
              {YEARS_IN_BUSINESS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </StyledSelect>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Employees">
            <StyledSelect value={form.employeeCount} onValueChange={(v) => set("employeeCount", v)} placeholder="Select size">
              {EMPLOYEE_COUNT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </StyledSelect>
          </Field>
          <Field label="Monthly Revenue">
            <StyledSelect value={form.monthlyRevenue} onValueChange={(v) => set("monthlyRevenue", v)} placeholder="Select range">
              {MONTHLY_REVENUE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </StyledSelect>
          </Field>
        </div>
      </SectionCard>

      {/* Section: Buying Intent */}
      <SectionCard title="Buying Intent">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly Budget">
            <StyledSelect value={form.monthlyBudget} onValueChange={(v) => set("monthlyBudget", v)} placeholder="Select range">
              {MONTHLY_BUDGET_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </StyledSelect>
          </Field>
          <Field label="Looking to Start">
            <StyledSelect value={form.timeline} onValueChange={(v) => set("timeline", v)} placeholder="Select timeline">
              {TIMELINE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </StyledSelect>
          </Field>
        </div>
        <Field label="How Did You Hear About Us?">
          <StyledSelect value={form.referralSource} onValueChange={(v) => set("referralSource", v)} placeholder="Select source">
            {REFERRAL_SOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </StyledSelect>
        </Field>
      </SectionCard>

      {error && (
        <p className="text-sm rounded-xl px-4 py-3"
           style={{
             color: "oklch(0.63 0.22 15)",
             background: "oklch(0.63 0.22 15 / 10%)",
             border: "1px solid oklch(0.63 0.22 15 / 20%)",
           }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isRunning}
        className="btn-gradient w-full h-12 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center gap-2"
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <BouncingDots />
            <span>Analyzing…</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <BoltIcon className="w-4 h-4" />
            Analyze Lead
          </span>
        )}
      </button>
    </form>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-section flex flex-col gap-4">
      <p className="text-[10px] font-bold tracking-[0.16em] uppercase font-heading flex items-center gap-2"
         style={{ color: "oklch(0.62 0.22 215 / 65%)" }}>
        <span className="w-4 h-px inline-block" style={{ background: "linear-gradient(90deg, oklch(0.62 0.22 215 / 55%), transparent)" }} />
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium" style={{ color: "oklch(0.75 0.010 220)" }}>
        {label}
        {required && (
          <span style={{ color: "oklch(0.62 0.22 215 / 80%)" }} className="ml-0.5" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

function StyledSelect({
  value,
  onValueChange,
  placeholder,
  children,
}: {
  value: string;
  onValueChange: (v: string | null) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className="focus-glow"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        style={{
          background: "oklch(0.11 0.022 230)",
          borderColor: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(20px)",
        }}
      >
        {children}
      </SelectContent>
    </Select>
  );
}

function BouncingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block"
          style={{ animation: `dot-bounce 1.0s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
    </span>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      />
    </svg>
  );
}
