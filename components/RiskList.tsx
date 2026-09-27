"use client";

import { useState } from "react";
import { PenaltyDetail } from "@/lib/scoring/engine";
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, LockOpen, Users, DollarSign, Database, Flame } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface RiskListProps {
  penalties: PenaltyDetail[];
}

function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("critical") || cat.includes("authority") || cat.includes("honeypot")) {
    return <ShieldAlert className="w-4 h-4 text-rose-400" />;
  }
  if (cat.includes("liquidity") || cat.includes("pool")) {
    return <DollarSign className="w-4 h-4 text-orange-400" />;
  }
  if (cat.includes("lock")) {
    return <LockOpen className="w-4 h-4 text-amber-400" />;
  }
  if (cat.includes("holder") || cat.includes("concentration") || cat.includes("whale")) {
    return <Users className="w-4 h-4 text-amber-400" />;
  }
  if (cat.includes("sniper") || cat.includes("bundle")) {
    return <Flame className="w-4 h-4 text-rose-400" />;
  }
  return <AlertTriangle className="w-4 h-4 text-amber-400" />;
}

function RiskItemRow({ penalty }: { penalty: PenaltyDetail }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#161b26] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 hover:bg-[#121622] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded bg-[#161b26] border border-[#1e2433] shrink-0">
            {getCategoryIcon(penalty.category)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#f1f5f9] truncate">
                {penalty.category}
              </span>
              {penalty.isCritical && (
                <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded uppercase">
                  CRITICAL
                </span>
              )}
            </div>
            <p className="text-xs text-[#94a3b8] truncate mt-0.5">{penalty.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded">
            -{penalty.points} PTS
          </span>
          <div className="text-[#64748b]">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-3 sm:px-4 sm:pb-3.5 pt-0 bg-[#0a0d14] text-xs font-sans text-[#94a3b8] leading-relaxed border-t border-[#161b26]">
          <div className="p-2.5 rounded bg-[#121622] border border-[#1e2433] mt-2 space-y-1.5">
            <p className="text-[#e2e8f0]">
              <strong className="text-[#f8fafc] font-semibold">Diagnosis:</strong> {penalty.reason}
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              {penalty.isCritical
                ? "This is an unmitigated security vulnerability. The contract owner or deployer can exploit this to seize or liquidate user balances."
                : "This metric increases systemic risk and indicates vulnerability to insider dumping, sudden liquidity drainage, or heavy slippage."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function RiskList({ penalties }: RiskListProps) {
  const sorted = [...penalties].sort((a, b) => b.points - a.points);
  const totalPenalty = penalties.reduce((sum, p) => sum + p.points, 0);

  let severityLabel = "ELEVATED VULNERABILITIES";
  let severityColor = "text-amber-400 bg-amber-500/10 border-amber-500/25";

  if (totalPenalty >= 130) {
    severityLabel = "CRITICAL RUG PULL THREAT";
    severityColor = "text-rose-400 bg-rose-500/10 border-rose-500/25";
  } else if (totalPenalty >= 80) {
    severityLabel = "HIGH RISK PROFILE";
    severityColor = "text-orange-400 bg-orange-500/10 border-orange-500/25";
  }

  return (
    <div className="rounded-xl border border-rose-500/20 bg-[#0e1118] overflow-hidden">
      {/* Header telemetry */}
      <div className="p-3.5 sm:p-4 bg-[#141014] border-b border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-mono font-bold text-[#f1f5f9] tracking-wide">
                SECURITY VULNERABILITY LOG
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${severityColor}`}>
                {severityLabel}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Detected flaws triggering point deductions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#64748b] block">PENALTY TALLY</span>
            <span className="text-base font-mono font-bold text-rose-400 tabular-nums">
              -{totalPenalty} PTS
            </span>
          </div>
          <span className="text-xs font-mono text-[#64748b] bg-[#0e1118] px-2 py-1 rounded border border-[#1e2433]">
            {sorted.length} {sorted.length === 1 ? "ISSUE" : "ISSUES"}
          </span>
        </div>
      </div>

      {/* Issues list */}
      <div className="divide-y divide-[#161b26]">
        {sorted.map((p, idx) => (
          <RiskItemRow key={idx} penalty={p} />
        ))}
      </div>
    </div>
  );
}
