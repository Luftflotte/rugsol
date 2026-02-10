"use client";

import { useState } from "react";
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
  switch (status) {
    case "pass":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "fail":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <HelpCircle className="w-5 h-5 text-gray-500" />;
  }
}

function CheckRow({ check }: { check: CheckItem }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="py-1 sm:py-1.5 md:py-3 px-1.5 sm:px-3 md:px-4 hover:bg-bg-secondary rounded-lg transition-colors group overflow-visible">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
        {/* Name and status */}
        <div className="flex items-center gap-2 md:gap-3">
          <StatusIcon status={check.status} />
          <span className="text-xs md:text-sm text-text-secondary">{check.name}</span>
        </div>

        {/* Value, penalty, tooltip */}
        <div className="flex items-center gap-2 pl-7 md:pl-0 flex-wrap">
          <span
            className={`text-xs md:text-sm font-mono break-all ${
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
            <span className="text-[10px] md:text-xs text-red-400 bg-red-500/10 px-1.5 md:px-2 py-0.5 rounded">
              -{check.penalty}
            </span>
          ) : null}

          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-1 text-text-muted hover:text-text-secondary transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>

            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 z-50 w-48 md:w-64 p-2 md:p-3 bg-bg-card border border-border-color rounded-lg shadow-xl text-xs text-text-secondary">
                {check.tooltip}
              </div>
            )}
          </div>
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
      className={`rounded-xl border ${severityColors[group.severity]} overflow-hidden`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`text-xs md:text-sm font-semibold ${severityLabels[group.severity].color}`}>
            {severityLabels[group.severity].text}
          </span>
          <span className="text-[10px] md:text-xs text-text-muted">
            {group.checks.length} checks
          </span>
          {failedCount > 0 && (
            <span className="text-[10px] md:text-xs bg-red-500/20 text-red-400 px-1.5 md:px-2 py-0.5 rounded-full">
              {failedCount} issues
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border-color">
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
    <div className="space-y-4">
      {groups.map((group, index) => (
        <CheckGroupAccordion key={index} group={group} />
      ))}
    </div>
  );
}
