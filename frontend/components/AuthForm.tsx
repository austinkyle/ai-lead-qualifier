"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo("Check your email for a confirmation link, then sign in.");
        setMode("signin");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="rounded-2xl p-8"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-7">
          <h2 className="text-2xl font-bold font-heading tracking-tight gradient-text">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "oklch(0.52 0.015 220)" }}>
            {mode === "signin"
              ? "Sign in to your account to continue."
              : "Sign up to start qualifying leads."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium" style={{ color: "oklch(0.75 0.010 220)" }}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={loading}
              className="focus-glow"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium" style={{ color: "oklch(0.75 0.010 220)" }}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="focus-glow"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2"
               style={{
                 color: "#fca5a5",
                 background: "rgba(248,113,113,0.10)",
                 border: "1px solid rgba(248,113,113,0.20)",
               }}>
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm rounded-lg px-3 py-2"
               style={{
                 color: "#7dd3fc",
                 background: "rgba(56,189,248,0.10)",
                 border: "1px solid rgba(56,189,248,0.20)",
               }}>
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full h-11 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LoadingDots />
                <span>Please wait…</span>
              </span>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="text-sm transition-colors"
            style={{ color: "oklch(0.50 0.012 220)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.72 0.20 195)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.012 220)"; }}
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
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
