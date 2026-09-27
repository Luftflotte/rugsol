import { PublicKey } from "@solana/web3.js";
import { connection } from "../solana/connection";
import { fetchJupiterPrice } from "./price";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

// Burn addresses for LP tokens
const BURN_ADDRESSES = new Set([
  "1111111111111111111111111111111111", // System burn address
  "1nc1nerator11111111111111111111111111111111", // Incinerator
]);

export interface LiquidityInfo {
  lpSizeUsd: number;
  lpLocked: boolean;
  lpBurned: boolean;
  lockDuration: string | null;
  dexName: string | null;
  pairAddress: string | null;
  liquidityDisplay?: string;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    symbol: string;
    name?: string; // Add name property
  };
  liquidity?: {
    usd: number;
  };
  info?: {
    imageUrl?: string;
    socials?: Array<{ type: string; url: string }>;
  };
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

interface BirdeyeSecurityData {
  isToken2022?: boolean;
  ownerAddress?: string;
  freezeAuthority?: string | null;
  mintAuthority?: string | null;
}

interface BirdeyeResponse {
  success: boolean;
  data?: BirdeyeSecurityData;
}

// Fetch from DexScreener (free, no API key needed)
export async function fetchDexScreener(mintAddress: string): Promise<{
  lpSizeUsd: number;
  dexName: string | null;
  dexId: string | null;
  pairAddress: string | null;
  name?: string;
  symbol?: string;
  image?: string;
  priceUsd: number;
} | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    if (!response.ok) {
      console.warn(`DexScreener fetch failed for ${mintAddress}: ${response.status}`);
      return null;
    }

    const data: DexScreenerResponse = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    // Find Solana pairs and get highest liquidity one
    const solanaPairs = data.pairs.filter((p) => p.chainId === "solana");
    if (solanaPairs.length === 0) {
      return null;
    }

    // Sort by liquidity USD descending
    solanaPairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    const topPair = solanaPairs[0];

    // Normalize DEX name
    let dexName = topPair.dexId;
    if (dexName === "pump" || dexName === "pumpswap") {
      dexName = "Pump.fun";
    } else if (dexName === "raydium") {
      dexName = "Raydium";
    } else if (dexName === "orca") {
      dexName = "Orca";
    } else if (dexName === "meteora") {
      dexName = "Meteora";
    }

    // Use price from the pair if available, explicitly handle string/number conversion if needed (API usually returns string)
    const priceUsd = Number((topPair as any).priceUsd || 0);

    return {
      lpSizeUsd: topPair.liquidity?.usd || 0,
      dexName,
      dexId: topPair.dexId,
      pairAddress: topPair.pairAddress,
      name: topPair.baseToken.name,
      symbol: topPair.baseToken.symbol,
      image: topPair.info?.imageUrl,
      priceUsd,
    };
  } catch (error) {
    console.error("Error fetching from DexScreener:", error);
    return null;
  }
}

