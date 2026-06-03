"use client";

import { useState } from "react";

export function UpgradePrompt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
      }
    } catch {
      setError("Could not connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-8 px-4 text-center">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-destructive"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 102 0V7zm-1 7a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div>
        <p className="font-bold text-base font-heading tracking-tight">
          Daily limit reached
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Free accounts can qualify{" "}
          <span className="font-medium text-foreground">2 leads per day</span>.
          Upgrade to Pro for unlimited qualifications.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold font-heading tracking-wide px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
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
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Redirecting…
            </>
          ) : (
            "Upgrade to Pro — $29/month"
          )}
        </button>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <p className="text-xs text-muted-foreground">
          Cancel anytime · Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}
