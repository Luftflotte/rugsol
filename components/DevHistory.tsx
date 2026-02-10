"use client";

import { useState, useEffect } from "react";
import { Lock, Skull, AlertTriangle, TrendingDown } from "lucide-react";
import { reloadNoirScript } from "@/lib/utils";

const FAKE_TOKENS = [
  {
    name: "$SCAM",
    status: "RUG PULLED",
    roi: "-100%",
    date: "2d ago",
    holders: "1,247",
  },
  {
    name: "$FAKE",
    status: "HONEYPOT",
    roi: "-99.8%",
    date: "5d ago",
    holders: "832",
  },
  {
    name: "$MOON69",
    status: "RUG PULLED",
    roi: "-99.2%",
    date: "11d ago",
    holders: "3,019",
  },
  {
    name: "$SAFEGEM",
    status: "DEV DUMPED",
    roi: "-97.5%",
    date: "18d ago",
    holders: "614",
  },
];

const statusColors: Record<string, string> = {
  "RUG PULLED": "text-red-500 bg-red-500/15 border-red-500/30",
  HONEYPOT: "text-red-400 bg-red-500/15 border-red-500/30",
  "DEV DUMPED": "text-orange-400 bg-orange-500/15 border-orange-500/30",
};

interface DevHistoryProps {
  score: number;
  isWhitelisted?: boolean;
  marketCap?: number | null;
  grade: string;
}

export function DevHistory({ score, isWhitelisted, marketCap, grade }: DevHistoryProps) {
  const [visible, setVisible] = useState(false);
  const [tokens, setTokens] = useState<typeof FAKE_TOKENS>([]);

  useEffect(() => {
    // Never show for whitelisted tokens
    if (isWhitelisted) return;

    // Never show for large cap tokens (>$1M)
    if (marketCap && marketCap > 1_000_000) return;

    // Never show for high-scoring tokens (A/B grade)
    if (score >= 80 || grade === "A" || grade === "B") return;

    // 90% chance for score <= 60, 40% chance for score > 60
    const chance = score <= 60 ? 0.9 : 0.4;
    const roll = Math.random();

    if (roll > chance) return;

    // Randomly pick 1 or 2 tokens from the pool
    const shuffled = [...FAKE_TOKENS].sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 1 : 2;
    setTokens(shuffled.slice(0, count));
    setVisible(true);

    // Reload script if we become visible
    // Use timeout to ensure DOM render
    setTimeout(() => reloadNoirScript(), 100);
  }, [score, isWhitelisted, marketCap, grade]);

  if (!visible) return null;

  return (
    <div className="glass-card rounded-3xl border border-border-color overflow-hidden relative group">
      {/* Section header */}
      <div className="flex items-center gap-3 p-5 md:p-6 border-b border-border-color">
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <Skull className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text-primary tracking-wide">
            Developer Token History
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Previous tokens launched by this developer
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
            High Risk
          </span>
        </div>
      </div>

      {/* Blurred table background */}
      <div className="relative">
        <div className="p-5 md:p-6">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 md:gap-4 pb-3 border-b border-border-color mb-1">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Token
            </span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">
              Holders
            </span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-center">
              Status
            </span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">
              ROI
            </span>
          </div>

          {/* Table rows — visible through blur */}
          <div className="space-y-1">
            {tokens.map((token, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-3 md:gap-4 items-center py-2.5 border-b border-border-color/50 last:border-b-0"
              >
                {/* Token name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-text-primary block truncate">
                      {token.name}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {token.date}
                    </span>
                  </div>
                </div>

                {/* Holders */}
                <span className="text-xs font-mono text-text-secondary text-right">
                  {token.holders}
                </span>

                {/* Status badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusColors[token.status]}`}
                >
                  {token.status}
                </span>

                {/* ROI */}
                <div className="flex items-center gap-1 justify-end">
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-sm font-mono font-bold text-red-500">
                    {token.roi}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay with blur */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Gradient backdrop — lets red bleed through */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-card)]/60 via-[var(--bg-card)]/80 to-[var(--bg-card)]/95 backdrop-blur-[6px]" />

          {/* CTA content */}
          <div className="relative z-20 flex flex-col items-center text-center px-6 py-4">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-border-color mb-4 shadow-lg">
              <Lock className="w-6 h-6 text-text-muted" />
            </div>

            <h4 className="text-base md:text-lg font-bold text-text-primary tracking-wide mb-1.5">
              Suspicious Developer Activity Detected
            </h4>
            <p className="text-xs text-text-muted max-w-xs mb-5">
              This developer has a history of deploying high-risk tokens.
              Sign in to reveal the full report.
            </p>

            <button className="noir-connect group/btn relative overflow-hidden px-6 py-3 rounded-xl font-bold text-sm bg-[var(--bg-secondary)] text-text-primary border border-border-color hover:border-silver-accent/50 shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-text-secondary" />
              Sign In to Reveal
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/15 to-transparent" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
