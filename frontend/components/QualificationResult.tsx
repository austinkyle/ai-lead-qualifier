"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { QualificationResult, RunState } from "@/lib/types";

type Props = {
  runState: RunState;
};

const TIER_CONFIG = {
  hot: {
    label: "HOT",
    color: "#f87171",
    glowColor: "#f87171",
    textStyle: { color: "#f87171" },
    badgeStyle: {
      background: "rgba(248, 113, 113, 0.12)",
      border: "1px solid rgba(248, 113, 113, 0.30)",
      color: "#fca5a5",
      boxShadow: "0 0 14px rgba(248,113,113,0.35), 0 0 4px rgba(248,113,113,0.20)",
    },
    ringColor: "#f87171",
  },
  warm: {
    label: "WARM",
    color: "#fbbf24",
    glowColor: "#fbbf24",
    textStyle: { color: "#fbbf24" },
    badgeStyle: {
      background: "rgba(251, 191, 36, 0.12)",
      border: "1px solid rgba(251, 191, 36, 0.30)",
      color: "#fcd34d",
      boxShadow: "0 0 14px rgba(251,191,36,0.35), 0 0 4px rgba(251,191,36,0.20)",
    },
    ringColor: "#fbbf24",
  },
  cold: {
    label: "COLD",
    color: "#38bdf8",
    glowColor: "#38bdf8",
    textStyle: { color: "#38bdf8" },
    badgeStyle: {
      background: "rgba(56, 189, 248, 0.12)",
      border: "1px solid rgba(56, 189, 248, 0.30)",
      color: "#7dd3fc",
      boxShadow: "0 0 14px rgba(56,189,248,0.35), 0 0 4px rgba(56,189,248,0.20)",
    },
    ringColor: "#38bdf8",
  },
  disqualified: {
    label: "DISQUALIFIED",
    color: "#6b7280",
    glowColor: "#6b7280",
    textStyle: { color: "#9ca3af" },
    badgeStyle: {
      background: "rgba(107, 114, 128, 0.12)",
      border: "1px solid rgba(107, 114, 128, 0.30)",
      color: "#9ca3af",
      boxShadow: "0 0 8px rgba(107,114,128,0.20)",
    },
    ringColor: "#6b7280",
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
        // non-fatal
      });
    }
  }, [run?.status, run?.output, runState?.runId]);

  if (!runState) return <IdleState />;
  if (error) return <ErrorState message={error.message ?? "An unexpected error occurred."} />;

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
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-5 text-center px-8 py-12">
      <div className="relative">
        <div
          className="w-18 h-18 rounded-2xl flex items-center justify-center"
          style={{
            width: "4.5rem",
            height: "4.5rem",
            background: "rgba(56, 189, 248, 0.06)",
            border: "1px solid rgba(56, 189, 248, 0.15)",
          }}
        >
          <ChartIcon className="w-9 h-9" style={{ color: "rgba(56,189,248,0.4)" }} />
        </div>
        <div
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{ boxShadow: "0 0 20px rgba(56,189,248,0.12)", borderRadius: "1rem" }}
        />
      </div>
      <div>
        <p className="text-base font-semibold font-heading" style={{ color: "oklch(0.80 0.010 220)" }}>
          No analysis yet
        </p>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "oklch(0.52 0.015 220)" }}>
          Fill in the lead details on the left and click{" "}
          <span style={{ color: "oklch(0.72 0.20 195)", fontWeight: 500 }}>Analyze Lead</span>{" "}
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
  const message = (status && STATUS_MESSAGES[status]) ?? "Connecting to AI pipeline…";

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-6 px-8 py-12">
      {/* Double-ring spinner */}
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="rgba(56,189,248,0.12)" strokeWidth="3" />
          <circle cx="32" cy="32" r="20" stroke="rgba(56,189,248,0.06)" strokeWidth="3" />
        </svg>
        <svg
          className="w-full h-full absolute inset-0 animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          style={{ animationDuration: "1.2s" }}
        >
          <path
            d="M60 32a28 28 0 00-28-28"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <svg
          className="w-full h-full absolute inset-0 animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
        >
          <path
            d="M32 12a20 20 0 0120 20"
            stroke="rgba(56,189,248,0.45)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.18)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#38bdf8", animation: "dot-bounce 1.2s ease-in-out infinite" }}
          />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase font-heading" style={{ color: "#7dd3fc" }}>
            Processing
          </span>
        </div>
        <p className="text-sm font-semibold font-heading" style={{ color: "oklch(0.80 0.010 220)" }}>
          Analyzing Lead
        </p>
        <p className="text-xs mt-1.5 leading-relaxed max-w-56" style={{ color: "oklch(0.52 0.015 220)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center px-8 py-12">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.18)",
        }}
      >
        <XCircleIcon className="w-8 h-8" style={{ color: "rgba(248,113,113,0.7)" }} />
      </div>
      <div>
        <p className="text-base font-semibold font-heading" style={{ color: "oklch(0.80 0.010 220)" }}>
          Analysis failed
        </p>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "oklch(0.52 0.015 220)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────────────────

