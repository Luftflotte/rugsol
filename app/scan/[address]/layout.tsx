import { Metadata } from "next";
import { scanToken } from "@/lib/scoring/engine";
import { getRecentScanByAddress } from "@/lib/storage/recent-scans";
import { isValidSolanaAddress } from "@/lib/utils";

interface Props {
  params: Promise<{ address: string }>;
}

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  // Default fallback
  let ogImageUrl = `${siteUrl}/api/og?address=${address}`;
  let tokenName = shortAddress;
  let description = `Security analysis for Solana token ${shortAddress}. Check mint authority, freeze authority, liquidity, and holder distribution.`;

  if (!isValidSolanaAddress(address)) {
    return buildMetadata(tokenName, description, ogImageUrl);
  }

  // 1) Try cached scan data first (instant, no API calls)
  const cached = getRecentScanByAddress(address);
  if (cached?.ogQuery) {
    tokenName = `${cached.name} ($${cached.symbol})`;
    description = `${cached.name} ($${cached.symbol}) scored ${cached.score}/100 (Grade ${cached.grade}: ${cached.gradeLabel || "N/A"}). Powered by RugSol.`;
    ogImageUrl = `${siteUrl}/api/og?${cached.ogQuery}`;
    return buildMetadata(tokenName, description, ogImageUrl);
  }

  // 2) No cache — run fresh scan (slow, but needed for first-time visits)
  try {
    const result = await scanToken(address);
    const meta = result.checks.metadata.data;
    const price = result.price;
    const liq = result.checks.liquidity.data;
    const h = result.checks.holders.data;
    const adv = result.checks.advanced?.data;

    const name = meta?.name || "Unknown";
    const symbol = meta?.symbol || "TOKEN";
    tokenName = `${name} ($${symbol})`;

    const topPenalties = result.penalties.slice(0, 3);
    const tags = topPenalties.map(p => p.category).join(",") || "Safe,Verified,Low Risk";
    const tagPoints = topPenalties.map(p => p.points).join(",");

    const ogParams = new URLSearchParams({
      address: result.tokenAddress,
      name,
      symbol,
      score: result.score.toString(),
      grade: result.grade,
      label: result.gradeLabel,
      mode: result.scanMode,
      price: price?.priceUsd ? `$${parseFloat((price.priceUsd < 0.0001 ? price.priceUsd.toFixed(8) : price.priceUsd.toFixed(4)))}` : "$0.00",
      mcap: price?.marketCap ? formatCompact(price.marketCap) : "0",
      change: price?.priceChange?.h24 ? `${price.priceChange.h24 > 0 ? "+" : ""}${price.priceChange.h24.toFixed(1)}%` : "0%",
      liq: result.scanMode === "pump" ? `${result.bondingCurveData?.curveProgressPercent || 0}%` : (liq?.lpSizeUsd ? formatCompact(liq.lpSizeUsd) : "$0"),
      top10: h ? `${h.topTenPercent.toFixed(1)}%` : "0%",
      lock: result.scanMode === "pump" ? (adv?.sniperCount?.toString() || "0") : (liq?.lpBurned ? "Burned" : "No"),
      sell: result.checks.honeypot.data?.isHoneypot ? "No" : "Yes",
      mint: result.checks.mintAuthority.data?.status === "pass" ? "Revoked" : "Active",
      penalty: result.totalPenalties.toString(),
      tags,
      tagPoints,
      image: meta?.image || "",
    });

    ogImageUrl = `${siteUrl}/api/og?${ogParams.toString()}`;
    description = `${name} ($${symbol}) scored ${result.score}/100 (Grade ${result.grade}: ${result.gradeLabel}). Powered by RugSol.`;
  } catch (e) {
    console.warn("generateMetadata: scan failed, using fallback OG", e);
  }

  return buildMetadata(tokenName, description, ogImageUrl);
}

function buildMetadata(tokenName: string, description: string, ogImageUrl: string): Metadata {
  return {
    title: `${tokenName} | RugSol`,
    description,
    openGraph: {
      title: `${tokenName} | RugSol Scan`,
      description,
      type: "website",
      siteName: "RugSol",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `RugSol scan result for ${tokenName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tokenName} | RugSol Scan`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
