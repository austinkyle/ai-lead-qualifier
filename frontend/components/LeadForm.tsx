"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Section: Contact */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground font-heading mb-3">
          Your Information
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" required>
              <Input
                placeholder="Jane Smith"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                required
                className="bg-input border-border/60 focus:border-primary/70 transition-colors"
              />
            </Field>
            <Field label="Business Name" required>
              <Input
                placeholder="Acme Co."
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                required
                className="bg-input border-border/60 focus:border-primary/70 transition-colors"
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
              className="bg-input border-border/60 focus:border-primary/70 transition-colors"
            />
          </Field>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Section: Challenge */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground font-heading mb-3">
          Your Challenge
        </p>
        <Field label="What's your biggest challenge right now?" required>
          <Textarea
            placeholder="Describe the main problem you're trying to solve in 2–3 sentences…"
            value={form.challenge}
            onChange={(e) => set("challenge", e.target.value)}
            required
            rows={3}
            className="bg-input border-border/60 focus:border-primary/70 transition-colors resize-none"
          />
        </Field>
      </div>

      <Separator className="bg-border/40" />

      {/* Section: Business Profile */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground font-heading mb-3">
          About Your Business
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Business Type">
              <Select value={form.businessType} onValueChange={(v) => set("businessType", v)}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {BUSINESS_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Years in Business">
              <Select value={form.yearsInBusiness} onValueChange={(v) => set("yearsInBusiness", v)}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {YEARS_IN_BUSINESS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Employees">
              <Select value={form.employeeCount} onValueChange={(v) => set("employeeCount", v)}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {EMPLOYEE_COUNT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Monthly Revenue">
              <Select value={form.monthlyRevenue} onValueChange={(v) => set("monthlyRevenue", v)}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {MONTHLY_REVENUE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Section: Buying Intent */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground font-heading mb-3">
          Buying Intent
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Budget">
              <Select value={form.monthlyBudget} onValueChange={(v) => set("monthlyBudget", v)}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {MONTHLY_BUDGET_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Looking to Start">
              <Select value={form.timeline} onValueChange={(v) => set("timeline", v)}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {TIMELINE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="How Did You Hear About Us?">
            <Select value={form.referralSource} onValueChange={(v) => set("referralSource", v)}>
              <SelectTrigger className="bg-input border-border/60">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60">
                {REFERRAL_SOURCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isRunning}
        className="w-full h-11 text-sm font-semibold tracking-wide bg-primary hover:bg-primary/85 transition-all duration-200 disabled:opacity-60"
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            Analyzing…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <BoltIcon className="w-4 h-4" />
            Analyze Lead
          </span>
        )}
      </Button>
    </form>
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
      <Label className="text-sm font-medium text-foreground/90">
        {label}
        {required && (
          <span className="text-primary/80 ml-0.5" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
    </div>
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

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