function ResultDisplay({ result }: { result: QualificationResult }) {
  const tier = TIER_CONFIG[result.tier];
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - result.score / 100);

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const end = result.score;
    const duration = 1400;
    const startTime = performance.now();
    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(ease * end));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [result.score]);

  const barWidth = `${Math.round(result.confidence * 100)}%`;

  return (
    <div className="panel-appear flex flex-col gap-5">
      {/* Score + tier header */}
      <div className="fade-up fade-up-1 flex items-center gap-5">
        {/* Score ring */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 152 152" fill="none">
            {/* Outer glow ring */}
            <circle
              cx="76"
              cy="76"
              r={radius + 8}
              stroke={tier.ringColor}
              strokeWidth="1"
              opacity="0.08"
            />
            {/* Track */}
            <circle
              cx="76"
              cy="76"
              r={radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Fill */}
            <circle
              cx="76"
              cy="76"
              r={radius}
              stroke={tier.ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="score-ring"
              style={
                {
                  "--ring-circumference": circumference,
                  "--ring-offset": offset,
                  filter: `drop-shadow(0 0 6px ${tier.ringColor}60)`,
                } as React.CSSProperties
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold leading-none font-mono tabular-nums"
              style={{ ...tier.textStyle, textShadow: `0 0 20px ${tier.glowColor}40` }}
            >
              {displayScore}
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase mt-1 font-heading"
                  style={{ color: "oklch(0.52 0.015 220)" }}>
              Score
            </span>
          </div>
        </div>

        {/* Tier + summary */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          <span
            className="inline-flex self-start items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] font-heading"
            style={tier.badgeStyle}
          >
            {tier.label}
          </span>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.78 0.010 220)" }}>
            {result.summary}
          </p>
        </div>
      </div>

      {/* Strengths + Concerns */}
      <div className="fade-up fade-up-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignalList title="Strengths" items={result.strengths} variant="positive" />
        <SignalList title="Concerns" items={result.concerns} variant="negative" />
      </div>

      {/* Recommendation */}
      <div className="fade-up fade-up-3 rounded-xl p-4"
           style={{
             background: "linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(14,165,233,0.04) 100%)",
             border: "1px solid rgba(56,189,248,0.15)",
             borderLeft: "2px solid rgba(56,189,248,0.55)",
           }}>
        <p className="text-[9px] font-bold tracking-[0.16em] uppercase font-heading mb-2"
           style={{ color: "rgba(56,189,248,0.65)" }}>
          Recommended Next Step
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.85 0.010 220)" }}>
          {result.recommendation}
        </p>
      </div>

      {/* Confidence */}
      <div className="fade-up fade-up-4 flex items-center gap-3">
        <span className="text-[11px] font-heading tracking-wide whitespace-nowrap"
              style={{ color: "oklch(0.50 0.012 220)" }}>
          AI Confidence
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden"
             style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full confidence-bar"
            style={{
              "--bar-width": barWidth,
              background: `linear-gradient(90deg, ${tier.ringColor}cc, ${tier.ringColor})`,
              opacity: 0.8,
            } as React.CSSProperties}
          />
        </div>
        <span className="text-[11px] font-mono tabular-nums w-8 text-right"
              style={{ color: "oklch(0.52 0.015 220)" }}>
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
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p className="text-[9px] font-bold tracking-[0.14em] uppercase font-heading"
         style={{ color: "oklch(0.50 0.012 220)" }}>
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-0.5 shrink-0 rounded-full p-0.5"
              style={{
                background: isPositive ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.10)",
              }}
            >
              {isPositive ? (
                <CheckIcon className="w-3 h-3" style={{ color: "#34d399" }} />
              ) : (
                <AlertIcon className="w-3 h-3" style={{ color: "#fbbf24" }} />
              )}
            </span>
            <span className="text-xs leading-relaxed" style={{ color: "oklch(0.72 0.010 220)" }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16l4-4 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2L14 13H2L8 2z" strokeLinejoin="round" />
      <path d="M8 7v3M8 11.5v.5" strokeLinecap="round" />
    </svg>
  );
}
