"use client";

import { useState } from "react";
import { PenaltyDetail } from "@/lib/scoring/engine";
import { AlertTriangle, ShieldAlert, DollarSign, Users, Database, ChevronDown, ChevronUp, LockOpen, Link as LinkIcon } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface RiskListProps {
  penalties: PenaltyDetail[];
}

function getIconForCategory(category: string): { icon: React.ReactNode; colorClasses: string } {
  const cat = category.toLowerCase();
  if (cat.includes("critical") || cat.includes("authority") || cat.includes("honeypot")) return { icon: <ShieldAlert className="w-4 h-4 text-red-400" />, colorClasses: "bg-red-500/10 border-red-500/25" };
  if (cat.includes("low liquidity")) return { icon: <DollarSign className="w-4 h-4 text-red-400" />, colorClasses: "bg-red-500/10 border-red-500/25" };
  if (cat.includes("locked")) return { icon: <LockOpen className="w-4 h-4 text-orange-400" />, colorClasses: "bg-orange-500/10 border-orange-500/25" };
  if (cat.includes("liquidity")) return { icon: <DollarSign className="w-4 h-4 text-orange-400" />, colorClasses: "bg-orange-500/10 border-orange-500/25" };
  if (cat.includes("holder") || cat.includes("concentration")) return { icon: <Users className="w-4 h-4 text-yellow-400" />, colorClasses: "bg-yellow-500/10 border-yellow-500/25" };
  if (cat.includes("dev") || cat.includes("insider")) return { icon: <Users className="w-4 h-4 text-purple-400" />, colorClasses: "bg-purple-500/10 border-purple-500/25" };
  if (cat.includes("sniper") || cat.includes("bundle")) return { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, colorClasses: "bg-red-500/10 border-red-500/25" };
  if (cat.includes("metadata")) return { icon: <Database className="w-4 h-4 text-blue-400" />, colorClasses: "bg-blue-500/10 border-blue-500/25" };
  if (cat.includes("social")) return { icon: <LinkIcon className="w-4 h-4 text-yellow-400" />, colorClasses: "bg-yellow-500/10 border-yellow-500/25" };
  return { icon: <AlertTriangle className="w-4 h-4 text-text-secondary" />, colorClasses: "bg-[var(--bg-secondary)] border-border-color" };
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
          {(() => {
            const { icon, colorClasses } = getIconForCategory(penalty.category);
            return (
              <div className={`p-2 rounded-xl border backdrop-blur-sm group-hover:scale-110 transition-all duration-200 flex-shrink-0 ${colorClasses}`}>
                {icon}
              </div>
            );
          })()}
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
    <div className="glass-card border border-red-500/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all duration-500">
      {/* Header with gradient */}
      <div className="p-5 md:p-6 border-b border-red-500/20 bg-gradient-to-br from-red-500/10 via-bg-secondary/50 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
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
            <p className="text-sm text-text-secondary">Detected issues reducing the safety score.</p>
          </div>
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
