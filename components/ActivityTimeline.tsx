"use client";

import { ScanResult } from "@/lib/scoring/engine";

interface ActivityTimelineProps {
  scanResult: ScanResult;
}

export function ActivityTimeline({ scanResult }: ActivityTimelineProps) {
  // Construct a pseudo-timeline from available data
  const events = [];

  const checks = scanResult.checks;

  // 1. Creation
  if (checks.tokenAge.data?.createdAt) {
    events.push({
      time: new Date(checks.tokenAge.data.createdAt),
      title: "Token Created",
      desc: "Deployed on Solana",
      type: "create"
    });
  }

  // 2. Liquidity Info
  if (checks.liquidity.data) {
     if (checks.liquidity.data.lpBurned) {
        events.push({
            time: new Date(), // Approximate, as we don't have exact burn time without scraping txs
            title: "Liquidity Burned",
            desc: "LP tokens have been permanently burned",
            type: "safety"
        });
     } else if (checks.liquidity.data.lpLocked) {
        events.push({
            time: new Date(),
            title: "Liquidity Locked",
            desc: `LP tokens locked (${checks.liquidity.data.lockDuration || "Unknown duration"})`,
            type: "safety"
        });
     }
  }

  // 3. Authorities
  if (checks.mintAuthority.data?.status === 'pass') {
     events.push({
        time: new Date(),
        title: "Mint Disabled",
        desc: "Mint authority revoked",
        type: "safety"
     });
  }

  // 4. Migration (if known) or Bonding Curve Progress
  if (scanResult.scanMode === 'pump') {
    const progress = (checks.metadata.data as any)?.pumpFunCurve?.curveProgressPercent;
    if (progress !== undefined) {
      events.push({
        time: new Date(), // Current state
        title: `Bonding Curve: ${progress}%`,
        desc: "Current fill progress",
        type: "info"
      });
    }
  }

  // Sort by time descending (newest first)
  // Note: Since many events use 'new Date()' they will be clustered at top. 
  // Ideally we would fetch real tx history.
  const sortedEvents = events.sort((a, b) => b.time.getTime() - a.time.getTime());

  if (sortedEvents.length === 0) return null;

  return (
    <div className="mt-8">
       <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
        <h2 className="text-sm font-bold text-text-primary tracking-wide">Activity Timeline</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
      </div>
      
      <div className="relative border-l border-border-color ml-3 space-y-6">
        {sortedEvents.map((event, idx) => (
          <div key={idx} className="ml-6 relative group">
            <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-bg-main ${
              event.type === 'create' ? 'bg-blue-500' : 
              event.type === 'safety' ? 'bg-green-500' :
              'bg-text-secondary'
            }`} />
            
            <div className="glass-card p-3 rounded-lg border border-border-color/50">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-text-primary">{event.title}</span>
                <span className={`text-[10px] font-mono ${event.title === "Token Created" ? "text-text-muted" : "text-text-secondary/50"}`}>
                  {event.title === "Token Created" ? event.time.toLocaleString() : "Unknown"}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{event.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
