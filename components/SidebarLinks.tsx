"use client";

import Link from "next/link";
import { ExternalLink, Search, Clock, Database, Globe } from "lucide-react";

interface SidebarLinksProps {
  address: string;
  scannedAt: Date;
  cached: boolean;
}

const externalLinks = [
  {
    name: "DexScreener",
    category: "Charts & Swaps",
    url: (address: string) => `https://dexscreener.com/solana/${address}`,
  },
  {
    name: "Birdeye",
    category: "Crypto Intelligence",
    url: (address: string) => `https://birdeye.so/token/${address}?chain=solana`,
  },
  {
    name: "Solscan",
    category: "Block Explorer",
    url: (address: string) => `https://solscan.io/token/${address}`,
  },
  {
    name: "Jupiter Swap",
    category: "DEX Aggregator",
    url: (address: string) => `https://jup.ag/swap/SOL-${address}`,
  },
  {
    name: "RugCheck.xyz",
    category: "External Validator",
    url: (address: string) => `https://rugcheck.xyz/tokens/${address}`,
  },
];

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

export function SidebarLinks({ address, scannedAt, cached }: SidebarLinksProps) {
  return (
    <div className="space-y-4">
      {/* Quick Links Header */}
      <div>
        <h4 className="text-[11px] font-mono uppercase font-bold text-[#64748b] tracking-wider mb-2.5">
          EXTERNAL PROTOCOL EXPLORERS
        </h4>
        <div className="space-y-1.5">
          {externalLinks.map((link) => (
            <a
              key={link.name}
              href={link.url(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1118] border border-[#1e2433] hover:border-[#2a3449] hover:bg-[#121622] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#38bdf8] transition-colors" />
                <div>
                  <span className="text-xs font-mono font-medium text-[#e2e8f0] group-hover:text-white transition-colors block">
                    {link.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748b]">
                    {link.category}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-[#64748b] group-hover:text-[#f1f5f9] transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <Link href="/" className="block">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-xs font-mono font-semibold text-[#f1f5f9] border border-[#1e2433] hover:border-[#38bdf8]/40 transition-colors">
          <Search className="w-3.5 h-3.5 text-[#38bdf8]" />
          Scan Another Token (/)
        </button>
      </Link>

      {/* Telemetry Status Footer */}
      <div className="p-2.5 rounded-lg bg-[#090b10] border border-[#1e2433] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>{formatTime(scannedAt)}</span>
        </div>
        {cached ? (
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
            CACHED
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            LIVE RPC
          </span>
        )}
      </div>
    </div>
  );
}
