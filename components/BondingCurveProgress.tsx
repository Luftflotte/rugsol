"use client";

import { useMemo } from "react";
import { Flame, CheckCircle, Info } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface BondingCurveProgressProps {
  progressPercent: number; // 0-100
  marketCapSol?: number | null;
  remainingSol?: number | null;
  solPrice?: number | null;
}

export function BondingCurveProgress({
  progressPercent,
  marketCapSol,
  remainingSol,
  solPrice,
}: BondingCurveProgressProps) {
  const remainingUsd = useMemo(() => {
    const TARGET_GRADUATION_MC_USD = 112000;
    if (progressPercent >= 100) return 0;
    return (1 - progressPercent / 100) * TARGET_GRADUATION_MC_USD;
  }, [progressPercent]);

  const collectedSol = useMemo(() => {
    if (remainingSol === null || remainingSol === undefined) return null;
    return Math.max(0, 85 - remainingSol);
  }, [remainingSol]);

  const isGraduated = progressPercent >= 100;

  return (
    <div className="w-full bg-[#0e1118] border border-amber-500/20 rounded-xl p-4 sm:p-5">
      {/* Header telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase">
              PUMP.FUN BONDING CURVE TELEMETRY
            </h3>
            <InfoTooltip
              content={
                <div className="space-y-1.5 font-sans">
                  <p className="font-bold text-[#f8fafc]">Pump.fun Bonding Model</p>
                  <p className="text-xs text-[#94a3b8]">
                    Token trades along a mathematical bonding curve. When 85 SOL is collected (~$112k market cap), the curve graduates and liquidity permanently migrates to Raydium CPMM.
                  </p>
                </div>
              }
              position="bottom"
            />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tabular-nums">
              {progressPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-[#64748b]">
              {isGraduated ? "MIGRATED TO RAYDIUM" : "TO DEX GRADUATION"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          {collectedSol !== null && (
            <div className="p-2 rounded bg-[#141824] border border-[#1e2433]">
              <span className="text-[#64748b] block text-[10px]">COLLECTED</span>
              <span className="font-bold text-[#f8fafc] tabular-nums">
                {collectedSol.toFixed(1)} / 85 SOL
              </span>
            </div>
          )}
          <div className="p-2 rounded bg-[#141824] border border-[#1e2433]">
            <span className="text-[#64748b] block text-[10px]">REMAINING</span>
            <span className="font-bold text-amber-400 tabular-nums">
              ${Math.round(remainingUsd).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar with milestone ticks */}
      <div className="relative pt-1 pb-2">
        <div className="h-3 w-full bg-[#161b26] rounded-md overflow-hidden relative border border-[#1e2433]">
          <div
            className={`h-full transition-all duration-500 rounded-sm ${
              isGraduated
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="flex justify-between items-center text-[10px] font-mono text-[#64748b] mt-1.5 px-0.5">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className="text-emerald-400 font-bold">100% (85 SOL)</span>
        </div>
      </div>
    </div>
  );
}
