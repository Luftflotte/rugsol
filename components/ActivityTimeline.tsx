"use client";

import { ScanResult } from "@/lib/scoring/engine";
import { InfoTooltip } from "@/components/InfoTooltip";

interface ActivityTimelineProps {
  scanResult: ScanResult;
}

export function ActivityTimeline({ scanResult }: ActivityTimelineProps) {
  // Construct a pseudo-timeline from available data
  const events: Array<{ time: Date | null; title: string; desc: string; type: string }> = [];

  const checks = scanResult.checks;
  const adv = checks.advanced?.data;

  // 1. Token Creation
  if (checks.tokenAge.data?.createdAt) {
    events.push({
      time: new Date(checks.tokenAge.data.createdAt),
      title: "Token Created",
      desc: "Deployed on Solana",
      type: "create"
    });
  }

  // 2. DEX Listing (from price API pairCreatedAt)
  if (scanResult.price?.pairCreatedAt) {
    events.push({
      time: new Date(scanResult.price.pairCreatedAt),
      title: "Listed on DEX",
      desc: `Trading pair created on ${checks.liquidity.data?.dexName || "DEX"}`,
      type: "info"
    });
  }

  // 3. Bonding Curve Graduation (Pump.fun)
  if (scanResult.scanMode === 'pump' && scanResult.bondingCurveData?.complete) {
    events.push({
      time: null, // We don't know exact graduation time
      title: "Graduated from Bonding Curve",
      desc: "Token reached 100% and migrated to Raydium",
      type: "success"
    });
  }

  // 4. Dev Sold Out (High Risk Event)
  if (adv?.isDevSoldOut) {
    events.push({
      time: null,
      title: "⚠️ Dev Sold Out",
      desc: `Developer dumped their holdings (${adv.devBalancePercent?.toFixed(2)}% remaining)`,
      type: "danger"
    });
  }

  // 5. High Sniper Activity
  if (adv?.sniperCount && adv.sniperCount > 5) {
    events.push({
      time: null,
      title: "⚠️ Sniper Activity Detected",
      desc: `${adv.sniperCount} wallets bought in the same block as deployment`,
      type: "warning"
    });
  }

  // 6. Insider Clusters Detected
  if (checks.holders.data?.clustersDetected && checks.holders.data.clustersDetected >= 3) {
    events.push({
      time: null,
      title: "⚠️ Suspicious Wallet Clusters",
      desc: `${checks.holders.data.clustersDetected} groups of wallets with similar balances detected`,
      type: "warning"
    });
  }

  // 7. Authorities Revoked (Safety)
  if (checks.mintAuthority.data?.status === 'pass') {
     events.push({
        time: null,
        title: "Mint Authority Revoked",
        desc: "No new tokens can be minted",
        type: "safety"
     });
  }

  if (checks.freezeAuthority.data?.status === 'pass') {
     events.push({
        time: null,
        title: "Freeze Authority Revoked",
        desc: "Wallets cannot be frozen",
        type: "safety"
     });
  }

  // 8. Liquidity Info
  if (checks.liquidity.data) {
     if (checks.liquidity.data.lpBurned) {
        events.push({
            time: null,
            title: "Liquidity Burned",
            desc: "LP tokens permanently destroyed",
            type: "safety"
        });
     } else if (checks.liquidity.data.lpLocked) {
        events.push({
            time: null,
            title: "Liquidity Locked",
            desc: `LP tokens locked (${checks.liquidity.data.lockDuration || "Unknown duration"})`,
            type: "safety"
        });
     }
  }

  // 9. Honeypot Detected (Critical)
  if (checks.honeypot.data?.isHoneypot) {
    events.push({
      time: null,
      title: "❌ Honeypot Detected",
      desc: `Sell simulation failed: ${checks.honeypot.data.reason || "Cannot sell"}`,
      type: "critical"
    });
  }

  // 10. Current Bonding Curve Progress (Pump mode, if not graduated)
  if (scanResult.scanMode === 'pump' && !scanResult.bondingCurveData?.complete) {
    const progress = scanResult.bondingCurveData?.curveProgressPercent;
    if (progress !== undefined && progress !== null) {
      events.push({
        time: null,
        title: `Bonding Curve: ${progress.toFixed(1)}%`,
        desc: `${(85 * (progress / 100)).toFixed(1)} SOL raised of 85 SOL target`,
        type: "info"
      });
    }
  }

  // Sort: Events with time first (by time desc), then events without time
  const sortedEvents = events.sort((a, b) => {
    if (a.time && b.time) return b.time.getTime() - a.time.getTime();
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return 0;
  });

  if (sortedEvents.length === 0) return null;

  return (
    <div className="mt-8">
       <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
        <h2 className="text-base font-bold text-text-primary tracking-wide flex items-center gap-2">
          Activity Timeline
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p className="font-bold text-text-primary">Token Activity History</p>
                <p>Chronological timeline of important events related to this token.</p>
                <div className="space-y-1 text-[11px] mt-2">
                  <p><span className="text-blue-400">●</span> Token creation & deployment</p>
                  <p><span className="text-purple-400">●</span> DEX listings & graduations</p>
                  <p><span className="text-green-400">●</span> Security milestones</p>
                  <p><span className="text-red-400">●</span> Risk events detected</p>
                </div>
              </div>
            }
            position="bottom"
          />
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
      </div>

      <div className="relative border-l-2 border-border-color/60 ml-4 space-y-8 before:absolute before:inset-0 before:border-l-2 before:border-[var(--silver-accent)]/10 before:blur-sm">
        {sortedEvents.map((event, idx) => (
          <div
            key={idx}
            className="ml-10 relative group animate-fade-in-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Enhanced timeline dot with icon */}
            <div className={`absolute -left-[49px] top-1 w-8 h-8 rounded-full border-2 border-bg-main flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
              event.type === 'create' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50' :
              event.type === 'success' ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50' :
              event.type === 'safety' ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50' :
              event.type === 'danger' ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 group-hover:animate-pulse' :
              event.type === 'warning' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50' :
              event.type === 'critical' ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-600/60 animate-pulse' :
              'bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg shadow-gray-500/30'
            }`}>
              {/* SVG Icons */}
              {event.type === 'create' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              )}
              {event.type === 'success' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {event.type === 'safety' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 17.93c-3.95-.97-7-5.11-7-9.93V6.3l7-3.11v15.74z"/>
                  <path d="M13 11.59l3.54-3.54 1.41 1.41L13 14.41l-3.54-3.54 1.41-1.41L13 11.59z" fill="white"/>
                </svg>
              )}
              {event.type === 'danger' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              )}
              {event.type === 'critical' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              )}
              {event.type === 'warning' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                </svg>
              )}
              {event.type === 'info' && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              )}
            </div>

            {/* Connecting line effect on hover */}
            <div className="absolute -left-[39px] top-0 w-0.5 h-full bg-gradient-to-b from-border-color to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />

            <div className={`glass-card p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
              event.type === 'create' ? 'border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/20' :
              event.type === 'success' ? 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/20' :
              event.type === 'safety' ? 'border-green-500/30 hover:border-green-500/60 hover:shadow-green-500/20' :
              event.type === 'danger' ? 'border-red-500/30 hover:border-red-500/60 hover:shadow-red-500/20' :
              event.type === 'warning' ? 'border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-yellow-500/20' :
              event.type === 'critical' ? 'border-red-600/40 hover:border-red-600/70 hover:shadow-red-600/30' :
              'border-border-color/50 hover:border-border-color'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-sm font-bold text-text-primary block mb-1.5">{event.title}</span>
                  <p className="text-xs text-text-secondary leading-relaxed">{event.desc}</p>
                </div>
                {event.time && (
                  <span className="text-[10px] font-mono text-text-muted whitespace-nowrap bg-bg-secondary px-2 py-1 rounded">
                    {event.time.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
