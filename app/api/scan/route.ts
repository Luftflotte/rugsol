import { NextRequest, NextResponse } from "next/server";
import { scanToken, ScanResult } from "@/lib/scoring/engine";
import { addRecentScan } from "@/lib/storage/recent-scans";
import { isValidSolanaAddress } from "@/lib/utils";
import {
  createFingerprint,
  checkScanLimit,
  recordScan,
  getWalletForFingerprint
} from "@/lib/auth/rate-limit";
import { isOwnerWallet, isDevEnvironment } from "@/lib/auth/wallet";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function buildOgQuery(result: ScanResult): string {
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

// In-memory cache (replace with Redis in production)
const scanCache = new Map<string, { result: ScanResult; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

function getCachedResult(address: string): ScanResult | null {
  const cached = scanCache.get(address);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL_MS) {
    scanCache.delete(address);
    return null;
  }

  return cached.result;
}

function setCachedResult(address: string, result: ScanResult): void {
  scanCache.set(address, { result, timestamp: Date.now() });

  // Clean up old cache entries periodically
  if (scanCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of scanCache.entries()) {
      if (now - value.timestamp > CACHE_TTL_MS) {
        scanCache.delete(key);
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Создаём fingerprint пользователя
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";
    const fingerprint = createFingerprint(clientIp, userAgent);

    // Проверяем, есть ли привязанный wallet
    const walletAddress = getWalletForFingerprint(fingerprint);

    // Проверяем, является ли пользователь владельцем (безлимит)
    const isOwner = walletAddress ? isOwnerWallet(walletAddress) : false;

    // В dev режиме — автоматический безлимит
    const isDev = isDevEnvironment();

    // Проверяем лимиты (владельцы, авторизованные пользователи и dev режим имеют безлимит)
    if (!isOwner && !walletAddress && !isDev) {
      const scanLimit = checkScanLimit(fingerprint);

      if (!scanLimit.allowed) {
        return NextResponse.json(
          {
            error: "Scan limit exceeded",
            message: "You have used your free scan. Connect your wallet to continue scanning.",
            needsAuth: true,
          },
          {
            status: 429,
            headers: {
              "X-Scan-Limit": "1",
              "X-Scan-Remaining": "0",
              "X-Needs-Auth": "true",
            },
          }
        );
      }
    }

    // Parse body
    let body: { address?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { address } = body;

    // Validate address
    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'address' field" },
        { status: 400 }
      );
    }

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: "Invalid Solana address" },
        { status: 400 }
      );
    }

    // Run scan
    const result = await scanToken(address);

    // Cache result
    setCachedResult(address, result);

    // Записываем использование скана
    recordScan(fingerprint, walletAddress || undefined);

    // Add to recent scans with OG query for Twitter cards
    const metadata = result.checks.metadata.data;
    addRecentScan({
      address: result.tokenAddress,
      name: metadata?.name || result.whitelistInfo?.name || "Unknown",
      symbol: metadata?.symbol || result.whitelistInfo?.symbol || "???",
      image: metadata?.image || undefined,
      score: result.score,
      grade: result.grade,
      gradeLabel: result.gradeLabel,
      gradeColor: result.gradeColor,
      scannedAt: result.scannedAt.toISOString(),
      createdAt: metadata?.createdAt || undefined,
      ogQuery: buildOgQuery(result),
    });

    // Получаем актуальную информацию о лимитах после скана
    const updatedLimit = checkScanLimit(fingerprint, walletAddress || undefined);

    return NextResponse.json(
      {
        success: true,
        cached: false,
        data: result,
      },
      {
        headers: {
          "X-Scan-Remaining": String(updatedLimit.remaining === Infinity || isDev ? "unlimited" : updatedLimit.remaining),
          "X-Is-Authenticated": String(!!walletAddress),
          "X-Is-Owner": String(isOwner || isDev),
        },
      }
    );
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const address = url.searchParams.get("address");

    // If an address query param is provided, try to return a cached scan
    if (address) {
      if (!isValidSolanaAddress(address)) {
        return NextResponse.json({ error: "Invalid Solana address" }, { status: 400 });
      }

      const cachedResult = getCachedResult(address);
      if (cachedResult) {
        // Bump in recent scans even if cached
        const metadata = cachedResult.checks.metadata.data;
        addRecentScan({
          address: cachedResult.tokenAddress,
          name: metadata?.name || cachedResult.whitelistInfo?.name || "Unknown",
          symbol: metadata?.symbol || cachedResult.whitelistInfo?.symbol || "???",
          image: metadata?.image || undefined,
          score: cachedResult.score,
          grade: cachedResult.grade,
          gradeLabel: cachedResult.gradeLabel,
          gradeColor: cachedResult.gradeColor,
          scannedAt: new Date().toISOString(),
          createdAt: metadata?.createdAt || undefined,
          ogQuery: buildOgQuery(cachedResult),
        });

        return NextResponse.json(
          {
            success: true,
            cached: true,
            data: cachedResult,
          },
          {
            headers: {
              "X-Cache": "HIT",
            },
          }
        );
      }

      // No cached result — return 404 (не тратим скан!)
      // Клиент должен явно запустить POST запрос для нового скана
      return NextResponse.json(
        {
          success: false,
          cached: false,
          notFound: true,
          message: "No cached scan found. Click 'Scan Token' to analyze.",
        },
        {
          status: 404,
          headers: {
            "X-Cache": "MISS",
          },
        }
      );
    }

    // Default health response (no address provided)
    return NextResponse.json({ status: "ok", cacheSize: scanCache.size });
  } catch (error) {
    console.error("Scan GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
