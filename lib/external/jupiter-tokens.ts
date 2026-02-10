/**
 * Jupiter Verified Token List
 * Automatically fetches and caches verified tokens from Jupiter
 */

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  daily_volume?: number;
}

// Cache for verified tokens
let verifiedTokensCache: Map<string, JupiterToken> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch verified tokens from Jupiter
 */
export async function fetchVerifiedTokens(): Promise<Map<string, JupiterToken>> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (verifiedTokensCache && now - cacheTimestamp < CACHE_TTL) {
    return verifiedTokensCache;
  }

  try {
    // Jupiter strict list - only verified tokens
    const response = await fetch("https://token.jup.ag/strict", {
      headers: { "Accept": "application/json" },
      next: { revalidate: 1800 }, // Cache for 30 min
    });

    if (!response.ok) {
      console.error("Failed to fetch Jupiter token list:", response.status);
      return verifiedTokensCache || new Map();
    }

    const tokens: JupiterToken[] = await response.json();
    
    // Build map for fast lookup
    const tokenMap = new Map<string, JupiterToken>();
    for (const token of tokens) {
      tokenMap.set(token.address, token);
    }

    verifiedTokensCache = tokenMap;
    cacheTimestamp = now;
    
    console.log(`Loaded ${tokenMap.size} verified tokens from Jupiter`);
    return tokenMap;
  } catch (error) {
    // Silently fail or log as debug info to avoid console clutter
    // console.debug("Jupiter token list unavailable:", error);
    return verifiedTokensCache || new Map();
  }
}

/**
 * Check if a token is verified on Jupiter
 */
export async function isJupiterVerified(address: string): Promise<boolean> {
  const tokens = await fetchVerifiedTokens();
  return tokens.has(address);
}

/**
 * Get verified token info from Jupiter
 */
export async function getJupiterTokenInfo(address: string): Promise<JupiterToken | null> {
  const tokens = await fetchVerifiedTokens();
  return tokens.get(address) || null;
}

/**
 * Determine token type based on Jupiter tags and other heuristics
 */
export function getTokenType(token: JupiterToken): "stablecoin" | "wrapped" | "major" | "defi" | "meme" | "unknown" {
  const tags = token.tags || [];
  const name = token.name.toLowerCase();
  const symbol = token.symbol.toLowerCase();

  // Stablecoins
  if (tags.includes("stablecoin") || 
      symbol.includes("usd") || 
      symbol.includes("usdt") || 
      symbol.includes("usdc") ||
      symbol.includes("dai")) {
    return "stablecoin";
  }

  // Wrapped tokens
  if (tags.includes("wrapped") || name.includes("wrapped") || symbol.startsWith("w")) {
    return "wrapped";
  }

  // LST (Liquid Staking Tokens)
  if (tags.includes("lst") || name.includes("staked sol") || symbol.includes("sol")) {
    return "defi";
  }

  // Meme tokens (usually have high volume but simple names)
  if (tags.includes("meme") || tags.includes("community")) {
    return "meme";
  }

  // DeFi tokens
  if (tags.includes("defi") || tags.includes("governance")) {
    return "defi";
  }

  // If it has significant daily volume, it's likely major
  if (token.daily_volume && token.daily_volume > 1000000) {
    return "major";
  }

  return "unknown";
}
