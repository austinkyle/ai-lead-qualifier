"use client";

import { useEffect, useRef } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { QualificationResult, RunState } from "@/lib/types";

type Props = {
  runState: RunState;
};

const TIER_CONFIG = {
  hot: {
    label: "HOT",
    color: "var(--tier-hot)",
    bg: "oklch(0.65 0.22 15 / 12%)",
    border: "oklch(0.65 0.22 15 / 30%)",
    textClass: "text-[oklch(0.65_0.22_15)]",
    badgeClass:
      "bg-[oklch(0.65_0.22_15/12%)] border border-[oklch(0.65_0.22_15/30%)] text-[oklch(0.75_0.2_15)]",
  },
  warm: {
    label: "WARM",
    color: "var(--tier-warm)",
    bg: "oklch(0.78 0.17 72 / 12%)",
    border: "oklch(0.78 0.17 72 / 30%)",
    textClass: "text-[oklch(0.78_0.17_72)]",
    badgeClass:
      "bg-[oklch(0.78_0.17_72/12%)] border border-[oklch(0.78_0.17_72/30%)] text-[oklch(0.82_0.16_72)]",
  },
  cold: {
    label: "COLD",
    color: "var(--tier-cold)",
    bg: "oklch(0.72 0.14 220 / 12%)",
    border: "oklch(0.72 0.14 220 / 30%)",
    textClass: "text-[oklch(0.72_0.14_220)]",
    badgeClass:
      "bg-[oklch(0.72_0.14_220/12%)] border border-[oklch(0.72_0.14_220/30%)] text-[oklch(0.80_0.13_220)]",
  },
  disqualified: {
    label: "DISQUALIFIED",
    color: "var(--tier-disqualified)",
    bg: "oklch(0.48 0.02 252 / 12%)",
    border: "oklch(0.48 0.02 252 / 30%)",
    textClass: "text-[oklch(0.55_0.02_252)]",
    badgeClass:
      "bg-[oklch(0.48_0.02_252/12%)] border border-[oklch(0.48_0.02_252/30%)] text-[oklch(0.65_0.02_252)]",
  },
} as const;

export function QualificationResult({ runState }: Props) {
  const { run, error } = useRealtimeRun(runState?.runId ?? "", {
    accessToken: runState?.accessToken ?? "",
    enabled: !!runState,
  } as Parameters<typeof useRealtimeRun>[1]);

  const savedRef = useRef(false);
  useEffect(() => {
    if (run?.status === "COMPLETED" && run.output && runState?.runId && !savedRef.current) {
      savedRef.current = true;
      fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: runState.runId, result: run.output }),
      }).catch(() => {
        // non-fatal — history may show pending if this fails
      });
    }
  }, [run?.status, run?.output, runState?.runId]);

  if (!runState) {
    return <IdleState />;
  }

  if (error) {
    return <ErrorState message={error.message ?? "An unexpected error occurred."} />;
  }

  const status = (run?.metadata as Record<string, unknown> | undefined)?.status as string | undefined;

  if (!run || run.status === "DEQUEUED" || run.status === "PENDING_VERSION" || run.status === "EXECUTING" || run.status === "WAITING" || run.status === "DELAYED") {
    return <LoadingState status={status} />;
  }

  if (run.status === "FAILED" || run.status === "CRASHED" || run.status === "SYSTEM_FAILURE" || run.status === "TIMED_OUT" || run.status === "EXPIRED") {
    return <ErrorState message="The analysis failed. Please try again." />;
  }

  if (run.status === "CANCELED") {
    return <ErrorState message="Analysis was canceled." />;
  }

  const result = run.output as QualificationResult | undefined;
  if (!result) return <LoadingState status="finalizing" />;

  return <ResultDisplay result={result} />;
}

// ─── Idle ─────────────────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center px-8 py-12">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mb-2">
        <ChartIcon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground/80 font-heading">
          No analysis yet
        </p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Fill in the lead details on the left and click{" "}
          <span className="text-foreground/70 font-medium">Analyze Lead</span>{" "}
          to get an AI-powered qualification score.
        </p>
      </div>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, string> = {
  analyzing: "Evaluating lead signals with BANT framework…",
  parsing: "Structuring qualification results…",
  complete: "Finalizing results…",
};

function LoadingState({ status }: { status?: string }) {
  const message =
    (status && STATUS_MESSAGES[status]) ?? "Connecting to AI pipeline…";

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-6 px-8 py-12">
      <div className="relative w-16 h-16">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="oklch(0.24 0.028 252 / 50%)"
            strokeWidth="4"
          />
          <path
            d="M60 32a28 28 0 00-28-28"
            stroke="var(--tier-cold)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground/80 font-heading tracking-wide">
          Analyzing Lead
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-56">
          {message}
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/50"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center px-8 py-12">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-2">
        <XCircleIcon className="w-8 h-8 text-destructive/70" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground/80 font-heading">
          Analysis failed
        </p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────────────────

function ResultDisplay({ result }: { result: QualificationResult }) {
  const tier = TIER_CONFIG[result.tier];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - result.score / 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Score + tier header */}
      <div className="fade-up fade-up-1 flex items-center gap-6">
        {/* Score ring */}
        <div className="relative w-32 h-32 shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 140 140"
            fill="none"
          >
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="oklch(0.24 0.028 252 / 40%)"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={tier.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="score-ring"
              style={
                {
                  "--ring-circumference": circumference,
                  "--ring-offset": offset,
                } as React.CSSProperties
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-semibold leading-none font-mono"
              style={{ color: tier.color }}
            >
              {result.score}
            </span>
            <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mt-1 font-heading">
              Score
            </span>
          </div>
        </div>

        {/* Tier + summary */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <span
            className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-[0.12em] font-heading ${tier.badgeClass}`}
          >
            {tier.label}
          </span>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Strengths + Concerns */}
      <div className="fade-up fade-up-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignalList
          title="Strengths"
          items={result.strengths}
          variant="positive"
        />
        <SignalList
          title="Concerns"
          items={result.concerns}
          variant="negative"
        />
      </div>

      {/* Recommendation */}
      <div className="fade-up fade-up-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary/70 font-heading mb-2">
          Recommended Next Step
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {result.recommendation}
        </p>
      </div>

      {/* Confidence */}
      <div className="fade-up fade-up-4 flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground font-heading tracking-wide whitespace-nowrap">
          AI Confidence
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.round(result.confidence * 100)}%`,
              background: tier.color,
              opacity: 0.7,
            }}
          />
        </div>
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-8 text-right">
          {Math.round(result.confidence * 100)}%
        </span>
      </div>
    </div>
  );
}

function SignalList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "positive" | "negative";
}) {
  const isPositive = variant === "positive";
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-4 flex flex-col gap-3">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase font-heading text-muted-foreground">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              {isPositive ? (
                <CheckIcon className="w-3.5 h-3.5 text-[oklch(0.70_0.18_145)]" />
              ) : (
                <AlertIcon className="w-3.5 h-3.5 text-[oklch(0.78_0.17_72)]" />
              )}
            </span>
            <span className="text-xs text-foreground/75 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16l4-4 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 2L14 13H2L8 2z" strokeLinejoin="round" />
      <path d="M8 7v3M8 11.5v.5" strokeLinecap="round" />
    </svg>
  );
}
