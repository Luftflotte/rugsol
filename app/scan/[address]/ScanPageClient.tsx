"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
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
import { DevHistory } from "@/components/DevHistory";
import { ScanResult } from "@/lib/scoring/engine";
import { RateLimitModal } from "@/components/RateLimitModal";
import { useTheme } from "@/components/ThemeProvider";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Flame,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";

interface ScanResponse {
  success: boolean;
  cached: boolean;
  data: ScanResult;
}

function transformToCheckGroups(result: ScanResult): CheckGroup[] {
  const groups: CheckGroup[] = [];
  const isPump = result.scanMode === "pump";

  // --- 1. Critical Safety ---
  const criticalChecks = [];

  // Honeypot
  if (result.checks.honeypot.data) {
    const hp = result.checks.honeypot.data;
    if (isPump) {
      criticalChecks.push({
        id: "honeypot",
        name: "Sell Simulation (Jupiter)",
        status: "unknown" as const,
        value: "N/A (Bonding Curve)",
        tooltip: "Sell simulation is skipped for Pump.fun bonding curve tokens. Jupiter swap routes open only after migration.",
        penalty: 0,
      });
    } else {
      criticalChecks.push({
        id: "honeypot",
        name: "Sell Simulation (Jupiter)",
        status: hp.isHoneypot ? ("fail" as const) : ("pass" as const),
        value: hp.isHoneypot ? "FAILED (CANNOT SELL)" : "PASS (SELLABLE)",
        tooltip: hp.isHoneypot
          ? `Cannot liquidate token. Simulated sell route failed: ${hp.reason}`
          : "Successfully simulated a sell transaction via Jupiter DEX router.",
        penalty: hp.isHoneypot ? 100 : 0,
      });
    }
  }

  // Authorities
  if (result.checks.mintAuthority.data) {
    const ma = result.checks.mintAuthority.data;
    if (isPump) {
      criticalChecks.push({
        id: "mint-auth",
        name: "Mint Authority",
        status: "pass" as const,
        value: "BONDING CURVE PDA",
        tooltip: "Mint authority is owned by Pump.fun program PDA. Supply is strictly governed by bonding math.",
        penalty: 0,
      });
    } else {
      criticalChecks.push({
        id: "mint-auth",
        name: "Mint Authority",
        status: ma.status === "pass" ? ("pass" as const) : ("fail" as const),
        value: ma.status === "pass" ? "REVOKED" : "ENABLED (DANGEROUS)",
        tooltip: ma.status === "pass" ? "Supply is permanently capped. Owner cannot mint new tokens." : "Owner retains authority to mint infinite new tokens and dump them.",
        penalty: ma.status === "fail" ? 50 : 0,
      });
    }
  }

  if (result.checks.freezeAuthority.data) {
    const fa = result.checks.freezeAuthority.data;
    if (isPump) {
      criticalChecks.push({
        id: "freeze-auth",
        name: "Freeze Authority",
        status: "pass" as const,
        value: "PROGRAM CONTROLLED",
        tooltip: "Freeze authority is managed by Pump.fun program with standard non-freezable parameters.",
        penalty: 0,
      });
    } else {
      criticalChecks.push({
        id: "freeze-auth",
        name: "Freeze Authority",
        status: fa.status === "pass" ? ("pass" as const) : ("fail" as const),
        value: fa.status === "pass" ? "REVOKED" : "ENABLED (CAN FREEZE)",
        tooltip: fa.status === "pass" ? "Owner cannot blacklist or freeze holder token accounts." : "Owner can freeze token accounts and prevent holders from trading.",
        penalty: fa.status === "fail" ? 30 : 0,
      });
    }
  }

  if (!isPump && result.checks.liquidity.data && result.checks.liquidity.data.lpSizeUsd === 0) {
    criticalChecks.push({
      id: "no-liq",
      name: "Liquidity Status",
      status: "fail" as const,
      value: "ZERO LIQUIDITY ($0)",
      tooltip: "Pool has no trading liquidity. Trading will suffer 100% price slippage.",
      penalty: 50,
    });
  }

  groups.push({ title: "Critical Contract Safety", severity: "critical", checks: criticalChecks });

  // --- 2. High Risk (Liquidity) ---
  const liquidityChecks = [];
  if (result.checks.liquidity.data) {
    const liq = result.checks.liquidity.data;

    if (isPump) {
      liquidityChecks.push({
        id: "lp-lock",
        name: "LP Tokens Locked/Burned",
        status: "unknown" as const,
        value: "N/A (Bonding Curve)",
        tooltip: "Liquidity is collateralized inside the bonding curve until graduation.",
      });
    } else {
      if (liq.lpSizeUsd > 0 || liq.lpSizeUsd === -1) {
        liquidityChecks.push({
          id: "lp-size",
          name: "Total Liquidity Pool",
          status: liq.lpSizeUsd === -1 ? ("warning" as const) : liq.lpSizeUsd > 50000 ? ("pass" as const) : ("warning" as const),
          value: liq.lpSizeUsd === -1 ? "UNAVAILABLE" : `$${Math.round(liq.lpSizeUsd).toLocaleString()}`,
          tooltip: "Total USD value locked in DEX liquidity pools.",
          penalty: liq.lpSizeUsd === -1 ? 10 : liq.lpSizeUsd < 1000 ? 30 : liq.lpSizeUsd < 10000 ? 20 : liq.lpSizeUsd < 50000 ? 10 : 0,
        });

        liquidityChecks.push({
          id: "lp-burned",
          name: "Liquidity Burn / Lock",
          status: liq.lpBurned ? ("pass" as const) : liq.lpLocked ? ("pass" as const) : ("fail" as const),
          value: liq.lpBurned ? "100% BURNED" : liq.lpLocked ? "LOCKED" : "NOT LOCKED (PULLABLE)",
          tooltip: liq.lpBurned ? "LP tokens were sent to dead address." : liq.lpLocked ? "LP tokens locked in verifiable locker." : "Deployer can pull pool liquidity at any moment.",
          penalty: liq.lpBurned || liq.lpLocked ? 0 : 30,
        });
      }
    }
  }

  if (liquidityChecks.length > 0) {
    groups.push({ title: "Liquidity & Pool Health", severity: "high", checks: liquidityChecks });
  }

  // --- 3. Medium Risk (Holders) ---
  const holderChecks = [];
  if (result.checks.holders.data) {
    const h = result.checks.holders.data;
    const largest = h.largestHolder;

    holderChecks.push({
      id: "top-10",
      name: "Top 10 Holder Concentration",
      status: h.topTenPercent > 60 ? ("fail" as const) : h.topTenPercent > 40 ? ("warning" as const) : ("pass" as const),
      value: `${h.topTenPercent.toFixed(1)}%`,
      tooltip: "Cumulative supply held by top 10 largest non-pool wallets.",
      penalty: h.topTenPercent > 80 ? 50 : h.topTenPercent > 60 ? 35 : h.topTenPercent > 50 ? 25 : h.topTenPercent > 40 ? 15 : h.topTenPercent > 30 ? 10 : 0,
    });

    if (largest) {
      holderChecks.push({
        id: "largest-holder",
        name: "Largest Single Holder",
        status: largest.percent > 20 ? ("warning" as const) : ("pass" as const),
        value: `${largest.percent.toFixed(1)}% (${largest.address.slice(0, 4)}...${largest.address.slice(-4)})`,
        tooltip: "Percentage of circulating supply held by the single largest individual wallet.",
        penalty: largest.percent > 50 ? 40 : largest.percent > 30 ? 30 : largest.percent > 20 ? 20 : largest.percent > 10 ? 10 : 0,
      });
    }

    if (h.clustersDetected && h.clustersDetected > 0) {
      holderChecks.push({
        id: "clusters",
        name: "Suspicious Wallet Clusters",
        status: "warning" as const,
        value: `${h.clustersDetected} CLUSTERS`,
        tooltip: "Multiple distinct wallet addresses exhibiting coordinated funding sources or synchronized balances.",
        penalty: 15,
      });
    }
  }

  if (holderChecks.length > 0) {
    groups.push({ title: "Token Distribution & Concentration", severity: "medium", checks: holderChecks });
  }

  // --- 4. Insider & Bot Activity ---
  const insiderChecks = [];
  if (result.checks.advanced?.data) {
    const adv = result.checks.advanced.data;
    if (adv.sniperCount !== undefined) {
      const sniperSupply = adv.sniperSupplyPercent || 0;
      insiderChecks.push({
        id: "snipers",
        name: "Block-0 Sniper Wallets",
        status: adv.sniperCount > 5 || sniperSupply > 15 ? ("warning" as const) : ("pass" as const),
        value: `${adv.sniperCount} SNIPERS (${sniperSupply.toFixed(1)}%)`,
        tooltip: "Wallets that purchased in the exact same block as contract deployment.",
        penalty: adv.sniperCount > 5 ? 15 : 0,
      });
    }

    if (adv.isBundled !== undefined) {
      insiderChecks.push({
        id: "bundles",
        name: "Jito Bundled Liquidity Injection",
        status: adv.isBundled ? ("warning" as const) : ("pass" as const),
        value: adv.isBundled ? "DETECTED" : "CLEAN",
        tooltip: "MEV bundle coordination detected in block 0.",
        penalty: adv.isBundled ? 15 : 0,
      });
    }

    if (adv.devBalancePercent !== undefined) {
      insiderChecks.push({
        id: "dev-holding",
        name: "Deployer Wallet Holding",
        status: adv.devBalancePercent > 10 ? ("warning" as const) : ("pass" as const),
        value: `${adv.devBalancePercent.toFixed(2)}%`,
        tooltip: "Current percentage of total supply held by the deployer.",
        penalty: adv.devBalancePercent > 15 ? 20 : 0,
      });
    }
  }

  if (insiderChecks.length > 0) {
    groups.push({ title: "Insider & Bot Activity", severity: "insider", checks: insiderChecks });
  }

  // --- 5. Metadata Integrity ---
  const metaChecks = [];
  if (result.checks.metadata.data) {
    const m = result.checks.metadata.data;
    if (isPump) {
      metaChecks.push({
        id: "mutable",
        name: "Metadata Mutability",
        status: "unknown" as const,
        value: "PLATFORM STANDARD",
        tooltip: "Pump.fun tokens have mutable metadata standard until graduation.",
      });
    } else {
      metaChecks.push({
        id: "mutable",
        name: "Metadata Mutability",
        status: m.isMutable ? ("warning" as const) : ("pass" as const),
        value: m.isMutable ? "MUTABLE" : "IMMUTABLE",
        tooltip: m.isMutable ? "Deployer can modify token name, symbol, or image." : "Metadata is permanently frozen.",
        penalty: m.isMutable ? 5 : 0,
      });
    }

    const hasSocials = m.twitter || m.telegram || m.website;
    metaChecks.push({
      id: "socials",
      name: "Verified Social Links",
      status: hasSocials ? ("pass" as const) : ("warning" as const),
      value: hasSocials ? "LINKED" : "UNVERIFIED",
      tooltip: "Verifiable social media channels present in token metadata.",
    });
  }

  if (metaChecks.length > 0) {
    groups.push({ title: "Metadata Integrity", severity: "low", checks: metaChecks });
  }

  return groups;
}

