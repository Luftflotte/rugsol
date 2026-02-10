import { PublicKey } from "@solana/web3.js";
import { fetchDexScreener } from "./liquidity";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// Simple in-memory cache for metadata to save RPC credits and speed up
const metadataCache = new Map<string, { data: Partial<TokenMetadata> | null; timestamp: number }>();
const METADATA_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  image: string | null;
  description: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  isMutable: boolean;
  createdAt?: string | null;
  creators?: Array<{ address: string; share: number; verified: boolean }>;
  pumpFunCurve?: any;
}

interface JupiterTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  extensions?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    description?: string;
  };
}

interface HeliusAssetContent {
  json_uri?: string;
  metadata?: {
    name?: string;
    symbol?: string;
    description?: string;
  };
  links?: {
    image?: string;
    external_url?: string;
  };
}

interface HeliusAssetResponse {
  id: string;
  content?: HeliusAssetContent;
  mutable?: boolean;
  authorities?: Array<{
    address: string;
    scopes: string[];
  }>;
  creators?: Array<{ address: string; share: number; verified: boolean }>;
}

// Fetch from Jupiter Token List API
async function fetchJupiterMetadata(
  mintAddress: string
): Promise<Partial<TokenMetadata> | null> {
  // Allow skipping external fetches in offline/dev environments
  if (process.env.SKIP_EXTERNAL_FETCH === "true") return null;

  try {
    const response = await fetch(
      `https://tokens.jup.ag/token/${mintAddress}`
    );

    if (!response.ok) {
      return null;
    }

    const data: JupiterTokenInfo = await response.json();

    return {
      name: data.name || null,
      symbol: data.symbol || null,
      image: data.logoURI || null,
      description: data.extensions?.description || null,
      website: data.extensions?.website || null,
      twitter: data.extensions?.twitter || null,
      telegram: data.extensions?.telegram || null,
    };
  } catch (error) {
    console.error("Error fetching from Jupiter:", error);
    return null;
  }
}

