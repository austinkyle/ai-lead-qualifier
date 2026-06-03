"use client";

import { useEffect, useState } from "react";
import type { UsageStatus } from "@/lib/types";

export function UsageBadge() {
  const [usage, setUsage] = useState<UsageStatus | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: UsageStatus) => setUsage(data))
      .catch(() => null);
  }, []);

  if (!usage) return null;

  if (usage.isPro) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold font-heading tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
        Pro
      </span>
    );
  }

  const atLimit = usage.used >= (usage.limit ?? 2);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-heading tracking-wide px-2 py-0.5 rounded-full border ${
        atLimit
          ? "bg-destructive/10 text-destructive border-destructive/30"
          : "bg-muted/50 text-muted-foreground border-border/50"
      }`}
    >
      {usage.used}/{usage.limit} today
    </span>
  );
}
