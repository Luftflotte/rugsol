import { Connection, PublicKey } from "@solana/web3.js";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

if (!HELIUS_API_KEY) {
  console.warn("HELIUS_API_KEY is not set in environment variables");
}

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export const connection = new Connection(HELIUS_RPC_URL, "confirmed");

export interface TokenMintInfo {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  supply: string;
  decimals: number;
}

export async function getTokenMintInfo(
  address: string
): Promise<TokenMintInfo | null> {
  try {
    const mintPublicKey = new PublicKey(address);
    const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);

    if (!accountInfo.value) {
      return null;
    }

    const data = accountInfo.value.data;

    if (!("parsed" in data)) {
      return null;
    }

    const parsedInfo = data.parsed.info;

    return {
      mintAuthority: parsedInfo.mintAuthority ?? null,
      freezeAuthority: parsedInfo.freezeAuthority ?? null,
      supply: parsedInfo.supply,
      decimals: parsedInfo.decimals,
    };
  } catch (error) {
    console.error("Error fetching token mint info:", error);
    return null;
  }
}

export interface TokenContext {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  supply: bigint;
  decimals: number;
}

export async function fetchTokenContext(
  address: string
): Promise<TokenContext | null> {
  try {
    const mintPublicKey = new PublicKey(address);
    const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);

    if (!accountInfo.value || !("parsed" in accountInfo.value.data)) {
      return null;
    }

    const info = accountInfo.value.data.parsed.info;

    return {
      mintAuthority: info.mintAuthority ?? null,
      freezeAuthority: info.freezeAuthority ?? null,
      supply: BigInt(info.supply),
      decimals: info.decimals,
    };
  } catch (error) {
    console.error("Error fetching token context:", error);
    return null;
  }
}