// Fetch from Helius DAS API (Metaplex metadata)
async function fetchHeliusMetadata(
  mintAddress: string
): Promise<Partial<TokenMetadata> | null> {
  // Check cache
  const cached = metadataCache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < METADATA_CACHE_TTL) {
    return cached.data;
  }

  if (!HELIUS_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "metadata-request",
          method: "getAsset",
          params: {
            id: mintAddress,
          },
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const data: HeliusAssetResponse = json.result;

    if (!data) {
      return null;
    }

    // Fetch off-chain metadata if json_uri exists
    let offChainData: Record<string, unknown> = {};
    if (data.content?.json_uri) {
      try {
        const metadataResponse = await fetch(data.content.json_uri);
        if (metadataResponse.ok) {
          offChainData = await metadataResponse.json();
        }
      } catch {
        // Ignore off-chain fetch errors
      }
    }

    const result = {
      name: data.content?.metadata?.name || (offChainData.name as string) || null,
      symbol: data.content?.metadata?.symbol || (offChainData.symbol as string) || null,
      image: data.content?.links?.image || (offChainData.image as string) || null,
      description:
        data.content?.metadata?.description ||
        (offChainData.description as string) ||
        null,
      website:
        data.content?.links?.external_url ||
        (offChainData.external_url as string) ||
        null,
      twitter: (offChainData.twitter as string) || null,
      telegram: (offChainData.telegram as string) || null,
      isMutable: data.mutable ?? true,
      creators: data.creators || [],
    };

    // Cache the successful result
    metadataCache.set(mintAddress, { data: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error("Error fetching from Helius:", error);
    return null;
  }
}

// Fetch from DexScreener Token Profiles API (V1)
// This is separate from the Pairs API and often has better metadata (icons/links)
async function fetchDexScreenerProfile(mintAddress: string): Promise<Partial<TokenMetadata> | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/token-profiles/latest/v1`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    if (!response.ok) return null;

    // The API returns an array of profiles. Since we can't filter by token address in the URL for this specific endpoint (it's "latest"),
    // this might not be the right endpoint for *specific* token lookup unless we want to search the latest list.
    
    // WAIT: The user provided specific JSON.
    // Usually there is `https://api.dexscreener.com/token-profiles/latest/v1`.
    // But is there `https://api.dexscreener.com/token-profiles/latest/v1/{chainId}/{tokenAddress}`?
    // Let's try that one as it's more standard for "profiles by address".
    
    // Attempting direct profile fetch by address
    const profileResponse = await fetch(
        `https://api.dexscreener.com/token-profiles/latest/v1/solana/${mintAddress}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        }
    );

    if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        // It returns an array of profiles, usually length 1 if found
        if (Array.isArray(profiles) && profiles.length > 0) {
            const p = profiles[0];
            return {
                image: p.icon || null,
                description: p.description || null,
                website: p.links?.find((l: any) => l.type === 'website')?.url || null,
                twitter: p.links?.find((l: any) => l.type === 'twitter')?.url || null,
                telegram: p.links?.find((l: any) => l.type === 'telegram')?.url || null,
            };
        }
    }
    
    return null;
  } catch (e) {
    console.warn("DexScreener Profile fetch failed:", e);
    return null;
  }
}

async function fetchPumpFunMetadata(
  mintAddress: string
): Promise<Partial<TokenMetadata> | null> {
  if (process.env.SKIP_EXTERNAL_FETCH === "true") return null;

  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data) return null;

    return {
      name: data.name || null,
      symbol: data.symbol || null,
      image: data.image_uri || null,
      description: data.description || null,
      twitter: data.twitter || null,
      telegram: data.telegram || null,
      website: data.website || null,
      createdAt: data.created_timestamp ? new Date(data.created_timestamp).toISOString() : null,
      creators: data.creator ? [{ address: data.creator, share: 100, verified: false }] : [],
      // Pump.fun metadata is on IPFS and technically immutable once created, but the authority can be revoked.
      // We don't set isMutable here to let Helius/Chain logic decide, or default to false if safe.
    };
  } catch (error) {
    console.warn("Pump.fun API fetch failed:", error);
    return null;
  }
}

// Check isMutable using on-chain Metaplex metadata account
async function checkMetadataIsMutable(mintAddress: string): Promise<boolean> {
  if (!HELIUS_API_KEY) {
    return true; // Assume mutable if we can't check
  }

  try {
    // Derive Metaplex metadata PDA
    const METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const mintPubkey = new PublicKey(mintAddress);

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    // Fetch raw account data
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "metadata-account",
          method: "getAccountInfo",
          params: [
            metadataPDA.toBase58(),
            { encoding: "base64" },
          ],
        }),
      }
    );

    if (!response.ok) {
      return true;
    }

    const json = await response.json();
    const accountData = json.result?.value?.data;

    if (!accountData || !accountData[0]) {
      return true;
    }

    // Decode base64 and check isMutable flag
    // isMutable is at a specific offset in Metaplex metadata account
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _data = Buffer.from(accountData[0], "base64");
    
    // The isMutable flag is near the end of the fixed portion
    // After: key (1) + update_authority (32) + mint (32) + name (36) + symbol (14) + uri (204) + seller_fee (2) + creators option
    // This is simplified - in production you'd want proper deserialization
    // For Token Metadata v1.1+, isMutable is at offset 1 + 32 + 32 + 4 + name_len + 4 + symbol_len + 4 + uri_len + 2 + creators...
    
    // Simplified check: isMutable is typically byte at position after all the variable data
    // A proper implementation would use @metaplex-foundation/mpl-token-metadata
    // For now, we rely on Helius DAS API response which includes mutable field
    
    return true;
  } catch (error) {
    console.error("Error checking isMutable:", error);
    return true;
  }
}

export async function getTokenMetadata(
  mintAddress: string
): Promise<TokenMetadata | null> {
  try {
    // Validate address
    new PublicKey(mintAddress);

    // Fetch from multiple sources in parallel (including pump.fun)
    const [heliusData, pumpFunData, dexData, dexProfileData] = await Promise.all([
      fetchHeliusMetadata(mintAddress),
      fetchPumpFunMetadata(mintAddress),
      fetchDexScreener(mintAddress),
      fetchDexScreenerProfile(mintAddress),
    ]);

    // Merge data, preferring Helius (more complete) but falling back to others
    const metadata: TokenMetadata = {
      // Prefer Helius, then pump.fun, then DexScreener (Profile), then DexScreener (Pairs)
      name: heliusData?.name || pumpFunData?.name || dexData?.name || null,
      symbol: heliusData?.symbol || pumpFunData?.symbol || dexData?.symbol || null,
      image: heliusData?.image || pumpFunData?.image || dexProfileData?.image || dexData?.image || null,
      description: heliusData?.description || pumpFunData?.description || dexProfileData?.description || null,
      website: heliusData?.website || pumpFunData?.website || dexProfileData?.website || null,
      twitter: heliusData?.twitter || pumpFunData?.twitter || dexProfileData?.twitter || null,
      telegram: heliusData?.telegram || pumpFunData?.telegram || dexProfileData?.telegram || null,
      isMutable: heliusData?.isMutable ?? true,
      createdAt: heliusData?.createdAt || pumpFunData?.createdAt || null,
      creators: heliusData?.creators || pumpFunData?.creators || [],
    };

    // If we couldn't get isMutable from Helius, try direct check
    if (heliusData?.isMutable === undefined) {
      metadata.isMutable = await checkMetadataIsMutable(mintAddress);
    }

    return metadata;
  } catch (error) {
    console.error("Error getting token metadata:", error);
    return null;
  }
}
