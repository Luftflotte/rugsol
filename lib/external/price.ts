import { getTokenMintInfo } from "../solana/connection";

export interface TokenPrice {
  priceUsd: number;
  marketCap: number;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  pairCreatedAt?: number;
}

async function calculateMarketCap(mintAddress: string, priceUsd: number): Promise<number> {
  // Special case for native SOL supply (~589M)
  if (mintAddress === "So11111111111111111111111111111111111111111" || 
      mintAddress === "So11111111111111111111111111111111111111112") {
    return priceUsd * 589000000;
  }

  try {
    const mintInfo = await getTokenMintInfo(mintAddress);
    if (!mintInfo) return 0;
    
    const supply = Number(mintInfo.supply);
    const adjustedSupply = supply / Math.pow(10, mintInfo.decimals);
    return priceUsd * adjustedSupply;
  } catch (e) {
    console.warn("Failed to calculate MC manually:", e);
    return 0;
  }
}

interface DexScreenerPair {
  priceUsd: string;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  priceChange?: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
}

export async function getTokenPrice(mintAddress: string): Promise<TokenPrice | null> {
  // Hard override for major stablecoins to prevent "price glitch" from low-liquidity pairs
  const STABLECOINS: Record<string, string> = {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
    "Es9vMFrzaDCSTMdCD8MZAgDQNksFgeBeZcWfbD6Scky": "USDT",
  };

  // Hard override for SOL/wSOL — Jupiter Price API returns 404 for these
  const SOL_ADDRESSES = [
    "So11111111111111111111111111111111111111111",
    "So11111111111111111111111111111111111111112",
  ];

  if (SOL_ADDRESSES.includes(mintAddress)) {
    // Fetch SOL price from DexScreener (wSOL pairs) or CoinGecko as fallback
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      if (response.ok) {
        const data = await response.json();
        const priceUsd = data.solana?.usd || 0;
        if (priceUsd > 0) {
          const marketCap = priceUsd * 589_000_000;
          return {
            priceUsd,
            marketCap,
            liquidity: { usd: 1_000_000_000, base: 0, quote: 0 },
            priceChange: { m5: 0, h1: 0, h6: 0, h24: 0 },
            pairCreatedAt: 0,
          };
        }
      }
    } catch (e) {
      console.warn("CoinGecko SOL price fetch failed:", e);
    }
    // Absolute fallback — return null so the caller handles it
    return null;
  }

  if (STABLECOINS[mintAddress]) {
    const priceUsd = 1.00;
    const marketCap = await calculateMarketCap(mintAddress, priceUsd);
    return {
      priceUsd,
      marketCap,
      liquidity: { usd: 1000000000, base: 0, quote: 0 },
      priceChange: { m5: 0, h1: 0, h6: 0, h24: 0 },
      pairCreatedAt: 0,
    };
  }

  // Map native SOL address (...1) to Wrapped SOL (...2) for price APIs
  const effectiveAddress = mintAddress === "So11111111111111111111111111111111111111111" 
    ? "So11111111111111111111111111111111111111112" 
    : mintAddress;

  // Try Jupiter first (most reliable for Solana)
  const jupPrice = await fetchJupiterPrice(effectiveAddress);
  if (jupPrice && jupPrice.priceUsd > 0) {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${effectiveAddress}`);
      if (response.ok) {
        const data = await response.json();
        const bestPair = data.pairs?.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        if (bestPair) {
          return {
            ...jupPrice,
            marketCap: bestPair.marketCap || bestPair.fdv || jupPrice.marketCap,
            liquidity: {
              usd: bestPair.liquidity?.usd || 0,
              base: bestPair.liquidity?.base || 0,
              quote: bestPair.liquidity?.quote || 0,
            },
            priceChange: bestPair.priceChange || jupPrice.priceChange,
            pairCreatedAt: bestPair.pairCreatedAt,
          };
        }
      }
    } catch (e) {}
    return jupPrice;
  }

  // Fallback to DexScreener
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${effectiveAddress}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    const bestPair = data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    
    // DexScreener token endpoint usually returns the price of the searched token directly
    const priceUsd = parseFloat(bestPair.priceUsd);
    let marketCap = bestPair.fdv || bestPair.marketCap || 0;
    if (marketCap === 0) marketCap = await calculateMarketCap(effectiveAddress, priceUsd);

    return {
      priceUsd,
      marketCap,
      liquidity: {
        usd: bestPair.liquidity?.usd || 0,
        base: bestPair.liquidity?.base || 0,
        quote: bestPair.liquidity?.quote || 0,
      },
      priceChange: bestPair.priceChange || { m5: 0, h1: 0, h6: 0, h24: 0 },
      pairCreatedAt: bestPair.pairCreatedAt,
    };
  } catch (error) {
    return null;
  }
}

export async function fetchJupiterPrice(mintAddress: string): Promise<TokenPrice | null> {
  try {
    const headers: HeadersInit = {
        "Accept": "application/json"
    };
    if (process.env.JUPITER_API_KEY) {
        headers["x-api-key"] = process.env.JUPITER_API_KEY;
    }

    const response = await fetch(`https://api.jup.ag/price/v2?ids=${mintAddress}`, { headers });
    if (!response.ok) {
        console.warn(`Jupiter Price API returned ${response.status}`);
        return null;
    }

    const json = await response.json();
    const data = json.data?.[mintAddress];

    if (!data || !data.price) return null;

    const priceUsd = parseFloat(data.price);
    
    // Jupiter Price API v2 doesn't return MC, so we MUST calculate it
    const marketCap = await calculateMarketCap(mintAddress, priceUsd);

    return {
      priceUsd: priceUsd,
      marketCap: marketCap, 
      liquidity: { usd: 0, base: 0, quote: 0 },
      priceChange: { m5: 0, h1: 0, h6: 0, h24: 0 },
      pairCreatedAt: 0,
    };
  } catch (error) {
    console.warn("Failed to fetch price from Jupiter:", error);
    return null;
  }
}
