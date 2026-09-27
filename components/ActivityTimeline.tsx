"use client";

import { ScanResult } from "@/lib/scoring/engine";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Terminal, ShieldCheck, AlertOctagon, Flame, ArrowRight, ShieldAlert } from "lucide-react";

interface ActivityTimelineProps {
  scanResult: ScanResult;
}

export function ActivityTimeline({ scanResult }: ActivityTimelineProps) {
  const events: Array<{ time: Date | null; title: string; desc: string; type: string }> = [];

  const checks = scanResult.checks;
  const adv = checks.advanced?.data;

  // 1. Token Creation
  if (checks.tokenAge.data?.createdAt) {
    events.push({
      time: new Date(checks.tokenAge.data.createdAt),
      title: "Contract Deployed",
      desc: "Token mint account initialized on Solana Mainnet",
      type: "create",
    });
  }

  // 2. DEX Listing
  if (scanResult.price?.pairCreatedAt) {
    events.push({
      time: new Date(scanResult.price.pairCreatedAt),
      title: "Liquidity Pool Created",
      desc: `AMM trading pool established on ${checks.liquidity.data?.dexName || "Raydium"}`,
      type: "info",
    });
  }

  // 3. Bonding Curve Graduation
  if (scanResult.scanMode === "pump" && scanResult.bondingCurveData?.complete) {
    events.push({
      time: null,
      title: "Graduated from Pump.fun",
      desc: "100% bonding target achieved; liquidity seeded to Raydium CPMM",
      type: "success",
    });
  }

  // 4. Dev Sold Out
  if (adv?.isDevSoldOut) {
    events.push({
      time: null,
      title: "Developer Dump Detected",
      desc: `Deployer sold off holdings (${adv.devBalancePercent?.toFixed(2)}% remaining balance)`,
      type: "danger",
    });
  }

  // 5. Snipers
  if (adv?.sniperCount && adv.sniperCount > 5) {
    events.push({
      time: null,
      title: "Block-0 Sniper Clustering",
      desc: `${adv.sniperCount} snipers executed bundle buys within the initial creation slot`,
      type: "warning",
    });
  }

  // 6. Suspicious clusters
  if (checks.holders.data?.clustersDetected && checks.holders.data.clustersDetected >= 3) {
    events.push({
      time: null,
      title: "Sybil / Linked Cluster Formation",
      desc: `${checks.holders.data.clustersDetected} groups of correlated wallets detected`,
      type: "warning",
    });
  }

  // 7. Authorities
  if (checks.mintAuthority.data?.status === "pass") {
    events.push({
      time: null,
      title: "Mint Authority Revoked",
      desc: "Total token supply permanently capped; owner cannot mint new tokens",
      type: "safety",
    });
  }

  if (checks.freezeAuthority.data?.status === "pass") {
    events.push({
      time: null,
      title: "Freeze Authority Revoked",
      desc: "Contract cannot freeze or blacklist individual token accounts",
      type: "safety",
    });
  }

  // 8. Liquidity Lock / Burn
  if (checks.liquidity.data) {
    if (checks.liquidity.data.lpBurned) {
      events.push({
        time: null,
        title: "LP Tokens Burned (100%)",
        desc: "Pool liquidity permanently locked into the dead burn address",
        type: "safety",
      });
    } else if (checks.liquidity.data.lpLocked) {
      events.push({
        time: null,
        title: "LP Tokens Locked",
        desc: `Liquidity lock verified (${checks.liquidity.data.lockDuration || "standard lock"})`,
        type: "safety",
      });
    }
  }

  // 9. Honeypot
  if (checks.honeypot.data?.isHoneypot) {
    events.push({
      time: null,
      title: "Sell Simulation Failed (Honeypot)",
      desc: `Simulation error: ${checks.honeypot.data.reason || "Tokens cannot be liquidated"}`,
      type: "critical",
    });
  }

  const sortedEvents = events.sort((a, b) => {
    if (a.time && b.time) return b.time.getTime() - a.time.getTime();
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return 0;
  });

  if (sortedEvents.length === 0) return null;

  return (
    <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e2433]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#38bdf8]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase">
            ON-CHAIN ACTIVITY & FORENSIC TIMELINE
          </h3>
          <InfoTooltip
            content={
              <p className="text-xs font-sans text-[#94a3b8]">
                Chronological sequence of verifiable on-chain lifecycle events and contract modifications.
              </p>
            }
            position="bottom"
          />
        </div>
        <span className="text-[10px] font-mono text-[#64748b]">
          {sortedEvents.length} RECORDED EVENTS
        </span>
      </div>

      {/* Timeline entries */}
      <div className="space-y-2 font-mono text-xs">
        {sortedEvents.map((evt, idx) => {
          const isDanger = evt.type === "danger" || evt.type === "critical";
          const isWarning = evt.type === "warning";
          const isSafety = evt.type === "safety" || evt.type === "success";

          const tagColor = isDanger
            ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
            : isWarning
            ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
            : isSafety
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            : "text-[#38bdf8] bg-sky-500/10 border-sky-500/30";

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#090b10] border border-[#161b26] hover:border-[#1e2433] transition-colors"
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${tagColor}`}>
                  {isDanger ? "FLAG" : isWarning ? "WARN" : isSafety ? "VERIFIED" : "EVENT"}
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-[#f1f5f9] text-xs block truncate">
                    {evt.title}
                  </span>
                  <span className="text-[11px] text-[#64748b] block truncate font-sans">
                    {evt.desc}
                  </span>
                </div>
              </div>

              {evt.time && (
                <span className="text-[10px] text-[#64748b] shrink-0 sm:self-auto self-end">
                  {evt.time.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
