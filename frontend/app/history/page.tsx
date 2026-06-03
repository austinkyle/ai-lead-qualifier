import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LeadQualificationRow } from "@/lib/types";

const TIER_CONFIG = {
  hot: {
    label: "HOT",
    badgeClass:
      "bg-[oklch(0.65_0.22_15/12%)] border border-[oklch(0.65_0.22_15/30%)] text-[oklch(0.75_0.2_15)]",
  },
  warm: {
    label: "WARM",
    badgeClass:
      "bg-[oklch(0.78_0.17_72/12%)] border border-[oklch(0.78_0.17_72/30%)] text-[oklch(0.82_0.16_72)]",
  },
  cold: {
    label: "COLD",
    badgeClass:
      "bg-[oklch(0.72_0.14_220/12%)] border border-[oklch(0.72_0.14_220/30%)] text-[oklch(0.80_0.13_220)]",
  },
  disqualified: {
    label: "DISQ",
    badgeClass:
      "bg-[oklch(0.48_0.02_252/12%)] border border-[oklch(0.48_0.02_252/30%)] text-[oklch(0.65_0.02_252)]",
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
    <div className="relative min-h-screen flex flex-col dot-grid">
      {/* Ambient glow */}
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
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-heading tracking-wide"
          >
            ← Back to qualifier
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold font-heading tracking-tight leading-tight">
            Lead History
          </h1>
          <p className="text-muted-foreground mt-2 text-sm lg:text-base">
            All leads qualified under your account, most recent first.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-12 text-center">
            <p className="text-sm font-semibold text-foreground/70 font-heading">
              No qualifications yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Head back to the qualifier and analyze your first lead.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-primary hover:underline"
            >
              Qualify a lead →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground font-heading">
                    Company
                  </th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground font-heading hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground font-heading">
                    Score
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground font-heading">
                    Tier
                  </th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground font-heading hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead, i) => {
                  const tierKey = lead.tier ?? null;
                  const tier =
                    tierKey && tierKey in TIER_CONFIG
                      ? TIER_CONFIG[tierKey as keyof typeof TIER_CONFIG]
                      : null;

                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-border/20 last:border-0 ${
                        i % 2 === 0 ? "" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-5 py-4 font-medium text-foreground/90">
                        {lead.company_name}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">
                        {lead.contact_name}
                      </td>
                      <td className="px-5 py-4 text-center font-mono tabular-nums">
                        {lead.score != null ? (
                          <span className="text-foreground/80">{lead.score}</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {tier ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.12em] font-heading ${tier.badgeClass}`}
                          >
                            {tier.label}
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground/40 font-heading tracking-widest uppercase">
                            pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground text-xs hidden md:table-cell">
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