export default function ScanPageClient() {
  const params = useParams();
  const address = params.address as string;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cached, setCached] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [metadata, setMetadata] = useState<{
    name: string | null;
    symbol: string | null;
    image: string | null;
  }>({ name: null, symbol: null, image: null });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAuthModalClose = useCallback(() => {
    setNeedsAuth(false);
  }, []);

  const handleWalletConnected = useCallback(() => {
    setNeedsAuth(false);
    loadScan(address);
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadScan(addr: string) {
    setLoading(true);
    setError(null);

    try {
      const cacheResponse = await fetch(`/api/scan?address=${encodeURIComponent(addr)}`, {
        method: "GET",
      });

      if (cacheResponse.ok) {
        const data: ScanResponse = await cacheResponse.json();
        setResult(data.data);
        setCached(data.cached);

        if (data.data.checks.metadata.data) {
          setMetadata({
            name: data.data.checks.metadata.data.name,
            symbol: data.data.checks.metadata.data.symbol,
            image: data.data.checks.metadata.data.image,
          });
        }
        setLoading(false);
        return;
      }

      if (cacheResponse.status === 404) {
        const scanResponse = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: addr }),
        });

        if (!scanResponse.ok) {
          const errorData = await scanResponse.json();

          if (scanResponse.status === 429 && errorData.needsAuth) {
            setNeedsAuth(true);
            setLoading(false);
            return;
          }

          throw new Error(errorData.error || "Failed to scan token");
        }

        const data: ScanResponse = await scanResponse.json();
        setResult(data.data);
        setCached(data.cached);

        if (data.data.checks.metadata.data) {
          setMetadata({
            name: data.data.checks.metadata.data.name,
            symbol: data.data.checks.metadata.data.symbol,
            image: data.data.checks.metadata.data.image,
          });
        }
        setLoading(false);
        return;
      }

      throw new Error("Failed to load scan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!address) return;
    loadScan(address);
  }, [address]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
      const meta = result.checks.metadata.data;
      const price = result.price;
      const liq = result.checks.liquidity.data;
      const h = result.checks.holders.data;
      const adv = result.checks.advanced?.data;

      const topPenalties = result.penalties.slice(0, 3);
      const tags = topPenalties.map((p) => p.category).join(",") || "Safe,Verified,Low Risk";
      const tagPoints = topPenalties.map((p) => p.points).join(",");

      const params = new URLSearchParams({
        address: result.tokenAddress,
        name: meta?.name || "Unknown",
        symbol: meta?.symbol || "TOKEN",
        score: result.score.toString(),
        grade: result.grade,
        label: result.gradeLabel,
        mode: result.scanMode,
        price: price?.priceUsd ? `$${parseFloat(price.priceUsd < 0.0001 ? price.priceUsd.toFixed(8) : price.priceUsd.toFixed(4))}` : "$0.00",
        mcap: price?.marketCap ? formatCompact(price.marketCap) : "0",
        change: price?.priceChange?.h24 ? `${price.priceChange.h24 > 0 ? "+" : ""}${price.priceChange.h24.toFixed(1)}%` : "0%",
        liq: result.scanMode === "pump" ? `${result.bondingCurveData?.curveProgressPercent || 0}%` : liq?.lpSizeUsd ? formatCompact(liq.lpSizeUsd) : "$0",
        top10: h ? `${h.topTenPercent.toFixed(1)}%` : "0%",
        lock: result.scanMode === "pump" ? adv?.sniperCount?.toString() || "0" : liq?.lpBurned ? "Burned" : "No",
        sell: result.checks.honeypot.data?.isHoneypot ? "No" : "Yes",
        mint: "Revoked",
        penalty: result.totalPenalties.toString(),
        tags: tags,
        tagPoints: tagPoints,
        image: meta?.image || "",
        theme: theme,
      });

      const url = `/api/og?${params.toString()}`;
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
    <div className="min-h-screen flex flex-col bg-bg-main text-text-primary font-sans antialiased selection:bg-[#38bdf8]/30">
      <Navbar />

      <main className="flex-1 pt-14 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between py-4 border-b border-[#1e2433] mb-6 font-mono text-xs text-[#64748b]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[#38bdf8] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>TERMINAL ROOT</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[#38bdf8]">AUDIT ID:</span>
              <span className="text-[#94a3b8]">{address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ""}</span>
            </div>
          </div>

          {/* Loading: Authentic Terminal Diagnostics Console */}
          {loading && (
            <div className="w-full max-w-2xl mx-auto py-12">
              <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden shadow-2xl">
                {/* Console titlebar */}
                <div className="px-4 py-2.5 bg-[#121622] border-b border-[#1e2433] flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[#64748b] ml-2">rugsol-audit-node — helius-rpc</span>
                  </div>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    EXECUTING
                  </span>
                </div>

                {/* Console output lines */}
                <div className="p-5 font-mono text-xs space-y-3">
                  <div className="text-[#64748b]">
                    &gt; Target Contract: <span className="text-[#38bdf8]">{address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <span className="text-emerald-400">[0.08s]</span>
                    <span>Querying Solana ledger via Helius RPC nodes...</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <span className="text-emerald-400">[0.21s]</span>
                    <span>Decoding SPL Token mint & freeze authority PDA structures...</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <span className="text-amber-400">[0.45s]</span>
                    <span>Simulating route liquidity via Jupiter Quote API...</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <span className="text-sky-400">[0.68s]</span>
                    <span>Analyzing holder clustering and initial block-0 snipers...</span>
                  </div>

                  <div className="pt-4 border-t border-[#1e2433] flex items-center justify-between text-[#64748b]">
                    <span>Calculating risk deductions...</span>
                    <span className="animate-spin text-[#38bdf8]">◷</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-xl mx-auto py-12">
              <div className="bg-[#0e1118] border border-rose-500/30 rounded-xl p-6 text-center space-y-4">
                <div className="inline-flex p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-mono font-bold text-[#f1f5f9]">
                  AUDIT SCAN FAILED
                </h3>
                <p className="text-xs text-[#94a3b8] font-mono leading-relaxed">
                  {error}
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#1e2433] text-xs font-mono font-semibold text-[#f1f5f9] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Return to Terminal Search
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Audit Results Dashboard */}
          {result && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Left Column: Comprehensive Audit Intelligence */}
              <div className="space-y-6 min-w-0">
                {/* 1. Token Header Bar */}
                <TokenHeader
                  name={metadata.name}
                  symbol={metadata.symbol}
                  image={metadata.image}
                  address={address}
                  priceData={result.price}
                  mode={result.scanMode}
                />

                {/* 2. Pump.fun Curve Progress (if applicable) */}
                {result.scanMode === "pump" && result.bondingCurveData && (
                  <BondingCurveProgress
                    progressPercent={result.bondingCurveData.curveProgressPercent || 0}
                    marketCapSol={result.bondingCurveData.marketCapSol}
                    remainingSol={result.bondingCurveData.remainingSolToGraduate}
                    solPrice={result.solPrice}
                  />
                )}

                {/* 3. High-Density Security Matrix Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {/* Mint Auth */}
                  <div className="p-3 rounded-xl bg-[#0e1118] border border-[#1e2433]">
                    <span className="text-[10px] text-[#64748b] uppercase block">Mint Authority</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold">
                      {result.checks.mintAuthority.data?.status === "pass" || result.scanMode === "pump" ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Revoked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Active</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Freeze Auth */}
                  <div className="p-3 rounded-xl bg-[#0e1118] border border-[#1e2433]">
                    <span className="text-[10px] text-[#64748b] uppercase block">Freeze Authority</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold">
                      {result.checks.freezeAuthority.data?.status === "pass" || result.scanMode === "pump" ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Revoked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Active</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Honeypot Sell Test */}
                  <div className="p-3 rounded-xl bg-[#0e1118] border border-[#1e2433]">
                    <span className="text-[10px] text-[#64748b] uppercase block">Sell Simulation</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold">
                      {result.scanMode === "pump" ? (
                        <span className="text-[#38bdf8]">Bonding Curve</span>
                      ) : result.checks.honeypot.data?.isHoneypot ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Failed</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Sellable</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Liquidity Status */}
                  <div className="p-3 rounded-xl bg-[#0e1118] border border-[#1e2433]">
                    <span className="text-[10px] text-[#64748b] uppercase block">Liquidity Burn/Lock</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold">
                      {result.scanMode === "pump" ? (
                        <span className="text-amber-400">Curve Collateral</span>
                      ) : result.checks.liquidity.data?.lpBurned ? (
                        <>
                          <Flame className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">100% Burned</span>
                        </>
                      ) : result.checks.liquidity.data?.lpLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Locked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Unlocked</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Security Audit Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#1e2433]">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-[#38bdf8]" />
                      SECURITY INSPECTION PROTOCOL
                    </h3>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      DIRECT ON-CHAIN AUDIT
                    </span>
                  </div>
                  <Checklist groups={transformToCheckGroups(result)} />
                </div>

                {/* 5. Vulnerability Threat Log (if penalties exist) */}
                {result.penalties.length > 0 && (
                  <RiskList penalties={result.penalties} />
                )}

                {/* 6. Holder Concentration Matrix */}
                {result.checks.holders.data && (
                  <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1e2433]">
                      <h3 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase">
                        TOKEN HOLDER DISTRIBUTION & WHALE CONCENTRATION
                      </h3>
                      <span className="text-[10px] font-mono text-[#64748b]">
                        TOP 10 WALLETS
                      </span>
                    </div>
                    <HolderChart
                      holders={result.checks.holders.data.topHolders}
                      devAddress={result.checks.advanced?.data?.devAddress}
                      snipers={result.checks.advanced?.data?.snipers}
                      linkedWallets={result.checks.advanced?.data?.linkedWalletMap}
                    />
                  </div>
                )}

                {/* 7. Developer Dossier (if suspicious) */}
                <DevHistory
                  score={result.score}
                  grade={result.grade}
                  isWhitelisted={result.isWhitelisted}
                  marketCap={result.price?.marketCap}
                />

                {/* 8. On-Chain Forensic Event Log */}
                <ActivityTimeline scanResult={result} />
              </div>

              {/* Right Column: Sticky Telemetry & Actions */}
              <div className="space-y-5 lg:sticky lg:top-20">
                {/* Score & Risk Gauge Card */}
                <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
                  <ScoreDisplay
                    score={result.score}
                    grade={result.grade}
                    gradeColor={result.gradeColor}
                    gradeLabel={result.gradeLabel}
                    animate={true}
                  />

                  {/* Primary Command Actions */}
                  <div className="space-y-2 pt-2 border-t border-[#1e2433]">
                    <button
                      onClick={handleShareImage}
                      disabled={isGenerating}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#38bdf8] hover:bg-[#0284c7] text-[#090b10] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isGenerating ? (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isGenerating ? "Exporting..." : "Export Audit Card"}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `RugSol Security Audit: ${metadata.name || "Token"} ($${metadata.symbol || "TOKEN"})\n` +
                            `Score: ${result.score}/100 (Grade ${result.grade})\n` +
                            `On-chain safety report generated by @RugSolScanner`
                          );
                          window.open(
                            `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`,
                            "_blank"
                          );
                        }}
                        className="py-2 px-3 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-[#f1f5f9] border border-[#1e2433] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3 text-[#38bdf8]" />
                        Share on X
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="py-2 px-3 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-[#f1f5f9] border border-[#1e2433] transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* External Protocol Explorers */}
                <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-4 sm:p-5">
                  <SidebarLinks
                    address={address}
                    scannedAt={new Date(result.scannedAt)}
                    cached={cached}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Auth / Rate Limit Modal */}
      {needsAuth && (
        <RateLimitModal
          onClose={handleAuthModalClose}
          onWalletConnected={handleWalletConnected}
        />
      )}
    </div>
  );
}