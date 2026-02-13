"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

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

const severityColors = {
  critical: "border-red-500/30 bg-red-500/5",
  high: "border-orange-500/30 bg-orange-500/5",
  medium: "border-yellow-500/30 bg-yellow-500/5",
  low: "border-blue-500/30 bg-blue-500/5",
  insider: "border-purple-500/30 bg-purple-500/5",
};

const severityLabels = {
  critical: { text: "Critical", color: "text-red-500" },
  high: { text: "High Risk", color: "text-orange-500" },
  medium: { text: "Medium Risk", color: "text-yellow-500" },
  low: { text: "Low Risk", color: "text-blue-400" },
  insider: { text: "Insider Activity", color: "text-purple-400" },
};

function StatusIcon({ status }: { status: CheckStatus }) {
  const baseClasses = "w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-200";
  switch (status) {
    case "pass":
      return (
        <div className={`${baseClasses} bg-green-500/10 border border-green-500/25`}>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        </div>
      );
    case "warning":
      return (
        <div className={`${baseClasses} bg-yellow-500/10 border border-yellow-500/25`}>
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        </div>
      );
    case "fail":
      return (
        <div className={`${baseClasses} bg-red-500/10 border border-red-500/25`}>
          <XCircle className="w-4 h-4 text-red-400" />
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} bg-[var(--bg-secondary)] border border-border-color`}>
          <HelpCircle className="w-4 h-4 text-text-muted" />
        </div>
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
      const tooltipWidth = 256;
      const gap = 8;

      let top = rect.bottom + gap;
      let left = rect.right - tooltipWidth;

      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }

      setTooltipStyle({ top: `${top}px`, left: `${left}px` });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip, mounted]);

  return (
    <div className="py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 hover:bg-bg-secondary/50 rounded-xl transition-all duration-200 group overflow-visible hover:shadow-sm border border-transparent hover:border-border-color">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        {/* Name and status */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="transition-transform duration-200 group-hover:scale-110">
            <StatusIcon status={check.status} />
          </div>
          <span className="text-xs md:text-sm text-text-secondary font-medium group-hover:text-text-primary transition-colors">{check.name}</span>
        </div>

        {/* Value, penalty, tooltip */}
        <div className="flex items-center gap-2 pl-7 md:pl-0 flex-wrap">
          <span
            className={`text-xs md:text-sm font-mono font-semibold break-all ${
              check.status === "pass"
                ? "text-green-400"
                : check.status === "fail"
                ? "text-red-400"
                : check.status === "warning"
                ? "text-yellow-400"
                : "text-text-muted"
            }`}
          >
            {check.value}
          </span>

          {check.penalty && check.penalty > 0 ? (
            <span className="text-[10px] md:text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/20 px-1.5 md:px-2 py-0.5 rounded-md">
              -{check.penalty}
            </span>
          ) : null}

          <button
            ref={buttonRef}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-1.5 text-text-muted hover:text-text-primary transition-all duration-200 hover:bg-bg-secondary rounded-lg"
          >
            <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          {showTooltip && mounted &&
            createPortal(
              <div
                className="fixed z-[9999] w-48 md:w-64 p-3 md:p-4 bg-bg-card border border-border-color rounded-xl shadow-2xl text-xs text-text-secondary animate-fade-in-up backdrop-blur-xl"
                style={tooltipStyle}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <div className="absolute -top-1 right-4 w-2 h-2 bg-bg-card border-t border-l border-border-color rotate-45" />
                <div className="relative z-10">{check.tooltip}</div>
              </div>,
              document.body
            )}
        </div>
      </div>
    </div>
  );
}

function CheckGroupAccordion({ group }: { group: CheckGroup }) {
  const [isOpen, setIsOpen] = useState(true);

  const failedCount = group.checks.filter(
    (c) => c.status === "fail" || c.status === "warning"
  ).length;

  return (
    <div
      className={`rounded-2xl border ${severityColors[group.severity]} overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-bg-secondary/50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* Severity indicator dot */}
          <div className={`w-2 h-2 rounded-full ${
            group.severity === 'critical' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' :
            group.severity === 'high' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
            group.severity === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
            group.severity === 'low' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
            'bg-purple-400 shadow-lg shadow-purple-400/50'
          }`} />
          <span className={`text-sm md:text-base font-bold ${severityLabels[group.severity].color}`}>
            {severityLabels[group.severity].text}
          </span>
          <span className="text-[10px] md:text-xs text-text-muted font-medium bg-bg-secondary/50 px-2 py-0.5 rounded-full">
            {group.checks.length} checks
          </span>
          {failedCount > 0 && (
            <span className="text-[10px] md:text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 md:px-2.5 py-0.5 rounded-full animate-pulse">
              {failedCount} {failedCount === 1 ? 'issue' : 'issues'}
            </span>
          )}
        </div>
        <div className="transition-transform duration-300 group-hover:scale-110">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="border-t border-border-color p-2">
          {group.checks.map((check, idx) => (
            <div
              key={check.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <CheckRow check={check} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Checklist({ groups }: ChecklistProps) {
  return (
    <div className="space-y-3">
      {groups.map((group, index) => (
        <CheckGroupAccordion key={index} group={group} />
      ))}
    </div>
  );
}
