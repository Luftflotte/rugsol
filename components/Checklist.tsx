"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Check, AlertTriangle, X, HelpCircle } from "lucide-react";

export type CheckStatus = "pass" | "warning" | "fail" | "unknown";

export interface CheckItem {
  id: string;
  name: string;
  status: CheckStatus;
  value: string | React.ReactNode;
  tooltip: string;
  penalty?: number;
}

export interface CheckGroup {
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "insider";
  checks: CheckItem[];
}

interface ChecklistProps {
  groups: CheckGroup[];
}

const severityMeta = {
  critical: {
    label: "CRITICAL CONTRACT SAFETY",
    color: "text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    border: "border-rose-500/20",
  },
  high: {
    label: "LIQUIDITY & POOL HEALTH",
    color: "text-orange-400",
    badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    border: "border-orange-500/20",
  },
  medium: {
    label: "HOLDER CONCENTRATION",
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    border: "border-amber-500/20",
  },
  insider: {
    label: "INSIDER & SNIPER ACTIVITY",
    color: "text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    border: "border-purple-500/20",
  },
  low: {
    label: "METADATA & SOCIAL VERIFICATION",
    color: "text-sky-400",
    badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    border: "border-sky-500/20",
  },
};

function StatusBadge({ status }: { status: CheckStatus }) {
  switch (status) {
    case "pass":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <Check className="w-3 h-3" />
          PASS
        </span>
      );
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          <AlertTriangle className="w-3 h-3" />
          WARN
        </span>
      );
    case "fail":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
          <X className="w-3 h-3" />
          FAIL
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#161b26] text-[#64748b] border border-[#1e2433]">
          N/A
        </span>
      );
  }
}

function CheckRow({ check }: { check: CheckItem }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showTooltip || !buttonRef.current || !mounted) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 280;
      const gap = 6;

      let top = rect.bottom + gap;
      let left = rect.right - tooltipWidth;

      const padding = 12;
      if (left < padding) left = padding;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }

      setTooltipStyle({ top: `${top}px`, left: `${left}px` });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { capture: true, passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip, mounted]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 px-3 border-b border-[#161b26] last:border-b-0 hover:bg-[#121620] transition-colors">
      {/* Check Name + Status Badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        <StatusBadge status={check.status} />
        <span className="text-xs sm:text-sm font-medium text-[#e2e8f0] truncate">
          {check.name}
        </span>
      </div>

      {/* Value + Penalty + Info */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        <span
          className={`text-xs font-mono font-medium ${
            check.status === "pass"
              ? "text-emerald-400"
              : check.status === "fail"
              ? "text-rose-400"
              : check.status === "warning"
              ? "text-amber-400"
              : "text-[#64748b]"
          }`}
        >
          {check.value}
        </span>

        {check.penalty && check.penalty > 0 ? (
          <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
            -{check.penalty} PTS
          </span>
        ) : null}

        <button
          ref={buttonRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="p-1 text-[#64748b] hover:text-[#94a3b8] transition-colors rounded"
          title="Details"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {showTooltip && mounted &&
          createPortal(
            <div
              className="fixed z-[9999] w-64 p-3 bg-[#0e1118] border border-[#1e2433] rounded-lg shadow-2xl text-xs text-[#94a3b8] leading-relaxed font-sans"
              style={tooltipStyle}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {check.tooltip}
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}

function CheckGroupSection({ group }: { group: CheckGroup }) {
  const [isOpen, setIsOpen] = useState(true);
  const meta = severityMeta[group.severity] || severityMeta.critical;

  const failedCount = group.checks.filter(
    (c) => c.status === "fail" || c.status === "warning"
  ).length;

  return (
    <div className={`rounded-xl border border-[#1e2433] bg-[#0e1118] overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-[#121622] hover:bg-[#161b2a] transition-colors border-b border-[#1e2433] text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`text-xs font-mono font-bold tracking-wider ${meta.color}`}>
            // {meta.label}
          </span>
          <span className="text-[10px] font-mono text-[#64748b] bg-[#090b10] px-2 py-0.5 rounded border border-[#1e2433]">
            {group.checks.length} CHECKS
          </span>
          {failedCount > 0 && (
            <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded">
              {failedCount} {failedCount === 1 ? "FLAG" : "FLAGS"}
            </span>
          )}
        </div>
        <div className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-[#161b26]">
          {group.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Checklist({ groups }: ChecklistProps) {
  return (
    <div className="space-y-3">
      {groups.map((group, index) => (
        <CheckGroupSection key={index} group={group} />
      ))}
    </div>
  );
}
