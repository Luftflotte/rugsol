"use client";

import { useMemo } from "react";
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
    <div className="w-full glass-card p-6 md:p-7 rounded-2xl border border-border-color overflow-hidden relative hover:border-pink-500/30 transition-all duration-500 group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 md:animate-pulse shadow-lg shadow-pink-500/50"></span>
              Bonding Curve Progress
              <InfoTooltip
                content={
                  <div className="space-y-2">
                    <p className="font-bold text-text-primary">Pump.fun Bonding Curve</p>
                    <p>Pump.fun uses a bonding curve model where the token price increases as more SOL is deposited.</p>
                    <div className="space-y-1 text-[11px] mt-2">
                      <p><strong>Target:</strong> 85 SOL (~$112K)</p>
                      <p><strong>Graduation:</strong> At 100%, liquidity migrates to Raydium DEX</p>
                      <p><strong>Before 100%:</strong> You can buy/sell directly from the curve</p>
                    </div>
                    <p className="text-[10px] opacity-70 mt-2">Higher % = More market validation and closer to DEX listing</p>
                  </div>
                }
                position="bottom"
              />
            </h3>
            <div className="flex items-center gap-3">
               <span className="text-3xl font-black text-text-primary tracking-tight">{progressPercent.toFixed(1)}%</span>
               <div className="flex flex-col">
                 <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                    to Graduation
                 </span>
                 {progressPercent >= 100 && (
                   <span className="text-[10px] text-green-400 font-bold">✓ Graduated</span>
                 )}
               </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {collectedSol !== null && (
              <div className="text-sm font-bold text-text-primary bg-bg-secondary/50 px-3 py-1.5 rounded-lg border border-border-color">
                {collectedSol.toFixed(1)} <span className="text-text-muted font-normal text-xs">/ 85 SOL</span>
              </div>
            )}
            <div className="text-sm font-bold text-pink-500">
              ${remainingUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-text-muted font-normal text-xs">remaining</span>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="h-4 w-full bg-bg-secondary rounded-full overflow-hidden relative border border-border-color shadow-inner">
          {/* Progress fill with gradient and animation */}
          <div
            className={`h-full ${colorClass} transition-all duration-1000 ease-out relative shadow-lg`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          >
            {/* Shimmer effect — disabled on mobile via CSS */}
            <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -skew-x-12 max-md:hidden" />
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
          </div>
          {/* Progress markers */}
          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            {[25, 50, 75].map((mark) => (
              <div
                key={mark}
                className="w-0.5 h-2 bg-white/20 rounded-full"
                style={{ marginLeft: `${mark}%`, transform: 'translateX(-50%)' }}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color">
            {marketCapSol && (
              <div className="text-xs text-text-muted font-mono flex items-center gap-1.5 bg-bg-secondary/50 px-2.5 py-1 rounded-lg">
                <span className="opacity-60">Market Cap:</span>
                <span className="text-text-primary font-bold">{marketCapSol.toLocaleString(undefined, { maximumFractionDigits: 1 })} SOL</span>
              </div>
            )}
            <div className="text-xs text-text-muted flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
               <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
               <span className="font-medium text-green-400">Target: 85 SOL</span>
            </div>
        </div>
      </div>
    </div>
  );
}
