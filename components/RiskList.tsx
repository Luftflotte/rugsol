"use client";

import { useState } from "react";
import { PenaltyDetail } from "@/lib/scoring/engine";
import { AlertTriangle, ShieldAlert, DollarSign, Users, Database, ChevronDown, ChevronUp, LockOpen, Link as LinkIcon } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface RiskListProps {
  penalties: PenaltyDetail[];
}

function getIconForCategory(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("critical") || cat.includes("authority") || cat.includes("honeypot")) return <ShieldAlert className="w-5 h-5 text-red-500" />;
  if (cat.includes("low liquidity")) return <DollarSign className="w-5 h-5 text-red-500" />;
  if (cat.includes("locked")) return <LockOpen className="w-5 h-5 text-orange-500" />;
  if (cat.includes("liquidity")) return <DollarSign className="w-5 h-5 text-orange-500" />;
  if (cat.includes("holder") || cat.includes("concentration")) return <Users className="w-5 h-5 text-yellow-500" />;
  if (cat.includes("dev") || cat.includes("insider")) return <Users className="w-5 h-5 text-purple-500" />;
  if (cat.includes("sniper") || cat.includes("bundle")) return <AlertTriangle className="w-5 h-5 text-red-500" />;
  if (cat.includes("metadata")) return <Database className="w-5 h-5 text-blue-500" />;
  if (cat.includes("social")) return <LinkIcon className="w-5 h-5 text-yellow-500" />;
  return <AlertTriangle className="w-5 h-5 text-text-secondary" />;
}

function RiskItem({ penalty }: { penalty: PenaltyDetail }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border-color/20 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3.5 px-3 hover:bg-bg-secondary/50 rounded-xl transition-all duration-200 text-left group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2.5 bg-bg-secondary rounded-xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
            {getIconForCategory(penalty.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text-primary group-hover:text-text-primary/90 transition-colors">{penalty.category}</div>
            <div className="text-xs text-text-secondary line-clamp-1 mt-0.5">{penalty.reason}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-red-400 font-mono font-bold text-sm bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">-{penalty.points}</span>
          <div className="transition-transform duration-200 group-hover:scale-110">
            {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </div>
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-40 opacity-100 mb-2' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 md:px-14 pb-3 text-xs text-text-secondary leading-relaxed bg-bg-secondary/30 rounded-lg mx-3 p-3">
          <p className="mb-2 flex items-start gap-2">
            <span className="text-red-400 flex-shrink-0">⚠</span>
            <span><strong className="text-text-primary font-semibold">Issue:</strong> {penalty.reason}</span>
          </p>
          <p className={`${penalty.isCritical ? 'text-red-400 font-medium' : ''}`}>
            {penalty.isCritical
              ? "🚨 CRITICAL: This is a major security flaw. High probability of being a scam."
              : "This factor negatively impacts the token's safety score. High accumulation of these risks indicates a potential rug pull or low-quality project."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function RiskList({ penalties }: RiskListProps) {
  // Sort by points descending
  const sorted = [...penalties].sort((a, b) => b.points - a.points);
  const totalPenalty = penalties.reduce((sum, p) => sum + p.points, 0);

  let severityLabel = "";
  if (totalPenalty > 170) severityLabel = "Almost Certain Scam";
  else if (totalPenalty > 130) severityLabel = "Extreme Risk";
  else if (totalPenalty >= 100) severityLabel = "Likely Scam";

  return (
    <div className="glass-card border border-red-500/20 rounded-3xl overflow-hidden hover:border-red-500/40 transition-all duration-500">
      {/* Header with gradient */}
      <div className="p-5 md:p-6 border-b border-red-500/20 bg-gradient-to-br from-red-500/10 via-bg-secondary/50 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            Risk Factors
            <InfoTooltip
              content={
                <div className="space-y-2">
                  <p className="font-bold text-text-primary">Risk Factors</p>
                  <p>All detected issues that reduce the token's safety score.</p>
                  <div className="space-y-1 text-[11px] mt-2">
                    <p><strong className="text-red-400">Critical Issues:</strong> Major security flaws (honeypots, authority issues)</p>
                    <p><strong className="text-orange-400">High Risk:</strong> Liquidity & rug pull indicators</p>
                    <p><strong className="text-yellow-400">Medium Risk:</strong> Holder concentration problems</p>
                    <p><strong className="text-purple-400">Insider Activity:</strong> Dev dumping, snipers, linked wallets</p>
                  </div>
                  <p className="text-[10px] opacity-70 mt-2">Each factor shows point deduction. Click to expand for details.</p>
                </div>
              }
              position="bottom"
            />
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">Total Issues:</span>
            <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
              {sorted.length}
            </span>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-lg font-black text-red-500 font-mono">-{totalPenalty} pts</span>
            {severityLabel && (
              <span className="text-[10px] font-bold text-white bg-gradient-to-r from-red-600 to-red-500 px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30 animate-pulse">
                {severityLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Risk items list */}
      <div className="p-3">
        {sorted.map((p, idx) => (
          <div
            key={idx}
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <RiskItem penalty={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
