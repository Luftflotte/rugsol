"use client";

import { useState } from "react";
import { PenaltyDetail } from "@/lib/scoring/engine";
import { AlertTriangle, ShieldAlert, DollarSign, Users, Database, ChevronDown, ChevronUp, LockOpen, Link as LinkIcon } from "lucide-react";

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
    <div className="border-b border-border-color/30 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-2 hover:bg-bg-secondary/50 rounded-lg transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bg-secondary rounded-lg">
            {getIconForCategory(penalty.category)}
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{penalty.category}</div>
            <div className="text-xs text-text-secondary line-clamp-1">{penalty.reason}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-red-400 font-mono font-bold">-{penalty.points}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-14 pb-3 text-xs text-text-secondary leading-relaxed animate-in slide-in-from-top-2 duration-200">
          <p className="mb-1"><strong className="text-text-primary">Issue:</strong> {penalty.reason}</p>
          <p>
            {penalty.isCritical 
              ? "CRITICAL: This is a major security flaw. High probability of being a scam." 
              : "This factor negatively impacts the token's safety score. High accumulation of these risks indicates a potential rug pull or low-quality project."}
          </p>
        </div>
      )}
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
    <div className="bg-bg-card border border-border-color rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border-color bg-bg-secondary/30 flex justify-between items-center">
        <h3 className="font-bold text-text-primary flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Risk Factors
        </h3>
        <div className="text-right">
           <span className="text-sm font-bold text-red-500 block">Total Penalty: -{totalPenalty}</span>
           {severityLabel && (
             <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">{severityLabel}</span>
           )}
        </div>
      </div>
      <div className="p-2">
        {sorted.map((p, idx) => (
          <RiskItem key={idx} penalty={p} />
        ))}
      </div>
    </div>
  );
}
