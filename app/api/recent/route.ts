import { NextRequest, NextResponse } from "next/server";
import { getRecentScans } from "@/lib/storage/recent-scans";

export const dynamic = "force-dynamic"; // Disable caching to ensure new scans appear immediately

interface DexScreenerTokenResponse {
  pairs?: Array<{
    baseToken: {
      address: string;
    };
    priceUsd?: string;
    volume?: {
      h24?: number;
    };
  }>;
}

// In-memory cache for prices
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes - DexScreener обновляется часто

async function fetchTokenPrices(addresses: string[]): Promise<Map<string, number>> {
  if (addresses.length === 0) return new Map();
  
  const prices = new Map<string, number>();
  const addressesToFetch: string[] = [];
  
  // Check cache first
  addresses.forEach(address => {
    const cached = priceCache.get(address.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      prices.set(address.toLowerCase(), cached.price);
    } else {
      addressesToFetch.push(address);
    }
  });
  
  if (addressesToFetch.length === 0) {
    return prices;
  }
  
  try {
    // DexScreener API - free, public, no rate limits mentioned
    // Can fetch up to 30 tokens per request
    const batch = addressesToFetch.slice(0, 10);
    const addressesParam = batch.join(",");
    
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addressesParam}`,
      { 
        next: { revalidate: 120 }, // Cache for 2 minutes
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      console.error("Failed to fetch prices from DexScreener:", response.status);
      return prices;
    }
    
    const data: DexScreenerTokenResponse = await response.json();
    
    if (data.pairs && Array.isArray(data.pairs)) {
      // Group pairs by token address and pick the one with highest volume
      const tokenPrices = new Map<string, { price: number; volume: number }>();
      
      data.pairs.forEach(pair => {
        if (pair.baseToken?.address && pair.priceUsd) {
          const address = pair.baseToken.address.toLowerCase();
          const price = parseFloat(pair.priceUsd);
          const volume = pair.volume?.h24 || 0;
          
          // Keep the price from pair with highest volume
          const existing = tokenPrices.get(address);
          if (!existing || volume > existing.volume) {
            tokenPrices.set(address, { price, volume });
          }
        }
      });
      
      // Update cache and prices map
      tokenPrices.forEach((info, address) => {
        prices.set(address, info.price);
        priceCache.set(address, { price: info.price, timestamp: Date.now() });
      });
    }
    
    return prices;
  } catch (error) {
    console.error("Error fetching prices from DexScreener:", error);
    return prices;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const recentScans = getRecentScans(Math.min(limit, 50)) || [];
    if (!Array.isArray(recentScans)) {
      return NextResponse.json({ success: false, error: "Internal error: recentScans is not an array" }, { status: 500 });
    }
    // Fetch prices for all tokens
    const addresses = recentScans.map(scan => scan.address);
    let prices = new Map();
    try {
      prices = await fetchTokenPrices(addresses);
    } catch (e) {
      // Логируем, но не падаем
      console.error("fetchTokenPrices error", e);
    }
    // Add prices to scans
    const scansWithPrices = recentScans.map(scan => ({
      ...scan,
      price: prices.get(scan.address?.toLowerCase?.()) || null,
    }));
    return NextResponse.json({
      success: true,
      data: scansWithPrices,
      count: scansWithPrices.length,
    });
  } catch (e) {
    console.error("/api/recent error", e);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