// Check if LP tokens are burned by checking holder distribution
async function checkLpBurned(pairAddress: string): Promise<boolean> {
  try {
    const pairPublicKey = new PublicKey(pairAddress);
    
    // Check if it's a valid token mint account first
    const accountInfo = await connection.getParsedAccountInfo(pairPublicKey);
    if (!accountInfo.value || !("parsed" in accountInfo.value.data) || accountInfo.value.data.parsed.type !== "mint") {
      // Not a token mint (likely a pool address), skip holder check to avoid RPC error
      return false;
    }

    const largestAccounts = await connection.getTokenLargestAccounts(pairPublicKey);

    for (const account of largestAccounts.value) {
      const accountInfo = await connection.getParsedAccountInfo(account.address);

      if (!accountInfo.value || !("parsed" in accountInfo.value.data)) {
        continue;
      }

      const owner = accountInfo.value.data.parsed.info.owner;

      // Check if owner is burn address
      if (BURN_ADDRESSES.has(owner)) {
        // Check if this burn address holds significant portion (>90%)
        const totalSupply = await getLpTotalSupply(pairAddress);
        if (BigInt(totalSupply) > BigInt(0)) {
          const burnedAmount = BigInt(account.amount);
          const burnedPercent = Number((burnedAmount * BigInt(100)) / BigInt(totalSupply));
          if (burnedPercent > 90) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking LP burned status:", error);
    return false;
  }
}

async function getLpTotalSupply(pairAddress: string): Promise<string> {
  try {
    const pairPublicKey = new PublicKey(pairAddress);
    const mintInfo = await connection.getParsedAccountInfo(pairPublicKey);

    if (!mintInfo.value || !("parsed" in mintInfo.value.data)) {
      return "0";
    }

    return mintInfo.value.data.parsed.info.supply || "0";
  } catch {
    return "0";
  }
}

// Fetch security info from Birdeye (requires API key)
async function fetchBirdeyeSecurity(mintAddress: string): Promise<BirdeyeSecurityData | null> {
  if (!BIRDEYE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_security?address=${mintAddress}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: BirdeyeResponse = await response.json();
    return data.success ? data.data || null : null;
  } catch (error) {
    console.error("Error fetching from Birdeye:", error);
    return null;
  }
}

// Fetch liquidity from Birdeye
async function fetchBirdeyeLiquidity(mintAddress: string): Promise<number> {
  if (!BIRDEYE_API_KEY) return 0;

  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/v3/token/market-data?address=${mintAddress}`,
      {
        headers: { 
            "X-API-KEY": BIRDEYE_API_KEY,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      }
    );

    if (!response.ok) return 0;

    const json = await response.json();
    return json.success ? json.data?.liquidity || 0 : 0;
  } catch (error) {
    console.error("Error fetching Birdeye liquidity:", error);
    return 0;
  }
}

// Fallback: Check Pump.fun API directly
async function fetchPumpFunMarketCap(mintAddress: string): Promise<number> {
    try {
        const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        if (!response.ok) return 0;
        const data = await response.json();
        return data?.market_cap || 0;
    } catch {
        return 0;
    }
}

// Check if token has graduated from Pump.fun to DEX and fetch DEX liquidity
async function checkGraduatedPumpToken(mintAddress: string): Promise<{
  lpSizeUsd: number;
  dexName: string | null;
  dexId: string | null;
  pairAddress: string | null;
} | null> {
    try {
        // Retry DexScreener with exponential backoff for newly graduated tokens
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            }
        );

        if (!response.ok) return null;

        const data: DexScreenerResponse = await response.json();

        if (!data.pairs || data.pairs.length === 0) return null;

        // Find ALL Solana pairs (not just Pump.fun)
        const solanaPairs = data.pairs.filter((p) => p.chainId === "solana");
        if (solanaPairs.length === 0) return null;

        // Sort by liquidity USD descending and pick the highest
        solanaPairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
        const topPair = solanaPairs[0];

        // Normalize DEX name
        let dexName = topPair.dexId;
        if (dexName === "pump" || dexName === "pumpswap") {
            dexName = "Pump.fun";
        } else if (dexName === "raydium") {
            dexName = "Raydium";
        } else if (dexName === "orca") {
            dexName = "Orca";
        } else if (dexName === "meteora") {
            dexName = "Meteora";
        }

        const lpSize = topPair.liquidity?.usd || 0;

        // Only return if we found significant liquidity or DEX is not Pump.fun
        if (lpSize > 0 || (dexName && dexName !== "Pump.fun")) {
            console.log(`[Liquidity] Graduated token found on ${dexName}: $${lpSize}`);
            return {
                lpSizeUsd: lpSize,
                dexName,
                dexId: topPair.dexId,
                pairAddress: topPair.pairAddress,
            };
        }

        return null;
    } catch (error) {
        console.error("Error checking graduated Pump token:", error);
        return null;
    }
}

// Fallback: Check Jupiter Token Search API for liquidity
async function fetchJupiterLiquidity(mintAddress: string): Promise<number> {
    if (!process.env.JUPITER_API_KEY) return 0;

    try {
        const response = await fetch(
            `https://api.jup.ag/tokens/v2/search?query=${mintAddress}`,
            {
                headers: { 
                    "x-api-key": process.env.JUPITER_API_KEY,
                    "Accept": "application/json"
                },
            }
        );

        if (!response.ok) return 0;

        const data = await response.json();
        // The API returns an array of tokens matching the query.
        // We expect the first match to be our token if address was used as query.
        if (Array.isArray(data) && data.length > 0) {
            // Find the exact match just in case
            const token = data.find((t: any) => t.address === mintAddress) || data[0];
            return token.liquidity || 0; // "daily_volume" or "liquidity" - user said "liquidity"
        }
        return 0;
    } catch (error) {
        console.error("Error fetching Jupiter liquidity:", error);
        return 0;
    }
}

// Fallback: Check Raydium AMM via RPC (Helius)
// This uses pure RPC calls to find if a pool exists, bypassing API limits.
async function findRaydiumPoolViaRPC(mintAddress: string): Promise<boolean> {
    try {
        const mint = new PublicKey(mintAddress);
        
        // Strategy: Check if any of the top 20 holders are DEX vaults
        // This is much lighter on RPC than getProgramAccounts
        const largestAccounts = await connection.getTokenLargestAccounts(mint);
        
        if (!largestAccounts.value || largestAccounts.value.length === 0) return false;

        // Known DEX Program IDs / Authorities that hold tokens
        const KNOWN_DEX_OWNERS = new Set([
            "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", // Raydium Authority V4
            "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", // Raydium V4 Program
            "CPMMOO8L3FXFWJLTR2E2j15fXW4g1peYjF8zL3fE53H",  // Raydium CPMM
            "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", // Meteora DLMM
            "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", // Orca Whirlpool
            "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP", // Orca V2
            "CAMMCzo5YL8w4VFF8ESWg8KS2uBlAMFHKq4zzMoERHvi", // Raydium CLMM
        ]);

        for (const account of largestAccounts.value) {
            // We need to fetch the account info to see the owner
            const info = await connection.getParsedAccountInfo(account.address);
            if (info.value && "parsed" in info.value.data) {
                const owner = info.value.data.parsed.info.owner;
                if (KNOWN_DEX_OWNERS.has(owner)) {
                    console.log(`[Liquidity] Found DEX holder: ${owner}`);
                    return true;
                }
            }
        }

        return false;

    } catch (e) {
        console.error("RPC Raydium check failed:", e);
        return false;
    }
}

export async function checkLiquidity(
  mintAddress: string,
  prefetchedDexData?: {
    lpSizeUsd: number;
    dexName: string | null;
    dexId?: string | null;
    pairAddress: string | null;
    name?: string;
    symbol?: string;
    image?: string;
    priceUsd: number;
  } | null
): Promise<LiquidityInfo | null> {
  try {
    let liquidityUsd = 0;
    let dexName: string | null = null;
    let pairAddress: string | null = null;
    let rawDexId: string | null = null;

    // Step 1: Try DexScreener
    const dexData = prefetchedDexData ?? await fetchDexScreener(mintAddress);

    if (dexData) {
      liquidityUsd = dexData.lpSizeUsd;
      dexName = dexData.dexName;
      pairAddress = dexData.pairAddress;
      rawDexId = dexData.dexId || null;

      // Sanity Check 1: If DexScreener has price but 0 liquidity, flag as Unknown (-1)
      if (liquidityUsd === 0 && dexData.priceUsd > 0) {
        console.log(`[Liquidity] DexScreener has price ($${dexData.priceUsd}) but 0 liquidity. Marking as Unknown.`);
        liquidityUsd = -1;
      }
    } else {
        console.log(`[Liquidity] DexScreener returned null for ${mintAddress}`);
    }

    // Step 2: Fallback to Birdeye if Liquidity is 0
    if (liquidityUsd === 0) {
      const birdeyeLiq = await fetchBirdeyeLiquidity(mintAddress);
      if (birdeyeLiq > 0) {
        liquidityUsd = birdeyeLiq;
        dexName = dexName || "Birdeye"; // Indicate source if unknown
        console.log(`[Liquidity] Found via Birdeye: $${liquidityUsd}`);
      }
    }

    // Step 3: Sanity Check with Jupiter Price AND Liquidity Search
    // If we still have $0 liquidity but Jupiter has a price, it's likely valid but we missed the pool.
    // Return -1 to indicate "Unknown/Hidden Liquidity"
    if (liquidityUsd === 0) {
        // Try precise liquidity search first
        const jupLiq = await fetchJupiterLiquidity(mintAddress);
        if (jupLiq > 0) {
            liquidityUsd = jupLiq;
            dexName = "Jupiter Swap";
            console.log(`[Liquidity] Found via Jupiter Search: $${liquidityUsd}`);
        } else {
            // Fallback to price check
            const jupPrice = await fetchJupiterPrice(mintAddress);
            if (jupPrice && jupPrice.priceUsd > 0) {
                liquidityUsd = -1; // Special flag for "Unknown"
                dexName = dexName || "Jupiter";
                console.log(`[Liquidity] Found Jupiter price ($${jupPrice.priceUsd}) but 0 liquidity. Marking as Unknown.`);
            } else {
                console.log(`[Liquidity] No Jupiter price found.`);
            }
        }
    }

    // Step 4: Graduated Pump.fun Token Check (Special Handling)
    // If we have 0 liquidity but the address suggests it's a Pump token,
    // check if it has graduated to DEX
    if (liquidityUsd === 0 && mintAddress.toLowerCase().endsWith("pump")) {
        const graduatedData = await checkGraduatedPumpToken(mintAddress);
        if (graduatedData && graduatedData.lpSizeUsd > 0) {
            liquidityUsd = graduatedData.lpSizeUsd;
            dexName = graduatedData.dexName;
            pairAddress = graduatedData.pairAddress;
            rawDexId = graduatedData.dexId;
            console.log(`[Liquidity] Graduated Pump token found on ${dexName}: $${liquidityUsd}`);
        }
    }

    // Step 5: Fallback to Pump.fun API (Last Resort)
    // If even Jupiter fails, check if Pump.fun API reports a market cap.
    if (liquidityUsd === 0) {
        const pumpMC = await fetchPumpFunMarketCap(mintAddress);
        if (pumpMC > 5000) { // If MC > $5k, assume it's valid
            liquidityUsd = -1;
            dexName = dexName || "Pump.fun API";
            console.log(`[Liquidity] Found via Pump.fun API MC: $${pumpMC}. Marking as Unknown.`);
        }
    }

    // Step 6: Nuclear Option - Check Raydium via RPC (Helius)
    // If all APIs are blocked/failing, check on-chain directly.
    if (liquidityUsd === 0) {
        const hasRaydiumPool = await findRaydiumPoolViaRPC(mintAddress);
        if (hasRaydiumPool) {
            liquidityUsd = -1;
            dexName = "Raydium (RPC)";
            console.log(`[Liquidity] Found Raydium pool via RPC. Marking as Unknown.`);
        }
    }

    // Check if LP is burned
    let lpBurned = false;

    // PumpSwap pools always have LP burned — pump.fun graduation process burns LP tokens
    if (rawDexId === "pump" || rawDexId === "pumpswap") {
      lpBurned = true;
      console.log(`[Liquidity] PumpSwap detected (dexId: ${rawDexId}). LP is burned by protocol.`);
    } else if (pairAddress) {
      lpBurned = await checkLpBurned(pairAddress);
    }

    // Try to get additional security info from Birdeye
    await fetchBirdeyeSecurity(mintAddress);

    return {
      lpSizeUsd: liquidityUsd,
      lpLocked: lpBurned, // If burned, it's effectively locked forever
      lpBurned,
      lockDuration: lpBurned ? "Forever (Burned)" : null,
      dexName,
      pairAddress,
    };
  } catch (error) {
    console.error("Error checking liquidity:", error);
    return null;
  }
}