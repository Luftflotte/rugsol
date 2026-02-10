"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TokenHeader } from "@/components/TokenHeader";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Checklist, CheckGroup } from "@/components/Checklist";
import { SidebarLinks } from "@/components/SidebarLinks";
import { BondingCurveProgress } from "@/components/BondingCurveProgress";
import { HolderChart } from "@/components/HolderChart";
import { RiskList } from "@/components/RiskList";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ScanResult } from "@/lib/scoring/engine";
import { InfoTooltip } from "@/components/InfoTooltip";

interface ScanResponse {
  success: boolean;
  cached: boolean;
  data: ScanResult;
}

function transformToCheckGroups(result: ScanResult): CheckGroup[] {
  const groups: CheckGroup[] = [];
  const isPump = result.scanMode === 'pump';

  // --- 1. Critical Safety (Always Show) ---
  const criticalChecks = [];

  // Honeypot
  if (result.checks.honeypot.data) {
    const hp = result.checks.honeypot.data;
    criticalChecks.push({
      id: "honeypot",
      name: "Sell Simulation",
      status: hp.isHoneypot ? ("fail" as const) : ("pass" as const),
      value: hp.isHoneypot ? "Failed" : "Pass (Sellable)",
      tooltip: hp.isHoneypot 
        ? `Cannot sell token. Simulation failed: ${hp.reason}` 
        : "Successfully simulated a sell transaction via Jupiter.",
      penalty: hp.isHoneypot ? 50 : 0,
    });
  }

  // Authorities
  if (result.checks.mintAuthority.data) {
    const ma = result.checks.mintAuthority.data;
    criticalChecks.push({
      id: "mint-auth",
      name: "Mint Authority",
      status: ma.status === "pass" ? "pass" as const : "fail" as const,
      value: ma.value,
      tooltip: ma.status === "pass" ? "Mint revoked." : "Owner can print new tokens.",
      penalty: ma.status === "fail" ? 25 : 0,
    });
  }
  if (result.checks.freezeAuthority.data) {
    const fa = result.checks.freezeAuthority.data;
    criticalChecks.push({
      id: "freeze-auth",
      name: "Freeze Authority",
      status: fa.status === "pass" ? "pass" as const : "fail" as const,
      value: fa.value,
      tooltip: fa.status === "pass" ? "Freeze revoked." : "Owner can freeze wallets.",
      penalty: fa.status === "fail" ? 15 : 0,
    });
  }

  // Check for $0 Liquidity (Critical)
  if (!isPump && result.checks.liquidity.data && result.checks.liquidity.data.lpSizeUsd === 0) {
     criticalChecks.push({
        id: "no-liq",
        name: "Liquidity Status",
        status: "fail" as const,
        value: "No Liquidity ($0)",
        tooltip: "Pool is empty. Cannot trade.",
        penalty: 50
     });
  }

  groups.push({ title: "Critical Safety", severity: "critical", checks: criticalChecks });

  // --- 2. High Risk (Liquidity) ---
  const liquidityChecks = [];
  if (result.checks.liquidity.data) {
    const liq = result.checks.liquidity.data;

    if (isPump) {
      // Pump Mode: Simplified Liquidity View (Pool Size is hidden, shown as bonding curve progress)
      // LP Lock is N/A
      liquidityChecks.push({
        id: "lp-lock",
        name: "LP Burned/Locked",
        status: "unknown" as const, // Neutral
        value: "N/A (Bonding Curve)",
        tooltip: "Liquidity is managed by Pump.fun bonding curve. Not applicable until graduation.",
      });
    } else {
      // DEX Mode: Detailed View (Skip if $0, already handled in Critical)
      if (liq.lpSizeUsd > 0 || liq.lpSizeUsd === -1) {
        liquidityChecks.push({
            id: "lp-size",
            name: "Pool Size",
            status: liq.lpSizeUsd === -1 ? "warning" as const : liq.lpSizeUsd > 50000 ? "pass" as const : "warning" as const,
            value: liq.lpSizeUsd === -1 ? "Unavailable" : `$${liq.lpSizeUsd.toLocaleString()}`,
            tooltip: liq.lpSizeUsd === -1 ? "Liquidity data could not be verified, but token has a price." : "Total value locked in the liquidity pool.",
            penalty: liq.lpSizeUsd === -1 ? 10 : liq.lpSizeUsd < 1000 ? 30 : liq.lpSizeUsd < 10000 ? 20 : liq.lpSizeUsd < 50000 ? 10 : 0,
        });

        // Forced N/A for LP Lock as per request
        liquidityChecks.push({
            id: "lp-lock",
            name: "LP Burned/Locked",
            status: "unknown" as const,
            value: "N/A",
            tooltip: "LP Lock check is temporarily disabled.",
            penalty: 0,
        });
      }
    }
  }
  
  if (liquidityChecks.length > 0) {
    groups.push({ title: "Liquidity", severity: "high", checks: liquidityChecks });
  }

  // --- 3. Insider Activity (Snipers, Bundles, Dev) ---
  const insiderChecks = [];
  const adv = result.checks.advanced?.data;

  // Dev Wallet Analysis
  if (adv) {
    if (adv.devAddress) {
      const isSoldOut = adv.isDevSoldOut;
      const devBalance = adv.devBalancePercent || 0;
      
      insiderChecks.push({
        id: "dev-status",
        name: "Dev Wallet",
        status: (isSoldOut || devBalance < 1) ? "fail" as const : "pass" as const, 
        value: isSoldOut ? "Sold Out (>99%)" : `Holds ${devBalance.toFixed(2)}%`,
        tooltip: isSoldOut 
          ? "Developer has sold all/most tokens. Potential abandonment." 
          : "Developer still holds a portion of supply.",
        penalty: result.penalties.find(p => p.category === "Dev Action")?.points || 0
      });
    }

    // Snipers
    const sniperSupply = adv.sniperSupplyPercent || 0;
    const sniperCount = adv.sniperCount || 0;
    
    insiderChecks.push({
      id: "snipers",
      name: "Snipers",
      status: sniperSupply > 25 ? "fail" as const : sniperSupply > 10 ? "warning" as const : "pass" as const,
      value: `${sniperCount} detected (${sniperSupply.toFixed(1)}%)`,
      tooltip: "Wallets that bought in the same block as deployment.",
    });

    // Bundles
    insiderChecks.push({
      id: "bundles",
      name: "Jito Bundles",
      status: adv.isBundled ? "warning" as const : "pass" as const,
      value: adv.isBundled ? "Yes" : "No",
      tooltip: "Detects if multiple buys were bundled in the first block (coordinated entry).",
    });
    
    // Linked Wallets
    if (adv.linkedWallets) {
       insiderChecks.push({
        id: "linked-wallets",
        name: "Linked Wallets",
        status: adv.linkedWallets.clusterCount > 0 ? "warning" as const : "pass" as const,
        value: adv.linkedWallets.clusterCount > 0 ? `${adv.linkedWallets.clusterCount} Clusters` : "None",
        tooltip: "Groups of wallets funded by the same source or interacting with each other.",
       });
    }
  }

  if (insiderChecks.length > 0) {
    groups.push({ title: "Insider Activity", severity: "insider", checks: insiderChecks });
  }

  // --- 4. Medium Risk (Holders) ---
  const holderChecks = [];
  if (result.checks.holders.data) {
    const h = result.checks.holders.data;
    const largest = h.largestHolder;
    
    // Top 10
    holderChecks.push({
      id: "top10",
      name: "Top 10 Holders",
      status: h.topTenPercent > 50 ? "fail" as const : h.topTenPercent > 30 ? "warning" as const : "pass" as const,
      value: `${h.topTenPercent.toFixed(1)}%`,
      tooltip: "Cumulative percentage held by top 10 wallets.",
      penalty: h.topTenPercent > 80 ? 50 : h.topTenPercent > 60 ? 35 : h.topTenPercent > 50 ? 25 : h.topTenPercent > 40 ? 15 : h.topTenPercent > 30 ? 10 : 0
    });

    // Largest Holder
    if (largest) {
        holderChecks.push({
            id: "largest-holder",
            name: "Largest Holder",
            status: largest.percent > 20 ? "warning" as const : "pass" as const,
            value: (
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${largest.percent > 20 ? 'text-yellow-400' : 'text-green-400'}`}>{largest.percent.toFixed(1)}%</span>
                    <span className="text-text-muted text-[10px] font-mono">[{largest.address.slice(0,4)}...{largest.address.slice(-4)}]</span>
                    {largest.address === adv?.devAddress && <span className="text-[10px] text-purple-400 font-bold ml-1">(Dev)</span>}
                </div>
            ),
            tooltip: "Percent of supply held by the single largest wallet.",
            penalty: largest.percent > 50 ? 40 : largest.percent > 30 ? 30 : largest.percent > 20 ? 20 : largest.percent > 10 ? 10 : 0
        });
    }
  }
  if (holderChecks.length > 0) {
    groups.push({ title: "Holder Distribution", severity: "medium", checks: holderChecks });
  }

  // --- 5. Low Risk (Metadata) ---
  const metaChecks = [];
  if (result.checks.metadata.data) {
    const m = result.checks.metadata.data;
    if (isPump) {
        // Pump Mode: Metadata is mutable by default
        metaChecks.push({
            id: "mutable",
            name: "Metadata Mutable",
            status: "unknown" as const, // Neutral
            value: "Default (Platform)",
            tooltip: "Pump.fun tokens have mutable metadata by default. This is normal.",
        });
    } else {
        metaChecks.push({
        id: "mutable",
        name: "Metadata Mutable",
        status: m.isMutable ? "warning" as const : "pass" as const,
        value: m.isMutable ? "Yes" : "Immutable",
        tooltip: "Can the developer change the token name/image later?",
        penalty: m.isMutable ? 10 : 0
        });
    }
    const hasSocials = m.twitter || m.telegram || m.website;
    metaChecks.push({
      id: "socials",
      name: "Social Links",
      status: hasSocials ? "pass" as const : "warning" as const,
      value: hasSocials ? "Found" : "Missing",
      tooltip: "Legit projects usually have social media presence.",
    });
  }
  
  if (metaChecks.length > 0) {
    groups.push({ title: "Metadata", severity: "low", checks: metaChecks });
  }

  return groups;
}

export default function ScanResultPage() {
  const params = useParams();
  const address = params.address as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cached, setCached] = useState(false);
  const [metadata, setMetadata] = useState<{
    name: string | null;
    symbol: string | null;
    image: string | null;
  }>({ name: null, symbol: null, image: null });

  useEffect(() => {
    async function fetchScan() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to scan token");
        }

        const data: ScanResponse = await response.json();

        setResult(data.data);
        setCached(data.cached);

        // Extract metadata
        if (data.data.checks.metadata.data) {
          setMetadata({
            name: data.data.checks.metadata.data.name,
            symbol: data.data.checks.metadata.data.symbol,
            image: data.data.checks.metadata.data.image,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchScan();
    }
  }, [address]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleShareImage = async () => {
    if (!result) return;
    setIsGenerating(true);

    const formatCompact = (num: number) => {
      if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
      return `$${num.toFixed(0)}`;
    };

    try {
      const metadata = result.checks.metadata.data;
      const price = result.price;
      const liq = result.checks.liquidity.data;
      const h = result.checks.holders.data;
      const adv = result.checks.advanced?.data;

      // Prepare tags (top 3 risk factors or safe points)
      const tags = result.penalties.slice(0, 3).map(p => p.category).join(",") || "Safe,Verified,Low Risk";

      const params = new URLSearchParams({
        address: result.tokenAddress,
        name: metadata?.name || "Unknown",
        symbol: metadata?.symbol || "TOKEN",
        score: result.score.toString(),
        grade: result.grade,
        label: result.gradeLabel,
        mode: result.scanMode,
        price: price?.priceUsd ? `$${price.priceUsd < 0.0001 ? price.priceUsd.toFixed(8) : price.priceUsd.toFixed(4)}` : "$0.00",
        mcap: price?.marketCap ? formatCompact(price.marketCap) : "0",
        change: price?.priceChange?.h24 ? `${price.priceChange.h24 > 0 ? '+' : ''}${price.priceChange.h24.toFixed(1)}%` : "0%",
        liq: result.scanMode === 'pump' ? `${result.bondingCurveData?.curveProgressPercent || 0}%` : (liq?.lpSizeUsd ? formatCompact(liq.lpSizeUsd) : "$0"),
        top10: h ? `${h.topTenPercent.toFixed(1)}%` : "0%",
        lock: result.scanMode === 'pump' ? (adv?.sniperCount?.toString() || "0") : (liq?.lpBurned ? "Burned" : "No"),
        sell: result.checks.honeypot.data?.isHoneypot ? "No" : "Yes",
        mint: result.checks.mintAuthority.data?.status === "pass" ? "Revoked" : "Active",
        penalty: result.totalPenalties.toString(),
        tags: tags,
        image: metadata?.image || ""
      });

      const url = `/api/og?${params.toString()}`;
      
      // Download the image
      const link = document.createElement("a");
      link.href = url;
      link.download = `rugsol_${result.tokenAddress.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16 sm:pt-20 md:pt-28 pb-8 sm:pb-10 md:pb-20 overflow-x-hidden">
        <div className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-5xl lg:max-w-7xl px-2 sm:px-3 md:px-4 lg:px-8">
          
          {/* Back Link */}
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary mb-6 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Back to Home</span>
          </Link>

          {loading && (
             <div className="flex flex-col items-center justify-center py-12 space-y-8">
                {/* Enhanced Loading Animation */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-bg-secondary to-bg-card flex items-center justify-center border border-border-color shadow-2xl">
                     <svg className="w-10 h-10 text-text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse blur-xl" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-text-primary font-semibold text-lg">Analyzing Token Security</p>
                  <p className="text-text-secondary text-sm">Scanning blockchain data and contract details...</p>
                </div>

                {/* Skeleton Loaders */}
                <div className="w-full max-w-3xl space-y-4 mt-8">
                  <div className="glass-card p-6 rounded-3xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-bg-secondary rounded-full" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-bg-secondary rounded w-1/3" />
                        <div className="h-3 bg-bg-secondary rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-3xl animate-pulse">
                    <div className="space-y-3">
                      <div className="h-3 bg-bg-secondary rounded w-full" />
                      <div className="h-3 bg-bg-secondary rounded w-5/6" />
                      <div className="h-3 bg-bg-secondary rounded w-4/6" />
                    </div>
                  </div>
                </div>
             </div>
          )}

          {error && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Analysis Failed</h2>
              <p className="text-text-secondary mb-4">{error}</p>
              <Link href="/" className="px-6 py-2 bg-bg-secondary rounded-lg">Try Another</Link>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-8 animate-fade-in-up">

              {/* Left Column: Header, Charts, Analysis */}
              <div className="space-y-8">

                {/* 1. Header Card - Enhanced */}
                <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden border border-border-color hover:border-silver-accent/50 transition-all duration-500 group">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative z-10">
                    <TokenHeader
                        name={metadata.name}
                        symbol={metadata.symbol}
                        image={metadata.image}
                        address={address}
                        priceData={result.price}
                        mode={result.scanMode}
                    />
                  </div>
                </div>

                {/* 2. Bonding Curve Progress (Pump only) */}
                {result.scanMode === 'pump' && result.bondingCurveData && (
                    <BondingCurveProgress
                        progressPercent={result.bondingCurveData.curveProgressPercent || 0}
                        marketCapSol={result.bondingCurveData.marketCapSol}
                        remainingSol={result.bondingCurveData.remainingSolToGraduate}
                        solPrice={result.solPrice}
                    />
                )}

                {/* 3. Security Analysis Checklist */}
                <div>
                   <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
                    <h2 className="text-xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Security Analysis
                      <InfoTooltip
                        content={
                          <div className="space-y-2">
                            <p className="font-bold text-text-primary">Comprehensive Security Analysis</p>
                            <p>Detailed verification of token safety across multiple risk categories.</p>
                            <div className="space-y-1 text-[11px] mt-2">
                              <p><strong className="text-red-400">Critical:</strong> Honeypot detection, authority status</p>
                              <p><strong className="text-orange-400">High Risk:</strong> Liquidity analysis & lock status</p>
                              <p><strong className="text-purple-400">Insider Activity:</strong> Dev wallet, snipers, linked wallets</p>
                              <p><strong className="text-yellow-400">Medium:</strong> Holder distribution & concentration</p>
                              <p><strong className="text-blue-400">Low:</strong> Metadata & social presence</p>
                            </div>
                            <p className="text-[10px] opacity-70 mt-2">Click any check for detailed explanation</p>
                          </div>
                        }
                        position="bottom"
                      />
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
                  </div>

                  {/* Pump Mode Info Banner */}
                  {result.scanMode === 'pump' && (
                    <div className="mb-4 p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 text-xs text-text-secondary flex items-start gap-2">
                        <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>This token is trading on Pump.fun&apos;s bonding curve. Some checks are adjusted for this context.</p>
                    </div>
                  )}

                  <Checklist groups={transformToCheckGroups(result)} />
                </div>

                {/* 4. Holder Distribution Chart - Enhanced */}
                {result.checks.holders.data && (
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-border-color hover:border-silver-accent/50 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
                          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                              Top Holders Distribution
                              <InfoTooltip
                                content={
                                  <div className="space-y-2">
                                    <p className="font-bold text-text-primary">Token Holder Distribution</p>
                                    <p>Visual breakdown of the top 10 wallets holding this token.</p>
                                    <div className="space-y-1 text-[11px] mt-2">
                                      <p>• High concentration = Higher risk</p>
                                      <p>• Healthy tokens have distributed ownership</p>
                                      <p>• Color coding identifies wallet types</p>
                                    </div>
                                    <p className="text-[10px] opacity-70 mt-2">Hover over bars for wallet details</p>
                                  </div>
                                }
                                position="bottom"
                              />
                          </h3>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
                        </div>
                        <HolderChart
                            holders={result.checks.holders.data.topHolders}
                            devAddress={result.checks.advanced?.data?.devAddress}
                            snipers={result.checks.advanced?.data?.snipers}
                            linkedWallets={result.checks.advanced?.data?.linkedWalletMap}
                        />
                    </div>
                )}

                {/* 5. Risk Factors List */}
                {result.penalties.length > 0 && (
                    <RiskList penalties={result.penalties} />
                )}

                {/* 6. Timeline */}
                <ActivityTimeline scanResult={result} />

              </div>

              {/* Right Column: Score, Sticky Actions - Enhanced */}
              <div className="space-y-6">
                <div className="glass-card p-6 md:p-8 rounded-3xl sticky top-24 border border-border-color hover:border-silver-accent/50 transition-all duration-500">
                  <ScoreDisplay
                    score={result.score}
                    grade={result.grade}
                    gradeColor={result.gradeColor}
                    gradeLabel={result.gradeLabel}
                    animate={true}
                  />

                  <div className="mt-8 space-y-3">
                    <button
                      onClick={handleShareImage}
                      disabled={isGenerating}
                      className="w-full py-3.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <span className="relative z-10 flex items-center gap-2">
                        {isGenerating ? (
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        )}
                        {isGenerating ? "Generating..." : "Share Report Card"}
                      </span>
                    </button>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(`Just scanned ${metadata.name || 'this token'} ($${metadata.symbol || 'TOKEN'}) on @RugSol\n\nScore: ${result.score}/100 (Grade ${result.grade})\n\nCheck it out:`);
                          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                        }}
                        className="py-2.5 px-3 bg-bg-secondary hover:bg-bg-card text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 border border-border-color hover:border-silver-accent/50 hover:scale-105 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Tweet
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="py-2.5 px-3 bg-bg-secondary hover:bg-bg-card text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 border border-border-color hover:border-silver-accent/50 hover:scale-105 active:scale-95"
                      >
                        {copySuccess ? (
                          <>
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border-color">
                     <SidebarLinks
                        address={address}
                        scannedAt={new Date(result.scannedAt)}
                        cached={cached}
                     />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}