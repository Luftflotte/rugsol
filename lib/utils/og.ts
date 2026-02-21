import { ScanResult } from "@/lib/scoring/engine";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function buildOgQuery(result: ScanResult): string {
  const meta = result.checks.metadata.data;
  const price = result.price;
  const liq = result.checks.liquidity.data;
  const h = result.checks.holders.data;
  const adv = result.checks.advanced?.data;
  const topPenalties = result.penalties.slice(0, 3);

  return new URLSearchParams({
    address: result.tokenAddress,
    name: meta?.name || "Unknown",
    symbol: meta?.symbol || "TOKEN",
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
    tags: topPenalties.map(p => p.category).join(",") || "Safe,Verified,Low Risk",
    tagPoints: topPenalties.map(p => p.points).join(","),
    image: meta?.image || "",
  }).toString();
}
