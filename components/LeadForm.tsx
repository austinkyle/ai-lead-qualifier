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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { LeadPayload, QualifyApiResponse, RunState } from "@/lib/types";

type Props = {
  onResult: (state: RunState) => void;
  isRunning: boolean;
};

const TIMELINE_OPTIONS = [
  { value: "within-30-days", label: "Within 30 days" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-12-months", label: "6–12 months" },
  { value: "no-timeline", label: "No specific timeline" },
];

const TEAM_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

type FormData = {
  companyName: string;
  contactName: string;
  email: string;
  budget: string;
  useCase: string;
  timeline: string;
  teamSize: string;
  currentTools: string;
  decisionMaker: boolean;
};

const INITIAL_FORM: FormData = {
  companyName: "",
  contactName: "",
  email: "",
  budget: "",
  useCase: "",
  timeline: "",
  teamSize: "",
  currentTools: "",
  decisionMaker: false,
};

export function LeadForm({ onResult, isRunning }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: LeadPayload = {
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      ...(form.budget.trim() && { budget: form.budget.trim() }),
      ...(form.useCase.trim() && { useCase: form.useCase.trim() }),
      ...(form.timeline && { timeline: form.timeline }),
      ...(form.teamSize && { teamSize: form.teamSize }),
      ...(form.currentTools.trim() && { currentTools: form.currentTools.trim() }),
      decisionMaker: form.decisionMaker,
    };

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
          Contact Information
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company Name" required>
              <Input
                placeholder="Acme Corp"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                required
                className="bg-input border-border/60 focus:border-primary/70 transition-colors"
              />
            </Field>
            <Field label="Contact Name" required>
              <Input
                placeholder="Jane Smith"
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
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

      {/* Section: Qualification signals */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground font-heading mb-3">
          Qualification Signals
        </p>
        <div className="flex flex-col gap-4">
          <Field label="Budget" hint="e.g. $10k–$50k / month">
            <Input
              placeholder="$20k / month"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              className="bg-input border-border/60 focus:border-primary/70 transition-colors"
            />
          </Field>

          <Field label="Use Case" hint="What problem are they solving?">
            <Textarea
              placeholder="Describe the main use case and pain point in 2–3 sentences…"
              value={form.useCase}
              onChange={(e) => set("useCase", e.target.value)}
              rows={3}
              className="bg-input border-border/60 focus:border-primary/70 transition-colors resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Timeline">
              <Select
                value={form.timeline}
                onValueChange={(v) => set("timeline", v ?? "")}
              >
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {TIMELINE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Team Size">
              <Select
                value={form.teamSize}
                onValueChange={(v) => set("teamSize", v ?? "")}
              >
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {TEAM_SIZE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Current Tools" hint="What are they using today?">
            <Input
              placeholder="Salesforce, HubSpot, Notion…"
              value={form.currentTools}
              onChange={(e) => set("currentTools", e.target.value)}
              className="bg-input border-border/60 focus:border-primary/70 transition-colors"
            />
          </Field>

          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="decisionMaker"
              checked={form.decisionMaker}
              onCheckedChange={(checked) =>
                set("decisionMaker", checked === true)
              }
              className="mt-0.5 border-border/70 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div>
              <Label
                htmlFor="decisionMaker"
                className="text-sm font-medium cursor-pointer leading-none"
              >
                Decision Maker
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                This contact is the final decision maker
              </p>
            </div>
          </div>
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
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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
        {hint && (
          <span className="text-muted-foreground font-normal ml-1.5 text-xs">
            — {hint}
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
