"use client";

import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { QualificationResult } from "@/components/QualificationResult";
import type { RunState } from "@/lib/types";

export default function Home() {
  const [runState, setRunState] = useState<RunState>(null);
  const isRunning =
    !!runState &&
    typeof window !== "undefined";

  function handleResult(state: RunState) {
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground font-heading px-2.5 py-1 rounded-full border border-border/40 bg-muted/30">
              AI‑Powered
            </span>
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
            <LeadForm onResult={handleResult} isRunning={isRunning} />
          </div>

          {/* Right panel — results */}
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 min-h-[340px] flex flex-col justify-center">
            <div className="mb-5">
              <h2 className="text-sm font-bold tracking-[0.08em] uppercase text-muted-foreground font-heading">
                Analysis Results
              </h2>
            </div>
            <QualificationResult runState={runState} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-muted-foreground/50 text-center">
            Powered by{" "}
            <span className="text-muted-foreground/70">Claude claude-sonnet-4-6</span> via{" "}
            <span className="text-muted-foreground/70">Trigger.dev</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
