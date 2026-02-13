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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center shrink-0 silver-accent">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
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
          <p className="text-sm text-text-secondary">Key events and milestones for this token.</p>
        </div>
      </div>

      <div className="relative border-l border-border-color/40 ml-4 space-y-8">
        {sortedEvents.map((event, idx) => (
          <div
            key={idx}
            className="ml-10 relative group"
          >
            {/* Enhanced timeline dot with icon — glass-card style */}
            <div className={`absolute -left-[49px] top-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
              event.type === 'create' ? 'bg-blue-500/10 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)] group-hover:border-blue-400/50 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.25)]' :
              event.type === 'success' ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)] group-hover:border-purple-400/50 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.25)]' :
              event.type === 'safety' ? 'bg-green-500/10 border border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.15)] group-hover:border-green-400/50 group-hover:shadow-[0_0_16px_rgba(34,197,94,0.25)]' :
              event.type === 'danger' ? 'bg-red-500/10 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)] group-hover:border-red-400/50 group-hover:shadow-[0_0_16px_rgba(239,68,68,0.25)]' :
              event.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.15)] group-hover:border-yellow-400/50 group-hover:shadow-[0_0_16px_rgba(234,179,8,0.25)]' :
              event.type === 'critical' ? 'bg-red-500/15 border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.2)] md:animate-pulse group-hover:border-red-400/60 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
              'bg-[var(--bg-secondary)] border border-border-color shadow-[0_0_8px_rgba(255,255,255,0.03)] group-hover:border-[var(--silver-accent)]/30'
            }`}>
              {/* SVG Icons — using muted accent colors instead of white */}
              {event.type === 'create' && (
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              )}
              {event.type === 'success' && (
                <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {event.type === 'safety' && (
                <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              )}
              {event.type === 'danger' && (
                <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
              {event.type === 'critical' && (
                <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
              {event.type === 'warning' && (
                <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
              {event.type === 'info' && (
                <svg className="w-3.5 h-3.5 text-[var(--silver-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
