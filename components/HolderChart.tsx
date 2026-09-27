"use client";

import { HolderInfo } from "@/lib/solana/holders";
import { ExternalLink } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface HolderChartProps {
  holders: HolderInfo[];
  devAddress?: string;
  snipers?: string[]; // List of sniper addresses
  linkedWallets?: Record<string, string>; // address -> clusterId (color code by cluster)
  className?: string;
}

export function HolderChart({ holders, devAddress, snipers = [], linkedWallets = {}, className }: HolderChartProps) {
  // Normalize holders to max 10 for display
  const displayHolders = holders.slice(0, 10);
  
  // Find max percent to scale bars
  const maxPercent = Math.max(...displayHolders.map(h => h.percent), 10); // at least 10% scale

  const getBarColor = (holder: HolderInfo) => {
    if (holder.isLpPool) return "bg-blue-500";
    if (devAddress && holder.owner === devAddress) return "bg-purple-500"; // Dev
    if (snipers.includes(holder.owner)) return "bg-red-500"; // Sniper
    if (linkedWallets[holder.owner]) return "bg-orange-500"; // Linked Cluster (generic color for now)
    
    // Fallback: Whale warning
    if (holder.percent > 20) return "bg-red-500"; 
    return "bg-text-secondary";
  };

  const getLabel = (holder: HolderInfo) => {
    if (holder.isLpPool) return "Liquidity Pool";
    if (devAddress && holder.owner === devAddress) return "Dev Wallet";
    if (snipers.includes(holder.owner)) return "Sniper";
    if (linkedWallets[holder.owner]) return `Cluster ${linkedWallets[holder.owner]}`;
    return `${holder.owner.slice(0, 4)}...${holder.owner.slice(-4)}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Legend with color explanations */}
      <div className="flex items-start gap-2 p-3 bg-bg-secondary/50 rounded-lg border border-border-color">
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-text-secondary">Liquidity Pool</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-text-secondary">Dev Wallet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-text-secondary">Sniper/Whale</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-text-secondary">Linked Cluster</span>
            </div>
          </div>
        </div>
        <InfoTooltip
          content={
            <div className="space-y-2">
              <p className="font-bold text-text-primary">Holder Chart Legend</p>
              <div className="space-y-1.5 text-[11px]">
                <p><span className="text-blue-400">●</span> <strong>Liquidity Pool:</strong> DEX trading pool</p>
                <p><span className="text-purple-400">●</span> <strong>Dev Wallet:</strong> Token creator's address</p>
                <p><span className="text-red-400">●</span> <strong>Sniper/Whale:</strong> Bought at launch or holds &gt;20%</p>
                <p><span className="text-orange-400">●</span> <strong>Linked Cluster:</strong> Connected wallets (potential coordination)</p>
              </div>
              <p className="text-[10px] opacity-70 mt-2">Hover over bars for detailed wallet information</p>
            </div>
          }
          position="left"
        />
      </div>

      {displayHolders.map((holder, idx) => (
        <div key={holder.owner} className="group relative">
          <div className="flex items-center justify-between text-xs mb-1">
            <a 
                href={`https://solscan.io/account/${holder.owner}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <span className="opacity-50 text-[10px]">{idx + 1}.</span> 
              {getLabel(holder)}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <span className="font-bold text-text-primary font-mono">{holder.percent.toFixed(2)}%</span>
          </div>
          
          {/* Bar Background */}
          <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
            {/* Bar Fill */}
            <div 
              className={`h-full ${getBarColor(holder)} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, (holder.percent / maxPercent) * 100)}%` }}
            />
          </div>

          {/* Tooltip on Hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-0 mb-2 p-3 bg-bg-card border border-border-color shadow-xl rounded-lg z-10 pointer-events-none w-max max-w-[240px]">
            <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Wallet Details</div>
            <div className="text-xs font-mono text-text-primary break-all mb-2">{holder.owner}</div>
            
            <div className="flex justify-between items-center text-xs">
                 <span className="text-text-secondary">Amount:</span>
                 <span className="font-bold text-text-primary">{parseInt(holder.amount).toLocaleString()}</span>
            </div>
            
            {(devAddress === holder.owner) && <div className="mt-2 text-[10px] text-purple-400 font-bold">● Developer Wallet</div>}
            {snipers.includes(holder.owner) && <div className="mt-1 text-[10px] text-red-400 font-bold">● Detected Sniper</div>}
          </div>
        </div>
      ))}
      
      {displayHolders.length === 0 && (
        <div className="text-center py-4 text-text-muted text-sm">
          No holder data available
        </div>
      )}
    </div>
  );
}
