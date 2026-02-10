"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
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
                    <span className="text-red-400 font-bold text-sm">{largest.percent.toFixed(1)}%</span>
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
  const { theme } = useTheme();
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

  const handleShareImage = async () => {
    // Share logic placeholder
    alert("Share image functionality");
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
             <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center animate-pulse mb-4">
                   <svg className="w-8 h-8 text-text-muted animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
                <p className="text-text-secondary">Analyzing blockchain data...</p>
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
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6">
              
              {/* Left Column: Header, Charts, Analysis */}
              <div className="space-y-6">
                
                {/* 1. Header Card */}
                <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex items-start justify-between">
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
                   <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--silver-accent)]/30 to-transparent" />
                    <h2 className="text-lg font-bold text-text-primary tracking-wide">Security Analysis</h2>
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

                {/* 4. Holder Distribution Chart */}
                {result.checks.holders.data && (
                    <div className="glass-card p-6 rounded-2xl border border-border-color">
                        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                            Top Holders Distribution
                        </h3>
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

              {/* Right Column: Score, Sticky Actions */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl sticky top-24">
                  <ScoreDisplay
                    score={result.score}
                    grade={result.grade}
                    gradeColor={result.gradeColor}
                    gradeLabel={result.gradeLabel}
                    animate={true}
                  />
                  
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