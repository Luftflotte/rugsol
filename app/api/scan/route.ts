import { NextRequest, NextResponse } from "next/server";
import { scanToken, ScanResult } from "@/lib/scoring/engine";
import { addRecentScan } from "@/lib/storage/recent-scans";
import { isValidSolanaAddress } from "@/lib/utils";

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

// Rate limiting (replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

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

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  // Cleanup if map gets too large to prevent memory leaks
  if (rateLimitMap.size > 5000) {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetIn: record.resetTime - now };
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
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
          },
        }
      );
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

    // Cache result (Keep disabled for now, but ensure recent scan is added)
    setCachedResult(address, result);

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

    return NextResponse.json(
      {
        success: true,
        cached: false,
        data: result,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
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

      // No cached result — run a fresh scan. For server-side/GET callers we skip the rate-limit
      try {
        const result = await scanToken(address);
        setCachedResult(address, result);

        // Add to recent scans
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

        return NextResponse.json({ success: true, cached: false, data: result }, { headers: { "X-Cache": "MISS" } });
      } catch (e) {
        console.error("Scan API GET error:", e);
        return NextResponse.json({ error: "Scan failed", message: e instanceof Error ? e.message : String(e) }, { status: 500 });
      }
    }

    // Default health response (no address provided)
    return NextResponse.json({ status: "ok", cacheSize: scanCache.size, rateLimitEntries: rateLimitMap.size });
  } catch (error) {
    console.error("Scan GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
