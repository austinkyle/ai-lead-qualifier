"use client";

import { useState, useEffect, useRef } from "react";
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

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const resultPanelRef = useRef<HTMLDivElement>(null);

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

  function handleResultMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  }

  function handleResultMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div className="relative min-h-screen flex flex-col dot-grid overflow-x-hidden">
      {/* Animated gradient mesh orbs */}
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          top: "-25vh",
          left: "-15vw",
          background: "radial-gradient(circle, oklch(0.62 0.22 215 / 100%), transparent 70%)",
          opacity: 0.065,
          animation: "orb-drift-1 18s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "55vw",
          height: "55vw",
          bottom: "-20vh",
          right: "-12vw",
          background: "radial-gradient(circle, oklch(0.72 0.20 190 / 100%), transparent 70%)",
          opacity: 0.05,
          animation: "orb-drift-2 22s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          top: "40vh",
          left: "35vw",
          background: "radial-gradient(circle, oklch(0.65 0.18 230 / 100%), transparent 70%)",
          opacity: 0.035,
          animation: "orb-drift-3 30s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* Upgraded success banner */}
      {showUpgradedBanner && (
        <div className="relative z-20 border-b px-4 py-2.5 flex items-center justify-between"
             style={{ background: "oklch(0.62 0.22 215 / 10%)", borderColor: "oklch(0.62 0.22 215 / 20%)" }}>
          <p className="text-sm font-medium" style={{ color: "oklch(0.72 0.20 195)" }}>
            You&apos;re now on Pro — unlimited lead qualifications unlocked.
          </p>
          <button
            onClick={() => setShowUpgradedBanner(false)}
            className="ml-4 text-lg leading-none transition-opacity hover:opacity-80"
            style={{ color: "oklch(0.62 0.22 215)" }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b sticky top-0"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(8, 12, 28, 0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{
                   background: "linear-gradient(135deg, oklch(0.55 0.22 225), oklch(0.72 0.20 190))",
                   boxShadow: "0 0 14px oklch(0.62 0.22 215 / 40%)",
                 }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight font-heading gradient-text">
              LeadQualifier
            </span>
          </div>

          <div className="flex items-center gap-3">
            <UsageBadge />
            <Link
              href="/history"
              className="text-xs font-heading tracking-wide transition-colors"
              style={{ color: "oklch(0.58 0.018 220)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.93 0.008 220)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.58 0.018 220)"; }}
            >
              History
            </Link>
            <span style={{ color: "rgba(255,255,255,0.15)" }} className="text-xs">|</span>
            <span className="text-xs hidden sm:block truncate max-w-48" style={{ color: "oklch(0.50 0.015 220)" }}>
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main two-panel layout */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8 lg:py-12">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold font-heading tracking-tight leading-tight">
            <span className="gradient-text">Qualify</span>{" "}
            <span style={{ color: "oklch(0.93 0.008 220)" }}>Your Lead</span>
          </h1>
          <p className="mt-3 text-sm lg:text-base" style={{ color: "oklch(0.55 0.015 220)" }}>
            Fill in the details below. Claude AI will score and analyze the lead
            using the BANT framework in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left panel — form */}
          <div
            className="glass-panel rounded-2xl p-6 lg:sticky lg:top-24 transition-shadow duration-300 hover:glow-blue"
            style={{ borderRadius: "1rem" }}
          >
            <div className="mb-6">
              <h2 className="text-[10px] font-bold tracking-[0.18em] uppercase font-heading flex items-center gap-2"
                  style={{ color: "oklch(0.62 0.22 215 / 70%)" }}>
                <span className="w-5 h-px" style={{ background: "linear-gradient(90deg, oklch(0.62 0.22 215 / 60%), transparent)" }} />
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
          <div
            ref={resultPanelRef}
            className="glass-panel rounded-2xl p-6 min-h-[360px] flex flex-col"
            style={{
              borderRadius: "1rem",
              transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: "transform 0.18s ease-out, box-shadow 0.2s ease",
              willChange: "transform",
            }}
            onMouseMove={handleResultMouseMove}
            onMouseLeave={handleResultMouseLeave}
          >
            <div className="mb-6">
              <h2 className="text-[10px] font-bold tracking-[0.18em] uppercase font-heading flex items-center gap-2"
                  style={{ color: "oklch(0.62 0.22 215 / 70%)" }}>
                <span className="w-5 h-px" style={{ background: "linear-gradient(90deg, oklch(0.62 0.22 215 / 60%), transparent)" }} />
                Analysis Results
              </h2>
            </div>
            <div className="flex-1">
              {limitReached ? (
                <UpgradePrompt />
              ) : (
                <QualificationResult runState={runState} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-center" style={{ color: "oklch(0.40 0.012 220)" }}>
            Powered by{" "}
            <span style={{ color: "oklch(0.52 0.015 220)" }}>Claude claude-sonnet-4-6</span>{" "}
            via{" "}
            <span style={{ color: "oklch(0.52 0.015 220)" }}>Trigger.dev</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
