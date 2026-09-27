"use client";

import { HolderInfo } from "@/lib/solana/holders";
import { ExternalLink } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface HolderChartProps {
  holders: HolderInfo[];
  devAddress?: string;
  snipers?: string[];
  linkedWallets?: Record<string, string>;
  className?: string;
}

export function HolderChart({
  holders,
  devAddress,
  snipers = [],
  linkedWallets = {},
  className,
}: HolderChartProps) {
  const displayHolders = holders.slice(0, 10);
  const top10Total = displayHolders.reduce((acc, h) => acc + h.percent, 0);

  const getHolderMeta = (holder: HolderInfo) => {
    if (holder.isLpPool) {
      return {
        label: "LP POOL",
        color: "text-sky-400 bg-sky-500/10 border-sky-500/25",
        barColor: "bg-sky-500",
      };
    }
    if (devAddress && holder.owner === devAddress) {
      return {
        label: "DEV WALLET",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/25",
        barColor: "bg-purple-500",
      };
    }
    if (snipers.includes(holder.owner)) {
      return {
        label: "SNIPER",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/25",
        barColor: "bg-rose-500",
      };
    }
    if (linkedWallets[holder.owner]) {
      return {
        label: `CLUSTER ${linkedWallets[holder.owner]}`,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/25",
        barColor: "bg-amber-500",
      };
    }
    if (holder.percent > 15) {
      return {
        label: "WHALE",
        color: "text-orange-400 bg-orange-500/10 border-orange-500/25",
        barColor: "bg-orange-500",
      };
    }
    return {
      label: "HOLDER",
      color: "text-[#94a3b8] bg-[#161b26] border-[#1e2433]",
      barColor: "bg-[#38bdf8]",
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top 10 Summary Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#121622] rounded-lg border border-[#1e2433]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748b]">TOP 10 CONCENTRATION:</span>
          <span
            className={`text-sm font-mono font-bold tabular-nums ${
              top10Total > 60
                ? "text-rose-400"
                : top10Total > 40
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {top10Total.toFixed(2)}%
          </span>
          <span className="text-[10px] font-mono text-[#64748b]">
            ({top10Total > 50 ? "HIGH CONCENTRATION" : "HEALTHY SPREAD"})
          </span>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
          <span className="inline-flex items-center gap-1 text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> LP
          </span>
          <span className="inline-flex items-center gap-1 text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Dev
          </span>
          <span className="inline-flex items-center gap-1 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Sniper
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Cluster
          </span>
          <span className="inline-flex items-center gap-1 text-[#38bdf8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" /> Whale
          </span>
        </div>
      </div>

      {/* Holder Table / Rows */}
      <div className="space-y-2">
        {displayHolders.map((holder, idx) => {
          const meta = getHolderMeta(holder);
          const shortAddr = `${holder.owner.slice(0, 4)}...${holder.owner.slice(-4)}`;

          return (
            <div
              key={holder.owner}
              className="p-2.5 rounded-lg bg-[#0e1118] border border-[#1e2433] hover:border-[#2a3449] transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] text-[#64748b] w-5">
                    #{idx + 1}
                  </span>
                  <a
                    href={`https://solscan.io/account/${holder.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors flex items-center gap-1"
                    title={holder.owner}
                  >
                    <span>{shortAddr}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#64748b] hidden sm:inline tabular-nums">
                    {parseInt(holder.amount).toLocaleString()}
                  </span>
                  <span className="font-mono font-bold text-xs text-[#f8fafc] tabular-nums">
                    {holder.percent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Progress bar track */}
              <div className="h-1.5 w-full bg-[#161b26] rounded-full overflow-hidden">
                <div
                  className={`h-full ${meta.barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(1, holder.percent))}%` }}
                />
              </div>
            </div>
          );
        })}

        {displayHolders.length === 0 && (
          <div className="text-center py-6 text-xs font-mono text-[#64748b]">
            NO ON-CHAIN HOLDER DATA AVAILABLE FOR THIS TOKEN
          </div>
        )}
      </div>
    </div>
  );
}
