"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { QualificationResult } from "@/components/QualificationResult";
import { SignOutButton } from "@/components/SignOutButton";
import { UsageBadge } from "@/components/UsageBadge";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import type { RunState } from "@/lib/types";

type Props = {
  userEmail: string;
  userId: string;
};

export function LeadQualifierApp({ userEmail, userId: _userId }: Props) {
  const [runState, setRunState] = useState<RunState>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(false);
  const isRunning = !!runState && typeof window !== "undefined";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      setShowUpgradedBanner(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  function handleLimitReached() {
    setRunState(null);
    setLimitReached(true);
  }

  function handleResult(state: RunState) {
    setLimitReached(false);
    setRunState(state);
  }

  return (
    <div className="relative min-h-screen flex flex-col dot-grid">
      {/* Ambient glow top-left */}
      <div
        className="pointer-events-none fixed top-[-20vh] left-[-10vw] w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.19 265), transparent 70%)",
        }}
      />

      {/* Upgraded success banner */}
      {showUpgradedBanner && (
        <div className="relative z-20 bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-primary font-medium">
            You&apos;re now on Pro — unlimited lead qualifications unlocked.
          </p>
          <button
            onClick={() => setShowUpgradedBanner(false)}
            className="text-primary/60 hover:text-primary ml-4 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/70 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-foreground"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight font-heading">
              LeadQualifier
            </span>
          </div>

          <div className="flex items-center gap-3">
            <UsageBadge />
            <Link
              href="/history"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-heading tracking-wide"
            >
              History
            </Link>
            <span className="text-border/60 text-xs">|</span>
            <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-48">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main two-panel layout */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold font-heading tracking-tight leading-tight">
            Qualify Your Lead
          </h1>
          <p className="text-muted-foreground mt-2 text-sm lg:text-base">
            Fill in the details below. Claude AI will score and analyze the lead
            using the BANT framework in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left panel — form */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 lg:sticky lg:top-24">
            <div className="mb-5">
              <h2 className="text-sm font-bold tracking-[0.08em] uppercase text-muted-foreground font-heading">
                Lead Information
              </h2>
            </div>
            <LeadForm
              onResult={handleResult}
              onLimitReached={handleLimitReached}
              isRunning={isRunning}
            />
          </div>

          {/* Right panel — results or upgrade prompt */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 min-h-[340px] flex flex-col justify-center">
            <div className="mb-5">
              <h2 className="text-sm font-bold tracking-[0.08em] uppercase text-muted-foreground font-heading">
                Analysis Results
              </h2>
            </div>
            {limitReached ? (
              <UpgradePrompt />
            ) : (
              <QualificationResult runState={runState} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-muted-foreground/50 text-center">
            Powered by{" "}
            <span className="text-muted-foreground/70">Claude claude-sonnet-4-6</span>{" "}
            via{" "}
            <span className="text-muted-foreground/70">Trigger.dev</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
