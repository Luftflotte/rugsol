import { PublicKey } from "@solana/web3.js";
import { connection } from "../solana/connection";

export interface TokenAgeInfo {
  createdAt: Date | null;
  ageInDays: number;
  ageInHours: number;
  isNew: boolean; // Less than 24 hours
}

// Known token creation dates (for major tokens that are hard to fetch)
const KNOWN_CREATION_DATES: Record<string, Date> = {
  // USDC - launched November 2020
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": new Date("2020-11-09"),
  // USDT
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": new Date("2020-09-14"),
  // Wrapped SOL
  "So11111111111111111111111111111111111111112": new Date("2020-03-16"),
  // BONK
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": new Date("2022-12-25"),
  // JUP
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": new Date("2024-01-31"),
  // JTO
  "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL": new Date("2023-12-07"),
  // PYTH
  "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3": new Date("2023-11-20"),
  // RAY
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": new Date("2021-02-21"),
  // ORCA
  "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE": new Date("2021-08-09"),
  // mSOL
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": new Date("2021-08-04"),
};

export async function checkTokenAge(
  mintAddress: string,
  pairCreatedAt?: number
): Promise<TokenAgeInfo | null> {
  try {
    // 0. Use DexScreener pair creation date if available (reliable for traded tokens)
    if (pairCreatedAt) {
      return calculateAge(new Date(pairCreatedAt));
    }

    // Check known dates first
    const knownDate = KNOWN_CREATION_DATES[mintAddress];
    if (knownDate) {
      return calculateAge(knownDate);
    }

    // 1. Try Helius DAS (most reliable for indexed tokens)
    const heliusAge = await getAgeFromAccountInfo(mintAddress);
    if (heliusAge) return heliusAge;

    // 2. Try Pump.fun API (accurate for pump tokens)
    if (mintAddress.endsWith("pump")) {
       try {
         const res = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
           headers: { "User-Agent": "RugSolScanner/1.0" }
         });
         if (res.ok) {
           const data = await res.json();
           if (data.created_timestamp) {
             return calculateAge(new Date(data.created_timestamp));
           }
         }
       } catch {}
    }

    const mintPublicKey = new PublicKey(mintAddress);

    // 3. Fallback: Signatures
    // Try to get signatures - for newer tokens this works
    const signatures = await connection.getSignaturesForAddress(
      mintPublicKey,
      { limit: 1000 },
      "confirmed"
    );

    if (!signatures || signatures.length === 0) {
      return null;
    }

    // The last signature in the array is usually the oldest
    const oldestSignature = signatures[signatures.length - 1];
    
    // If we have 1000 signatures, we haven't reached the beginning of history.
    // However, the age of the 1000th transaction gives us a "lower bound".
    // If the 1000th transaction was 2 days ago, the token is AT LEAST 2 days old.
    // This is sufficient to pass the "New Token (<24h)" check.
    
    const oldestTime = oldestSignature.blockTime;
    if (oldestTime) {
      return calculateAge(new Date(oldestTime * 1000));
    }

    return null;
  } catch (error) {
    return null;
  }
}

function calculateAge(createdAt: Date): TokenAgeInfo {
  const now = new Date();
  const ageInMs = now.getTime() - createdAt.getTime();
  const ageInHours = Math.floor(ageInMs / (1000 * 60 * 60));
  const ageInDays = Math.floor(ageInHours / 24);

  return {
    createdAt,
    ageInDays,
    ageInHours,
    isNew: ageInHours < 24,
  };
}

// Fallback: try to get age from Helius DAS API
async function getAgeFromAccountInfo(mintAddress: string): Promise<TokenAgeInfo | null> {
  const heliusApiKey = process.env.HELIUS_API_KEY;
  if (!heliusApiKey) return null;

  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "get-asset",
          method: "getAsset",
          params: { id: mintAddress },
        }),
      }
    );

    const data = await response.json();
    
    if (data.result?.content?.metadata?.created_at) {
      const createdAt = new Date(data.result.content.metadata.created_at);
      return calculateAge(createdAt);
    }

    return null;
  } catch {
    return null;
  }
}
