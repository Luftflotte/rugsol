/**
 * Whitelist of known legitimate tokens that should not be penalized
 * for having mint/freeze authority or other "risky" characteristics
 */

export interface WhitelistedToken {
  address: string;
  name: string;
  symbol: string;
  type: "stablecoin" | "wrapped" | "major" | "defi";
  image?: string;
  // Skip these checks for whitelisted tokens
  skipChecks: {
    mintAuthority?: boolean;
    freezeAuthority?: boolean;
    holders?: boolean;
    age?: boolean;
    liquidity?: boolean;
    metadata?: boolean;
  };
  // Override score (optional)
  minScore?: number;
}

export const WHITELISTED_TOKENS: WhitelistedToken[] = [
  // Stablecoins
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USD Coin",
    symbol: "USDC",
    type: "stablecoin",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    skipChecks: { mintAuthority: true, freezeAuthority: true, age: true, liquidity: true, metadata: true },
    minScore: 95,
  },
  {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    name: "USDT",
    symbol: "USDT",
    type: "stablecoin",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
    skipChecks: { mintAuthority: true, freezeAuthority: true, age: true, liquidity: true, metadata: true },
    minScore: 90,
  },
  
  // Wrapped SOL
  {
    address: "So11111111111111111111111111111111111111112",
    name: "Wrapped SOL",
    symbol: "SOL",
    type: "wrapped",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    skipChecks: { mintAuthority: true, freezeAuthority: true, holders: true, age: true, liquidity: true, metadata: true },
    minScore: 100,
  },
  {
    address: "So11111111111111111111111111111111111111111",
    name: "Solana",
    symbol: "SOL",
    type: "wrapped",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    skipChecks: { mintAuthority: true, freezeAuthority: true, holders: true, age: true, liquidity: true, metadata: true },
    minScore: 100,
  },
  
  // Solana Mobile
  {
    address: "SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3",
    name: "Seeker",
    symbol: "SKR",
    type: "major",
    skipChecks: { mintAuthority: true, freezeAuthority: true, holders: true, age: true, liquidity: true, metadata: true },
    minScore: 85,
  },
  
  // Major tokens
  {
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    name: "Jupiter",
    symbol: "JUP",
    type: "major",
    skipChecks: { age: true },
    minScore: 85,
  },
  {
    address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    name: "Jito",
    symbol: "JTO",
    type: "major",
    skipChecks: { age: true },
    minScore: 85,
  },
  {
    address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    name: "Orca",
    symbol: "ORCA",
    type: "defi",
    skipChecks: { age: true },
    minScore: 85,
  },
  {
    address: "RaszyivZBGpvFmKWRqpvH6ijgP5xeyTZReKrPy4dTKi",
    name: "Raydium",
    symbol: "RAY",
    type: "defi",
    skipChecks: { age: true },
    minScore: 85,
  },
  {
    address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    name: "Marinade Staked SOL",
    symbol: "mSOL",
    type: "defi",
    skipChecks: { mintAuthority: true, age: true },
    minScore: 90,
  },
  {
    address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
    name: "Lido Staked SOL",
    symbol: "stSOL",
    type: "defi",
    skipChecks: { mintAuthority: true, age: true },
    minScore: 90,
  },
  {
    address: "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
    name: "BlazeStake Staked SOL",
    symbol: "bSOL",
    type: "defi",
    skipChecks: { mintAuthority: true, age: true },
    minScore: 85,
  },
  {
    address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    name: "Pyth Network",
    symbol: "PYTH",
    type: "major",
    skipChecks: { age: true },
    minScore: 85,
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Bonk",
    symbol: "BONK",
    type: "major",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    skipChecks: { age: true, metadata: true, liquidity: true },
    minScore: 85,
  },
  {
    address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
    name: "Wen",
    symbol: "WEN",
    type: "major",
    skipChecks: { age: true },
    minScore: 70,
  },
];

// Quick lookup map
export const WHITELIST_MAP = new Map<string, WhitelistedToken>(
  WHITELISTED_TOKENS.map(token => [token.address, token])
);

export function isWhitelisted(address: string): boolean {
  return WHITELIST_MAP.has(address);
}

export function getWhitelistedToken(address: string): WhitelistedToken | undefined {
  return WHITELIST_MAP.get(address);
}
