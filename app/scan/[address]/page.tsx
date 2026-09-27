import type { Metadata } from "next";
import { getRecentScanByAddress, addRecentScan } from "@/lib/storage/recent-scans";
import { scanToken } from "@/lib/scoring/engine";
import { buildOgQuery } from "@/lib/utils/og";
import { isValidSolanaAddress } from "@/lib/utils";
import { getBaseUrl } from "@/lib/utils/url";
import ScanPageClient from "./ScanPageClient";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const baseUrl = getBaseUrl();

  // 1. Check recent scans cache (persisted to disk)
  let scan = getRecentScanByAddress(address);

  // 2. No cache — run a live scan (for Twitter/OG crawlers)
  if (!scan?.ogQuery && isValidSolanaAddress(address)) {
    try {
      // 3000ms timeout for Twitter crawler
      const result = await Promise.race([
        scanToken(address),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout fetching scan for OG")), 3000))
      ]);
      const meta = result.checks.metadata.data;
      const ogQuery = buildOgQuery(result);

      addRecentScan({
        address: result.tokenAddress,
        name: meta?.name || result.whitelistInfo?.name || "Unknown",
        symbol: meta?.symbol || result.whitelistInfo?.symbol || "???",
        image: meta?.image || undefined,
        score: result.score,
        grade: result.grade,
        gradeLabel: result.gradeLabel,
        gradeColor: result.gradeColor,
        scannedAt: result.scannedAt.toISOString(),
        createdAt: meta?.createdAt || undefined,
        ogQuery,
      });

      scan = getRecentScanByAddress(address);
    } catch (e) {
      console.error("OG scan failed or timed out:", e);
    }
  }

  if (scan?.ogQuery) {
    const ogUrl = `${baseUrl}/api/og?${scan.ogQuery}`;
    const title = `${scan.name} ($${scan.symbol}) | RugSol Scan`;
    const description = `${scan.name} ($${scan.symbol}) scored ${scan.score}/100 (Grade ${scan.grade}: ${scan.gradeLabel || "Analyzed"}). Powered by RugSol.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "RugSol",
        images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogUrl],
      },
    };
  }

  // Fallback when scan failed or invalid address
  const title = `Token Scan | RugSol`;
  const description = `Solana token security analysis. Powered by RugSol.`;
  const ogUrl = `${baseUrl}/api/og?mode=home`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "RugSol",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function ScanPage() {
  return <ScanPageClient />;
}
