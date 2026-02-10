"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
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
      // Fallback for environments where clipboard API is blocked
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

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3 sm:gap-4">
      {/* Token Image */}
      {image ? (
        <img
          src={image}
          alt={symbol || "Token"}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full bg-bg-secondary object-cover shadow-lg ring-1 ring-black/20"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center shadow-md">
          <span className="text-base sm:text-lg md:text-2xl font-bold text-text-primary">
            {symbol?.slice(0, 2) || "??"}
          </span>
        </div>
      )}

      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary truncate leading-tight">
            {name || "Unknown Token"}
          </h1>
          {mode && (
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border uppercase tracking-wide ${
                mode === 'pump'
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                  : 'bg-green-500/10 text-green-400 border-green-500/30'
              }`}>
                {mode === 'pump' ? 'Pump.fun' : 'DEX'}
              </span>
              <InfoTooltip
                content={
                  mode === 'pump'
                    ? "Token is trading on Pump.fun bonding curve. Price determined by bonding curve formula until graduation to Raydium."
                    : "Token is listed on a decentralized exchange (DEX) with traditional liquidity pools."
                }
                position="bottom"
              />
            </div>
          )}
          {symbol && (
            <span className="text-xs sm:text-sm md:text-base text-text-secondary font-medium">${symbol}</span>
          )}
        </div>

        {/* Address with copy button */}
        <div className="flex items-center gap-2 mt-1">
          <code className="text-[11px] sm:text-xs md:text-sm text-text-muted font-mono truncate">{shortAddress}</code>
          <button
            onClick={copyAddress}
            className="p-2 rounded-md hover:bg-bg-secondary transition-colors group"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-text-muted group-hover:text-text-secondary" />
            )}
          </button>
          <a
            href={`https://solscan.io/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-bg-secondary transition-colors group"
            title="View on Solscan"
          >
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-text-secondary" />
          </a>
        </div>
      </div>
      </div>

      {/* Price Data - Enhanced */}
      {priceData && (
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-2 mt-3 md:mt-0 pl-16 md:pl-0 border-t md:border-0 border-white/5 pt-4 md:pt-0">
          <div className="flex flex-col items-start md:items-end gap-1.5">
             <div className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono tracking-tight leading-none">
            {priceData.priceUsd < 0.01
              ? `$${priceData.priceUsd.toFixed(10).replace(/0+$/, "").replace(/\.$/, "")}`
              : `$${priceData.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`}
             </div>
             <div className="flex items-center gap-1">
               {(() => {
                 const h24 = priceData.priceChange?.h24 ?? 0;
                 const isPositive = h24 >= 0;
                 return (
                   <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-sm ${
                     isPositive
                       ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                       : 'bg-red-500/10 text-red-400 border border-red-500/20'
                   }`}>
                    <span className="text-[10px]">{isPositive ? '▲' : '▼'}</span>
                    <span>{isPositive ? '+' : ''}{Number(h24.toFixed(2))}%</span>
                    <span className="text-text-muted/60 text-xs font-normal">24h</span>
                   </div>
                 );
               })()}
               <InfoTooltip
                 content="Price change in the last 24 hours. Calculated from current price vs. price 24 hours ago."
                 position="bottom"
               />
             </div>
          </div>
           <div className="flex items-center gap-1">
             <div className="text-xs text-text-muted font-mono bg-bg-secondary/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border-color">
               <span className="opacity-60 mr-1">MC:</span>
               <span className="font-semibold text-text-secondary">
                 ${(priceData.marketCap).toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </span>
             </div>
             <InfoTooltip
               content={
                 <div className="space-y-1">
                   <p className="font-bold text-text-primary">Market Cap (MC)</p>
                   <p>Total value of all tokens in circulation.</p>
                   <p className="text-[11px] opacity-70 mt-1">Formula: Current Price × Circulating Supply</p>
                 </div>
               }
               position="bottom"
             />
           </div>
        </div>
      )}
    </div>
  );
}
