"use client";

import { useMemo } from "react";

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
  solPrice 
}: BondingCurveProgressProps) {
  // Color gradient logic
  const colorClass = useMemo(() => {
    if (progressPercent < 30) return "bg-gradient-to-r from-red-500 to-orange-500";
    if (progressPercent < 70) return "bg-gradient-to-r from-orange-500 to-yellow-500";
    return "bg-gradient-to-r from-yellow-500 to-green-500";
  }, [progressPercent]);

  const remainingUsd = useMemo(() => {
    const TARGET_GRADUATION_MC_USD = 112000;
    if (progressPercent >= 100) return 0;
    return (1 - (progressPercent / 100)) * TARGET_GRADUATION_MC_USD;
  }, [progressPercent]);

  const collectedSol = useMemo(() => {
    if (remainingSol === null || remainingSol === undefined) return null;
    return Math.max(0, 85 - remainingSol);
  }, [remainingSol]);

  return (
    <div className="w-full glass-card p-5 rounded-2xl border border-border-color mb-6 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
            Bonding Curve Progress
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-2xl font-black text-text-primary tracking-tight">{progressPercent.toFixed(1)}%</span>
             <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest border-l border-border-color pl-2">
                Graduation
             </span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1">
          {collectedSol !== null && (
            <div className="text-xs font-bold text-text-primary">
              {collectedSol.toFixed(1)} <span className="text-text-muted font-normal">/ 85 SOL Collected</span>
            </div>
          )}
          <div className="text-xs font-bold text-pink-500">
            ${remainingUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-text-muted font-normal text-[10px]">to graduate</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="h-3 w-full bg-bg-secondary rounded-full overflow-hidden relative border border-white/5">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out relative`}
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        >
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />
        </div>
      </div>
      
      <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
          {marketCapSol && (
            <div className="text-[10px] text-text-muted font-mono flex items-center gap-1">
              <span className="opacity-50">Market Cap:</span>
              <span className="text-text-secondary font-bold">{marketCapSol.toLocaleString(undefined, { maximumFractionDigits: 1 })} SOL</span>
            </div>
          )}
          <div className="text-[10px] text-text-muted italic flex items-center gap-1">
             <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             Target: 85 SOL
          </div>
      </div>
    </div>
  );
}
