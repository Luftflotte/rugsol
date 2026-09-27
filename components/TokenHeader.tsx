"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, ShieldCheck, Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface TokenPrice {
  priceUsd: number;
  marketCap: number;
  priceChange: {
    h24: number;
  };
}

interface TokenHeaderProps {
  name: string | null;
  symbol: string | null;
  image: string | null;
  address: string;
  priceData?: TokenPrice | null;
  mode?: "pump" | "dex";
}

export function TokenHeader({ name, symbol, image, address, priceData, mode }: TokenHeaderProps) {
  const [copied, setCopied] = useState(false);

  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = address;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUsd = (num: number) => {
    if (num < 0.000001) return `$${num.toExponential(4)}`;
    if (num < 0.01) return `$${num.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  };

  const formatCompact = (num: number) => {
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${Math.round(num).toLocaleString()}`;
  };

  const h24 = priceData?.priceChange?.h24 ?? 0;
  const isPositive = h24 >= 0;

  return (
    <div className="w-full bg-[#0e1118] border border-[#1e2433] rounded-xl p-4 sm:p-5">
      {/* Top row: identity + quick links + price */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Token Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          {image ? (
            <img
              src={image}
              alt={symbol || "Token"}
              className="w-12 h-12 rounded-lg bg-[#141824] border border-[#1e2433] object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#141824] border border-[#1e2433] flex items-center justify-center font-mono font-bold text-sm text-[#94a3b8] shrink-0">
              {symbol?.slice(0, 3) || "??"}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-[#f1f5f9] truncate tracking-tight font-sans">
                {name || "Unknown Token"}
              </h1>
              {symbol && (
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#141824] text-[#38bdf8] border border-[#1e2433]">
                  ${symbol}
                </span>
              )}
              {mode && (
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                    mode === "pump"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {mode === "pump" ? <Flame className="w-3 h-3 text-amber-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                  {mode === "pump" ? "Pump.fun Curve" : "DEX Pool"}
                </span>
              )}
            </div>

            {/* Address bar & quick explorers */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#090b10] border border-[#1e2433]">
                <code className="text-[11px] font-mono text-[#94a3b8]">{shortAddress}</code>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:text-[#f1f5f9] text-[#64748b] transition-colors"
                  title="Copy full mint address"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Direct Quick Launch Links */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#64748b]">
                <a
                  href={`https://dexscreener.com/solana/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-[#141824] hover:bg-[#1a2030] hover:text-[#f1f5f9] border border-[#1e2433] transition-colors flex items-center gap-1"
                >
                  DexScreener
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
                <a
                  href={`https://solscan.io/token/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-[#141824] hover:bg-[#1a2030] hover:text-[#f1f5f9] border border-[#1e2433] transition-colors flex items-center gap-1"
                >
                  Solscan
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
                {mode === "pump" && (
                  <a
                    href={`https://pump.fun/coin/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-[#141824] hover:bg-[#1a2030] text-amber-400/90 border border-amber-500/20 transition-colors flex items-center gap-1"
                  >
                    Pump.fun
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Real-time price telemetry */}
        {priceData && (
          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-[#1e2433] pt-3 md:pt-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#f8fafc] tabular-nums tracking-tight">
                {formatUsd(priceData.priceUsd)}
              </span>
              <div
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{isPositive ? "+" : ""}{h24.toFixed(2)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs font-mono text-[#94a3b8]">
              <div>
                <span className="text-[#64748b] mr-1">MCAP:</span>
                <span className="text-[#f1f5f9] font-semibold">{formatCompact(priceData.marketCap)}</span>
              </div>
              <span className="text-border-color">|</span>
              <div className="flex items-center gap-1">
                <span className="text-[#64748b]">NETWORK:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Solana
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
