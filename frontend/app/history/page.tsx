import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LeadQualificationRow } from "@/lib/types";

const TIER_CONFIG = {
  hot: {
    label: "HOT",
    badgeStyle: {
      background: "rgba(248,113,113,0.12)",
      border: "1px solid rgba(248,113,113,0.28)",
      color: "#fca5a5",
      boxShadow: "0 0 10px rgba(248,113,113,0.25)",
    },
  },
  warm: {
    label: "WARM",
    badgeStyle: {
      background: "rgba(251,191,36,0.12)",
      border: "1px solid rgba(251,191,36,0.28)",
      color: "#fcd34d",
      boxShadow: "0 0 10px rgba(251,191,36,0.25)",
    },
  },
  cold: {
    label: "COLD",
    badgeStyle: {
      background: "rgba(56,189,248,0.12)",
      border: "1px solid rgba(56,189,248,0.28)",
      color: "#7dd3fc",
      boxShadow: "0 0 10px rgba(56,189,248,0.25)",
    },
  },
  disqualified: {
    label: "DISQ",
    badgeStyle: {
      background: "rgba(107,114,128,0.12)",
      border: "1px solid rgba(107,114,128,0.25)",
      color: "#9ca3af",
      boxShadow: "none",
    },
  },
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("lead_qualifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (leads ?? []) as LeadQualificationRow[];

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
          opacity: 0.055,
          animation: "orb-drift-1 18s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "50vw",
          height: "50vw",
          bottom: "-18vh",
          right: "-10vw",
          background: "radial-gradient(circle, oklch(0.72 0.20 190 / 100%), transparent 70%)",
          opacity: 0.04,
          animation: "orb-drift-2 22s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 border-b sticky top-0"
        style={{
          borderColor: "rgba(255,255,255,0.07)",
          background: "rgba(8, 12, 28, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.22 225), oklch(0.72 0.20 190))",
                boxShadow: "0 0 14px oklch(0.62 0.22 215 / 40%)",
              }}
            >
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
          <Link
            href="/"
            className="text-xs font-heading tracking-wide transition-colors"
            style={{ color: "oklch(0.52 0.015 220)" }}
          >
            ← Back to qualifier
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold font-heading tracking-tight leading-tight">
            <span className="gradient-text">Lead</span>{" "}
            <span style={{ color: "oklch(0.93 0.008 220)" }}>History</span>
          </h1>
          <p className="mt-3 text-sm lg:text-base" style={{ color: "oklch(0.52 0.015 220)" }}>
            All leads qualified under your account, most recent first.
          </p>
        </div>

        {rows.length === 0 ? (
          <div
            className="glass-panel rounded-2xl p-12 text-center"
            style={{ borderRadius: "1rem" }}
          >
            <p className="text-sm font-semibold font-heading" style={{ color: "oklch(0.72 0.010 220)" }}>
              No qualifications yet
            </p>
            <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.012 220)" }}>
              Head back to the qualifier and analyze your first lead.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-sm font-medium transition-colors"
              style={{ color: "oklch(0.68 0.20 205)" }}
            >
              Qualify a lead →
            </Link>
          </div>
        ) : (
          <div
            className="glass-panel rounded-2xl overflow-hidden"
            style={{ borderRadius: "1rem" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold tracking-[0.12em] uppercase font-heading"
                      style={{ color: "oklch(0.48 0.012 220)" }}>
                    Company
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold tracking-[0.12em] uppercase font-heading hidden sm:table-cell"
                      style={{ color: "oklch(0.48 0.012 220)" }}>
                    Contact
                  </th>
                  <th className="text-center px-5 py-3.5 text-[10px] font-bold tracking-[0.12em] uppercase font-heading"
                      style={{ color: "oklch(0.48 0.012 220)" }}>
                    Score
                  </th>
                  <th className="text-center px-5 py-3.5 text-[10px] font-bold tracking-[0.12em] uppercase font-heading"
                      style={{ color: "oklch(0.48 0.012 220)" }}>
                    Tier
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-bold tracking-[0.12em] uppercase font-heading hidden md:table-cell"
                      style={{ color: "oklch(0.48 0.012 220)" }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => {
                  const tierKey = lead.tier ?? null;
                  const tier =
                    tierKey && tierKey in TIER_CONFIG
                      ? TIER_CONFIG[tierKey as keyof typeof TIER_CONFIG]
                      : null;

                  return (
                    <tr
                      key={lead.id}
                      className="group transition-colors duration-150"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.035)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <td className="px-5 py-4 font-medium" style={{ color: "oklch(0.88 0.008 220)" }}>
                        {lead.company_name}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell" style={{ color: "oklch(0.55 0.012 220)" }}>
                        {lead.contact_name}
                      </td>
                      <td className="px-5 py-4 text-center font-mono tabular-nums">
                        {lead.score != null ? (
                          <span style={{ color: "oklch(0.80 0.010 220)" }}>{lead.score}</span>
                        ) : (
                          <span style={{ color: "oklch(0.35 0.008 220)", fontSize: "0.75rem" }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {tier ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-[0.12em] font-heading"
                            style={tier.badgeStyle}
                          >
                            {tier.label}
                          </span>
                        ) : (
                          <span className="text-[9px] font-heading tracking-widest uppercase"
                                style={{ color: "oklch(0.40 0.008 220)" }}>
                            pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-xs hidden md:table-cell"
                          style={{ color: "oklch(0.50 0.012 220)" }}>
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

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
