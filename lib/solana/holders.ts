import { PublicKey } from "@solana/web3.js";
import { connection } from "./connection";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// LP Pool program addresses to filter out
const LP_PROGRAM_ADDRESSES = new Set([
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", // Raydium
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", // Orca
]);

export interface HolderInfo {
  address: string;
  owner: string;
  amount: string;
  percent: number;
  isLpPool: boolean;
}

export interface HoldersAnalysis {
  topHolders: HolderInfo[];
  topTenPercent: number;
  largestHolder: {
    address: string;
    percent: number;
  } | null;
  clustersDetected: number;
}

/**
 * Fallback: Use Helius DAS API to get token accounts when getTokenLargestAccounts
 * fails for tokens with too many holders (e.g. USDC with 21M+ accounts).
 */
async function fetchLargestAccountsViaDAS(mintAddress: string) {
  const response = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccounts",
      params: {
        mint: mintAddress,
        limit: 20,
        options: { showZeroBalance: false },
      },
    }),
  });

  const data = await response.json();
  if (!data.result?.token_accounts?.length) {
    return null;
  }

  // Sort by amount descending to get largest holders
  const sorted = data.result.token_accounts.sort(
    (a: any, b: any) => Number(BigInt(b.amount) - BigInt(a.amount))
  );

  return sorted.map((acc: any) => ({
    address: new PublicKey(acc.address),
    amount: acc.amount,
    owner: acc.owner,
  }));
}

export async function analyzeHolders(
  mintAddress: string,
  totalSupply: bigint,
  excludeOwners: string[] = []
): Promise<HoldersAnalysis | null> {
  try {
    const mintPublicKey = new PublicKey(mintAddress);

    if (totalSupply === BigInt(0)) {
      return {
        topHolders: [],
        topTenPercent: 0,
        largestHolder: null,
        clustersDetected: 0,
      };
    }

    // Get top 20 largest accounts
    let largestAccounts;
    let usedDASFallback = false;
    try {
      // getTokenLargestAccounts only works for valid SPL Token mints
      largestAccounts = await connection.getTokenLargestAccounts(mintPublicKey);

      if (!largestAccounts || !largestAccounts.value) {
        throw new Error("No holder data returned from RPC");
      }
    } catch (rpcError: any) {
      const msg = rpcError.message || "";
      // For tokens with too many accounts, fall back to Helius DAS API
      if (msg.includes("Too many accounts") || msg.includes("number of accounts")) {
        console.warn(`Too many holders for ${mintAddress}, falling back to Helius DAS API`);
        try {
          const dasAccounts = await fetchLargestAccountsViaDAS(mintAddress);
          if (dasAccounts && dasAccounts.length > 0) {
            largestAccounts = { value: dasAccounts };
            usedDASFallback = true;
          } else {
            return { topHolders: [], topTenPercent: 0, largestHolder: null, clustersDetected: 0 };
          }
        } catch (dasError) {
          console.warn(`DAS fallback also failed for ${mintAddress}:`, dasError);
          return { topHolders: [], topTenPercent: 0, largestHolder: null, clustersDetected: 0 };
        }
      } else {
        console.warn(`RPC error fetching holders for ${mintAddress}:`, msg || rpcError);
        return { topHolders: [], topTenPercent: 0, largestHolder: null, clustersDetected: 0 };
      }
    }

    const topHolders: HolderInfo[] = [];
    const excludeSet = new Set(excludeOwners);

    if (usedDASFallback) {
      // DAS response already includes owner info, no need for extra RPC calls
      const accountsToProcess = largestAccounts.value.slice(0, 15);
      for (const account of accountsToProcess) {
        const owner = account.owner;
        const amount = account.amount;
        const addressStr = typeof account.address === "string" ? account.address : account.address.toBase58();
        const percent = Number((BigInt(amount) * BigInt(10000)) / totalSupply) / 100;
        const isLpPool = LP_PROGRAM_ADDRESSES.has(owner) || excludeSet.has(owner) || excludeSet.has(addressStr);

        topHolders.push({ address: addressStr, owner, amount, percent, isLpPool });
      }
    } else {
      // Standard path: need to fetch owner info for each account
      const accountsToProcess = largestAccounts.value.slice(0, 15);

      for (const account of accountsToProcess) {
        try {
          const accountInfo = await connection.getParsedAccountInfo(account.address);

          if (!accountInfo.value || !("parsed" in accountInfo.value.data)) {
            continue;
          }

          const info = accountInfo.value.data.parsed.info;
          const owner = info.owner;
          const amount = account.amount;
          const percent = Number((BigInt(amount) * BigInt(10000)) / totalSupply) / 100;

          // Mark as LP Pool if it's in our known list OR if it's an excluded address (like Pump Curve)
          const isLpPool = LP_PROGRAM_ADDRESSES.has(owner) || excludeSet.has(owner) || excludeSet.has(account.address.toBase58());

          topHolders.push({
            address: account.address.toBase58(),
            owner,
            amount,
            percent,
            isLpPool,
          });
        } catch (e) {
          console.warn(`Failed to fetch info for account ${account.address.toBase58()}:`, e);
          continue;
        }
      }
    }

        // For calculations, we exclude LP pools

        const nonLpHolders = topHolders.filter((h) => !h.isLpPool);

    

        // Advanced Cluster Detection: Look for "tight groups"

        // Scammers use scripts to distribute supply across 10-50 wallets with slightly varied balances.

        let clustersDetected = 0;

        const holdersForAnalysis = nonLpHolders.slice(0, 20);

        

        // Group holders into buckets of 0.1% width

        const buckets = new Map<number, number>();

        holdersForAnalysis.forEach(h => {

            if (h.percent < 0.3) return; // Ignore small fish

            const bucketId = Math.floor(h.percent * 10); // 0.1% steps

            buckets.set(bucketId, (buckets.get(bucketId) || 0) + 1);

        });

    

        for (const count of buckets.values()) {

            if (count >= 5) { // 5+ wallets in a 0.1% range is extremely unnatural

                clustersDetected += count;

            }

        }

    

        // Also check for "Linear Distribution" (e.g. 0.99, 0.98, 0.97...)

        // If top 10 holders are all within a 0.5% total range

        if (holdersForAnalysis.length >= 10) {

            const p1 = holdersForAnalysis[0].percent;

            const p10 = holdersForAnalysis[9].percent;

            if (p1 - p10 < 0.2 && p1 > 0.5) {

                // If the difference between 1st and 10th holder is less than 0.2%

                // and they aren't just tiny wallets, this is a massive cluster.

                clustersDetected = Math.max(clustersDetected, 10);

            }

        }

    

        // Calculate top 10 percentage (excluding LP pools)
    const topTenPercent = nonLpHolders
      .slice(0, 10)
      .reduce((sum, holder) => sum + holder.percent, 0);

    // Find largest non-LP holder
    const largestHolder =
      nonLpHolders.length > 0
        ? {
            address: nonLpHolders[0].owner,
            percent: nonLpHolders[0].percent,
          }
        : null;

    return {
      topHolders,
      topTenPercent: Math.round(topTenPercent * 100) / 100,
      largestHolder,
      clustersDetected,
    };
  } catch (error) {
    console.error("Error analyzing holders:", error);
    return null;
  }
}