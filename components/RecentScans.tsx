"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentScan {
  address: string;
  symbol: string;
  name: string;
  score: number;
  grade: string;
  gradeColor: string;
  image?: string;
  scannedAt: string;
  price?: number | null;
  createdAt?: string;
}

function formatTimeAgo(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return "recent";
  }
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function RecentScans() {
  const [displayedScans, setDisplayedScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentScans() {
      try {
        const res = await fetch("/api/recent");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDisplayedScans(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent scans:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentScans();
    const interval = setInterval(fetchRecentScans, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (e: React.MouseEvent, addr: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 1500);
  };

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-18 rounded-md bg-bg-card border border-border-color animate-pulse" />
        ))}
      </div>
    );
  }

  if (displayedScans.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-border-color rounded-md">
        <p className="text-xs font-mono text-text-muted">No live token scans recorded yet. Enter a CA to run the first audit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Live Feed Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayedScans.slice(0, 8).map((scan) => {
          const isHighRisk = scan.score < 40;
          const isSafe = scan.score >= 70;
          const statusBg = isSafe
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
            : isHighRisk
            ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
            : "text-amber-400 bg-amber-500/10 border-amber-500/25";

          return (
            <Link
              key={`${scan.address}-${scan.scannedAt}`}
              href={`/scan/${scan.address}`}
              className="group block p-3 bg-bg-card hover:bg-bg-secondary border border-border-color hover:border-border-color/80 rounded-md transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                {/* Token Icon & Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {scan.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={scan.image}
                      alt={scan.symbol}
                      className="w-8 h-8 rounded-full bg-bg-secondary shrink-0 object-cover border border-border-color"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center text-[11px] font-mono font-bold text-text-muted shrink-0">
                      {scan.symbol?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-text-primary truncate group-hover:text-emerald-400 transition-colors">
                        ${scan.symbol || "UNKNOWN"}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted truncate block max-w-[120px]">
                      {scan.name || "Solana Token"}
                    </span>
                  </div>
                </div>

                {/* Score Tag */}
                <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border shrink-0 ${statusBg}`}>
                  {scan.score} <span className="opacity-75 font-normal text-[10px]">/ 100</span>
                </div>
              </div>

              {/* Bottom Row: CA & Time */}
              <div className="mt-3 pt-2 border-t border-border-color/50 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <button
                  onClick={(e) => handleCopy(e, scan.address)}
                  className="hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy token address"
                >
                  <span>{truncateAddress(scan.address)}</span>
                  <span>{copiedAddr === scan.address ? "✓" : "📋"}</span>
                </button>
                <span className="tabular-nums">{formatTimeAgo(scan.scannedAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
