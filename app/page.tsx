import { Navbar } from "@/components/Navbar";
import { SearchInput } from "@/components/SearchInput";
import { RecentScans } from "@/components/RecentScans";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary selection:bg-emerald-500/20 selection:text-emerald-400">
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary mb-4 px-2 sm:px-0">
              Instant Solana Token Security & Risk Intelligence
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-8 font-normal leading-relaxed px-4 sm:px-0">
              Detect honeypots, unrevoked mint/freeze authorities, suspicious holder clusters, and liquidity locks in under 3 seconds.
            </p>

            {/* Search Input Bar */}
            <SearchInput />
          </div>

          {/* Live Recent Scans Feed */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                  Live Token Scans Feed
                </h2>
              </div>
              <span className="text-[11px] font-mono text-text-muted">Auto-refreshed via Helius RPC</span>
            </div>
            <RecentScans />
          </div>

          {/* Technical Inspection Matrix */}
          <div className="mb-14">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Engine Audit Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
              {/* Check 1 */}
              <div className="p-5 sm:p-4 bg-bg-card border border-border-color rounded-md hover:border-border-color/60 transition-colors">
                <div className="flex items-center justify-between mb-2.5 sm:mb-2">
                  <span className="text-sm sm:text-xs font-mono font-bold text-text-primary">01. Mint Authority</span>
                  <span className="text-[11px] sm:text-[10px] font-mono font-semibold px-2 sm:px-1.5 py-1 sm:py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">SUPPLY CHECK</span>
                </div>
                <p className="text-sm sm:text-xs text-text-secondary leading-relaxed font-normal">
                  Verifies if the token mint authority is revoked. Unrevoked authorities allow creators to mint billions of new tokens and crash the market price.
                </p>
              </div>

              {/* Check 2 */}
              <div className="p-5 sm:p-4 bg-bg-card border border-border-color rounded-md hover:border-border-color/60 transition-colors">
                <div className="flex items-center justify-between mb-2.5 sm:mb-2">
                  <span className="text-sm sm:text-xs font-mono font-bold text-text-primary">02. Freeze Authority</span>
                  <span className="text-[11px] sm:text-[10px] font-mono font-semibold px-2 sm:px-1.5 py-1 sm:py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">BLACKLIST CHECK</span>
                </div>
                <p className="text-sm sm:text-xs text-text-secondary leading-relaxed font-normal">
                  Inspects if freeze authority is revoked. Active freeze rights enable malicious developers to prevent buyers from ever transferring or selling their coins.
                </p>
              </div>

              {/* Check 3 */}
              <div className="p-5 sm:p-4 bg-bg-card border border-border-color rounded-md hover:border-border-color/60 transition-colors">
                <div className="flex items-center justify-between mb-2.5 sm:mb-2">
                  <span className="text-sm sm:text-xs font-mono font-bold text-text-primary">03. Sell Simulation</span>
                  <span className="text-[11px] sm:text-[10px] font-mono font-semibold px-2 sm:px-1.5 py-1 sm:py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">HONEYPOT CHECK</span>
                </div>
                <p className="text-sm sm:text-xs text-text-secondary leading-relaxed font-normal">
                  Executes automated swap routing simulation on Jupiter to prove sellability. Detects disguised honeypots and broken swap routes before you trade.
                </p>
              </div>

              {/* Check 4 */}
              <div className="p-5 sm:p-4 bg-bg-card border border-border-color rounded-md hover:border-border-color/60 transition-colors">
                <div className="flex items-center justify-between mb-2.5 sm:mb-2">
                  <span className="text-sm sm:text-xs font-mono font-bold text-text-primary">04. LP Burn & Lock</span>
                  <span className="text-[11px] sm:text-[10px] font-mono font-semibold px-2 sm:px-1.5 py-1 sm:py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">POOL LIQUIDITY</span>
                </div>
                <p className="text-sm sm:text-xs text-text-secondary leading-relaxed font-normal">
                  Validates Raydium, Orca, and Meteora pool reserves. Verifies that LP tokens are burned (100%) or locked in verified escrow contracts.
                </p>
              </div>

              {/* Check 5 */}
              <div className="p-5 sm:p-4 bg-bg-card border border-border-color rounded-md hover:border-border-color/60 transition-colors">
                <div className="flex items-center justify-between mb-2.5 sm:mb-2">
                  <span className="text-sm sm:text-xs font-mono font-bold text-text-primary">05. Whale Distribution</span>
                  <span className="text-[11px] sm:text-[10px] font-mono font-semibold px-2 sm:px-1.5 py-1 sm:py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">TOP 10 HOLDERS</span>
                </div>
                <p className="text-sm sm:text-xs text-text-secondary leading-relaxed font-normal">
                  Scans holder ledger for dangerous supply concentration. Flags coordinated sniper clusters and insider wallets controlling &gt;15% of circulating supply.
                </p>
              </div>

              {/* Check 6 */}
              <div className="p-5 sm:p-4 bg-bg-card border border-border-color rounded-md hover:border-border-color/60 transition-colors">
                <div className="flex items-center justify-between mb-2.5 sm:mb-2">
                  <span className="text-sm sm:text-xs font-mono font-bold text-text-primary">06. Bonding Curve State</span>
                  <span className="text-[11px] sm:text-[10px] font-mono font-semibold px-2 sm:px-1.5 py-1 sm:py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">PUMP.FUN TELEMETRY</span>
                </div>
                <p className="text-sm sm:text-xs text-text-secondary leading-relaxed font-normal">
                  Decodes on-chain Pump.fun bonding curves, calculates remaining SOL to Raydium graduation, and analyzes creator wallet track record.
                </p>
              </div>
            </div>
          </div>

          {/* Developer / Trading Bot Integration Strip */}
          <div className="p-5 bg-bg-card border border-border-color rounded-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-text-primary">REST API For Trading Bots</span>
                <span className="text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.2 rounded border border-[#38bdf8]/20">$49/MO</span>
              </div>
              <p className="text-xs text-text-secondary">
                Integrate instant token security checks directly into automated trading bots, copy trading systems, and execution pipelines.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <code className="text-[11px] font-mono px-3 py-1.5 bg-bg-secondary text-text-secondary rounded border border-border-color hidden sm:inline-block">
                POST https://rugsol.xyz/api/scan
              </code>
              <Link
                href="/api-docs"
                className="px-3.5 py-1.5 text-xs font-mono font-medium text-text-primary bg-bg-secondary hover:bg-border-color/60 border border-border-color rounded transition-colors whitespace-nowrap"
              >
                View API Docs →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
