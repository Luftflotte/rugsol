import { getTokenPrice, TokenPrice } from "../external/price";
import { checkSellSimulation, HoneypotCheckResult } from "../external/jupiter-swap";
import {
  checkMintAuthority,
  checkFreezeAuthority,
  AuthorityCheckResult,
} from "../solana/authority";
import { analyzeHolders, HoldersAnalysis } from "../solana/holders";
import { checkLiquidity, LiquidityInfo, fetchDexScreener } from "../external/liquidity";
import { getTokenMetadata, TokenMetadata } from "../external/metadata";
import getPumpFunCurveState, { PumpFunCurveState } from "../solana/pumpfun";
import { checkTokenAge, TokenAgeInfo } from "../solana/tokenAge";
import { getWhitelistedToken, WhitelistedToken } from "./whitelist";
import { getJupiterTokenInfo, getTokenType } from "../external/jupiter-tokens";
import { connection, fetchTokenContext, TokenContext } from "../solana/connection";
import { PublicKey } from "@solana/web3.js";
import { GRADES, Grade } from "./constants";

// --- Configuration ---

export type ScanMode = "pump" | "dex";

// --- Interfaces ---

export interface CheckResult<T> {
  status: "success" | "error" | "unknown";
  data: T | null;
  error?: string;
}

export interface PenaltyDetail {
  category: string;
  reason: string;
  points: number;
  isCritical?: boolean;
}

export interface AdvancedSecurityData {
  devAddress?: string;
  devBalancePercent?: number;
  devSoldPercent?: number;
  isDevSoldOut?: boolean;
  // Snipers & Bundles
  sniperCount?: number; 
  sniperSupplyPercent?: number;
  snipers?: string[]; // List of sniper addresses
  isBundled?: boolean; // Jito bundle detected
  bundleTxCount?: number;
  linkedWallets?: {
    clusterCount: number; // How many clusters found
    totalInClusters: number; // Total wallets involved
  };
  linkedWalletMap?: Record<string, string>; // address -> clusterId
}

export interface ScanResult {
  tokenAddress: string;
  scanMode: ScanMode;
  score: number;
  grade: Grade;
  gradeColor: string;
  gradeLabel: string;
  penalties: PenaltyDetail[];
  totalPenalties: number;
  checks: {
    mintAuthority: CheckResult<AuthorityCheckResult>;
    freezeAuthority: CheckResult<AuthorityCheckResult>;
    holders: CheckResult<HoldersAnalysis>;
    liquidity: CheckResult<LiquidityInfo>;
    metadata: CheckResult<TokenMetadata>;
    tokenAge: CheckResult<TokenAgeInfo>;
    honeypot: CheckResult<HoneypotCheckResult>;
    advanced?: CheckResult<AdvancedSecurityData>;
  };
  scannedAt: Date;
  isWhitelisted?: boolean;
  whitelistInfo?: { name: string; symbol: string; type: string; };
  price?: TokenPrice | null;
  solPrice?: number | null;
  bondingCurveData?: PumpFunCurveState | null;
}

// --- Helpers ---

async function safeCheck<T>(checkFn: () => Promise<T | null>, checkName: string): Promise<CheckResult<T>> {
  try {
    const result = await checkFn();
    return { status: result === null ? "unknown" : "success", data: result };
  } catch (error) {
    console.error(`Error in ${checkName}:`, error);
    return { status: "error", data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function getGrade(score: number, hasCriticalFail: boolean): { grade: Grade; color: string; label: string } {
  if (hasCriticalFail) return { grade: "F", ...GRADES.F };

  if (score >= GRADES.A.min) return { grade: "A", ...GRADES.A };
  if (score >= GRADES.B.min) return { grade: "B", ...GRADES.B };
  if (score >= GRADES.C.min) return { grade: "C", ...GRADES.C };
  if (score >= GRADES.D.min) return { grade: "D", ...GRADES.D };
  return { grade: "F", ...GRADES.F };
}

// --- Analysis Helpers ---

function analyzeDevWallet(
  metadata: TokenMetadata | null,
  holders: HoldersAnalysis | null
): AdvancedSecurityData {
  if (!metadata?.creators || metadata.creators.length === 0 || !holders) {
    return {};
  }

  // Assuming the first creator is the dev/deployer
  const devAddress = metadata.creators[0].address;
  
  // Find dev in holders
  const devHolder = holders.topHolders.find(h => h.owner === devAddress);
  const devBalancePercent = devHolder ? devHolder.percent : 0;

  // Heuristic: If dev holds < 1% and is not the mint authority (handled elsewhere), likely sold
  // For Pump.fun: Dev usually buys ~5-10% initially. If they have < 1%, they dumped.
  const isDevSoldOut = devBalancePercent < 1;

  return {
    devAddress,
    devBalancePercent,
    isDevSoldOut
  };
}

// --- Mode Detection ---

type DexData = {
  lpSizeUsd: number;
  dexName: string | null;
  pairAddress: string | null;
  name?: string;
  symbol?: string;
  image?: string;
  priceUsd: number;
} | null;

async function detectTokenMode(
  tokenAddress: string,
  pumpState: PumpFunCurveState | null,
  context: TokenContext | null,
  isWhitelisted: boolean = false
): Promise<{ mode: ScanMode; dexData: DexData }> {
  // Hard override: Whitelisted tokens or wSOL are never Pump.fun tokens
  const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";
  if (isWhitelisted || tokenAddress === WSOL_ADDRESS) {
    return { mode: "dex", dexData: null };
  }

  // Method 0: Mint Authority Check (Ultimate Source of Truth)
  // If the Mint Authority is the Bonding Curve PDA, the token is 100% on the curve.
  try {
    const mintPk = new PublicKey(tokenAddress);
    const PUMP_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
    const [bondingCurvePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding-curve"), mintPk.toBuffer()],
      PUMP_PROGRAM
    );

    if (context) {
        const authority = context.mintAuthority;
        
        // Pump.fun tokens on the curve ALWAYS have the Bonding Curve PDA as the Mint Authority
        if (authority === bondingCurvePda.toBase58()) {
            console.log(`[Mode] Mint Authority matches Bonding Curve PDA. Force PUMP mode.`);
            return { mode: "pump", dexData: null };
        }
    }
  } catch (e) {
      console.warn("Mint Authority check failed:", e);
  }

  // Method 1: Check bonding curve status (from previous step)
  if (pumpState && pumpState.exists) {
    if (!pumpState.complete) {
      return { mode: "pump", dexData: null };
    }
    // Graduated from bonding curve → now on DEX
    return { mode: "dex", dexData: null };
  }

  // Method 2: Check for DEX pools via DexScreener (Fallback)
  try {
    const dexData = await fetchDexScreener(tokenAddress);
    
    if (dexData && dexData.dexName === "Pump.fun") {
        return { mode: "pump", dexData };
    }

    if (dexData && dexData.pairAddress) {
      return { mode: "dex", dexData };
    }

  } catch (err) {
    console.error("Mode detection DexScreener error:", err);
  }

  // Method 3: Address Pattern Fallback
  // If we couldn't determine mode via RPC or API, but the address ends in "pump",
  // it's almost certainly a Pump.fun token (likely new/unindexed).
  // defaulting to DEX here would cause a "No Liquidity" panic.
  if (tokenAddress.toLowerCase().endsWith("pump")) {
      return { mode: "pump", dexData: null };
  }

  // Default to DEX mode (safest fallback for non-pump addresses)
  return { mode: "dex", dexData: null };
}

// --- Scoring Logic ---

export function calculatePenalties(
  checks: ScanResult["checks"],
  mode: ScanMode,
  whitelist?: WhitelistedToken
): { score: number; riskFactors: PenaltyDetail[] } {
  const penalties: PenaltyDetail[] = [];
  const skip = whitelist?.skipChecks || {};
  
  // -- Critical Checks (Auto-F triggers) --
  
  // 1. Honeypot (Critical)
  // Skip for Pump.fun tokens — Jupiter has no routes for bonding curve tokens,
  // so sell simulation always fails (false positive).
  if (!skip.liquidity && mode !== "pump" && checks.honeypot.data?.isHoneypot) {
    penalties.push({ 
      category: "Critical", 
      reason: `Sell simulation failed: ${checks.honeypot.data.reason || "Unable to sell"}`, 
      points: 100, 
      isCritical: true 
    });
  }

  // 2. Mint Authority (Critical)
  // Skip for Pump.fun tokens — on the bonding curve, the Mint Authority is always
  // the Bonding Curve PDA. This is expected and not a risk.
  if (!skip.mintAuthority && mode !== "pump" && checks.mintAuthority.data?.status === "fail") {
    penalties.push({ 
      category: "Critical", 
      reason: "Mint authority is NOT revoked", 
      points: 50, 
      isCritical: true 
    });
  }

  // 3. Freeze Authority (Critical)
  // Skip for Pump.fun tokens — Pump.fun tokens typically have freeze authority
  // set to the program, which is expected behavior.
  if (!skip.freezeAuthority && mode !== "pump" && checks.freezeAuthority.data?.status === "fail") {
    penalties.push({ 
      category: "Critical", 
      reason: "Freeze authority is NOT revoked", 
      points: 30, 
      isCritical: true 
    });
  }

  // -- High Risk --

  // 4. Dev Action (Dev Sold)
  if (checks.advanced?.data) {
    const { isDevSoldOut, devBalancePercent } = checks.advanced.data;
    // On Pump.fun, if dev is out, it's very bad. On DEX, it might be community takeover (CTO), but still risky if recent.
    // We treat "Dev Sold Out" as high risk unless verified community.
    if (isDevSoldOut) {
      penalties.push({ 
        category: "Dev Action", 
        reason: `Dev has sold out (holds ${devBalancePercent?.toFixed(2)}%)`, 
        points: mode === "pump" ? 40 : 25 
      });
    } else if (devBalancePercent) {
      // Pump Mode Specific: Dev Holdings
      if (mode === "pump") {
        if (devBalancePercent > 10) {
           penalties.push({
             category: "Dev Holdings",
             reason: `Dev holds high supply (${devBalancePercent.toFixed(1)}%)`,
             points: 25
           });
        } else if (devBalancePercent > 5) {
           penalties.push({
             category: "Dev Holdings",
             reason: `Dev holds significant supply (${devBalancePercent.toFixed(1)}%)`,
             points: 15
           });
        }
      } else {
        // DEX Mode
        if (devBalancePercent > 30) {
          penalties.push({
             category: "Dev Action",
             reason: `Dev wallet holds ${devBalancePercent.toFixed(1)}% (Dump risk)`,
             points: 20
          });
        }
      }
    }
  }

  // 5. Liquidity
  if (!skip.liquidity && checks.liquidity.data) {
    const liq = checks.liquidity.data;
    
    if (mode === "pump") {
      // Pump Mode: No liquidity penalty (bonding curve).
      // We check Bonding Curve Progress instead (informational mostly, or warning if very low)
      // Implementation note: The progress is part of metadata/advanced data, but we can't easily penalize here without passing it in.
      // However, the prompt says "Bonding Curve Progress... < 10% filled: show warning". 
      // We'll leave it as UI warning for now to avoid over-penalizing new tokens.
    } else {
      // DEX Mode: Strict checks
      if (liq.lpSizeUsd === -1) {
        penalties.push({ 
          category: "Liquidity", 
          reason: "Liquidity data unavailable (Unknown)", 
          points: 10 
        });
      } else if (liq.lpSizeUsd === 0) {
        penalties.push({ 
          category: "Liquidity", 
          reason: "No Liquidity (Pool Size $0)", 
          points: 50,
          isCritical: true
        });
      } else if (liq.lpSizeUsd < 1000) {
        penalties.push({ category: "Low Liquidity", reason: `Liquidity is critically low ($${liq.lpSizeUsd.toLocaleString()})`, points: 30 });
      } else if (liq.lpSizeUsd < 10000) {
        penalties.push({ category: "Low Liquidity", reason: `Liquidity is low ($${liq.lpSizeUsd.toLocaleString()})`, points: 20 });
      } else if (liq.lpSizeUsd < 50000) {
        penalties.push({ category: "Low Liquidity", reason: `Liquidity is moderate ($${liq.lpSizeUsd.toLocaleString()})`, points: 10 });
      }

      // if (!liq.lpBurned && !liq.lpLocked) {
      //   penalties.push({ category: "LP Not Locked", reason: "Liquidity is not burned or locked", points: 30 });
      // }
    }
  }

  // 6. Holders (Medium to High Risk)
  if (!skip.holders && checks.holders.data) {
    const { topTenPercent, largestHolder } = checks.holders.data;
    
    // Logic: Calculate Top 10 penalty and Single Holder penalty independently, 
    // then take the MAX of them to avoid double counting.

    let top10Penalty = 0;
    let top10Reason = "";
    let singlePenalty = 0;
    let singleReason = "";

    if (mode === "pump") {
      // Pump Mode
      if (topTenPercent > 50) {
        top10Penalty = 25;
        top10Reason = `High concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      } else if (topTenPercent > 35) {
        top10Penalty = 15;
        top10Reason = `Moderate concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      }

      if (largestHolder && largestHolder.percent > 20) {
        singlePenalty = 20;
        singleReason = `Whale risk (Single holder owns ${largestHolder.percent.toFixed(1)}%)`;
      }

    } else {
      // DEX Mode (Stricter)
      // New Thresholds: >80% (-50), >60% (-35), >50% (-25), >40% (-15), >30% (-10)
      if (topTenPercent > 80) {
        top10Penalty = 50;
        top10Reason = `Extreme concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      } else if (topTenPercent > 60) {
        top10Penalty = 35;
        top10Reason = `Very high concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      } else if (topTenPercent > 50) {
        top10Penalty = 25;
        top10Reason = `High concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      } else if (topTenPercent > 40) {
        top10Penalty = 15;
        top10Reason = `Moderate concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      } else if (topTenPercent > 30) {
        top10Penalty = 10;
        top10Reason = `Elevated concentration (Top 10 hold ${topTenPercent.toFixed(1)}%)`;
      }

      // Largest Holder Thresholds: >50% (-40), >30% (-30), >20% (-20), >10% (-10)
      if (largestHolder) {
        if (largestHolder.percent > 50) {
          singlePenalty = 40;
          singleReason = `Dangerous Whale (Single holder owns ${largestHolder.percent.toFixed(1)}%)`;
        } else if (largestHolder.percent > 30) {
          singlePenalty = 30;
          singleReason = `Whale risk (Single holder owns ${largestHolder.percent.toFixed(1)}%)`;
        } else if (largestHolder.percent > 20) {
          singlePenalty = 20;
          singleReason = `Whale risk (Single holder owns ${largestHolder.percent.toFixed(1)}%)`;
        } else if (largestHolder.percent > 10) {
          singlePenalty = 10;
          singleReason = `Minor Whale risk (Single holder owns ${largestHolder.percent.toFixed(1)}%)`;
        }
      }
    }

    // Apply the MAX of the two penalties
    if (singlePenalty > top10Penalty) {
      penalties.push({ category: "Holder Concentration", reason: `${singleReason} (Top 10: ${topTenPercent.toFixed(1)}%)`, points: singlePenalty });
    } else if (top10Penalty > 0) {
      penalties.push({ category: "Holder Concentration", reason: `${top10Reason} (Largest: ${largestHolder?.percent.toFixed(1)}%)`, points: top10Penalty });
    }

    // 6.5 Clusters (Identical or tight-range Balances)
    if (checks.holders.data.clustersDetected >= 3) {
      const clusterCount = checks.holders.data.clustersDetected;
      let points = 15;
      if (clusterCount >= 10) points = 50; // Critical for large clusters
      else if (clusterCount >= 6) points = 30;

      penalties.push({ 
        category: "Insider Activity", 
        reason: `${clusterCount} wallets have highly suspicious similar balances (Bundled launch risk)`, 
        points: points,
        isCritical: points >= 50
      });
    }
  }

  // -- Low Risk / Other --

  // Metadata
  if (mode !== "pump" && !skip.metadata) {
    if (checks.metadata.data?.isMutable) {
      penalties.push({ category: "Metadata", reason: "Metadata is mutable", points: 10 });
    }
  }
  
  const hasSocials = checks.metadata.data?.website || checks.metadata.data?.twitter || checks.metadata.data?.telegram;
  if (!hasSocials) {
      penalties.push({ category: "Social Links", reason: "No social links found", points: 10 });
  }

  // Age (Skip for Pump)
  if (mode !== "pump" && !skip.age && checks.tokenAge.data) {
    if (checks.tokenAge.data.ageInHours < 24) {
      penalties.push({ category: "Age", reason: "Token is very new (< 24h)", points: 15 });
    }
  }

  // Final Calculation
  const totalPoints = penalties.reduce((sum, p) => sum + p.points, 0);
  const finalScore = Math.max(0, 100 - totalPoints);

  return { score: finalScore, riskFactors: penalties };
}

// --- Main Function ---

// Short-lived in-flight/result cache to prevent duplicate scans
// (layout generateMetadata + client POST + React Strict Mode)
const scanInflight = new Map<string, { promise: Promise<ScanResult>; ts: number }>();
const INFLIGHT_TTL_MS = 30_000; // 30 seconds

export async function scanToken(tokenAddress: string): Promise<ScanResult> {
  const now = Date.now();
  const existing = scanInflight.get(tokenAddress);
  if (existing && now - existing.ts < INFLIGHT_TTL_MS) {
    return existing.promise;
  }

  const promise = _scanTokenImpl(tokenAddress);
  scanInflight.set(tokenAddress, { promise, ts: now });

  // Clean up after TTL
  promise.finally(() => {
    setTimeout(() => scanInflight.delete(tokenAddress), INFLIGHT_TTL_MS);
  });

  return promise;
}

async function _scanTokenImpl(tokenAddress: string): Promise<ScanResult> {
  // 1. Whitelist Check
  let whitelist = getWhitelistedToken(tokenAddress);
  let jupiterVerified = false;
  
  if (!whitelist) {
    const jupInfo = await getJupiterTokenInfo(tokenAddress);
    if (jupInfo) {
      jupiterVerified = true;
      whitelist = {
        address: tokenAddress,
        name: jupInfo.name,
        symbol: jupInfo.symbol,
        type: getTokenType(jupInfo) as any,
        skipChecks: { age: true },
        minScore: 60
      };
    }
  }

  // 2. Fetch Initial Data
  const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";
  const pumpStatePromise = getPumpFunCurveState(tokenAddress);
  const pricePromise = getTokenPrice(tokenAddress).catch(e => {
    console.warn("Price fetch failed:", e);
    return null;
  });
  const solPricePromise = getTokenPrice(WSOL_ADDRESS);
  const contextPromise = fetchTokenContext(tokenAddress);

  const [pumpState, context, solPriceData] = await Promise.all([
    pumpStatePromise, 
    contextPromise,
    solPricePromise
  ]);

  // 3. Determine Mode
  const { mode, dexData } = await detectTokenMode(tokenAddress, pumpState, context, !!whitelist);

  // 4. Run Checks
  const [mintAuth, freezeAuth, holders, liquidity, metadata, tokenAge, price, honeypot] = await Promise.all([
    safeCheck(() => context ? Promise.resolve(checkMintAuthority(context)) : Promise.resolve(null), "mintAuthority"),
    safeCheck(() => context ? Promise.resolve(checkFreezeAuthority(context)) : Promise.resolve(null), "freezeAuthority"),
    safeCheck(async () => {
      if (!context) return null;
      // Exclude bonding curve PDA from holders analysis
      const excludes = pumpState?.exists ? [pumpState.pda] : [];
      return analyzeHolders(tokenAddress, context.supply, excludes);
    }, "holders"),
    safeCheck(async () => {
      if (mode === "pump" && pumpState) {
        return { 
          lpSizeUsd: 0, 
          lpLocked: true, 
          lpBurned: true, 
          lockDuration: "Bonding Curve", 
          dexName: "pump.fun", 
          pairAddress: null, 
          liquidityDisplay: `Bonding Curve (${pumpState.curveProgressPercent}% 🔥)` 
        } as LiquidityInfo;
      }
      // Pass prefetched dexData if available
      return checkLiquidity(tokenAddress, dexData);
    }, "liquidity"),
    safeCheck(() => getTokenMetadata(tokenAddress), "metadata"),
    safeCheck(async () => {
      const p = await pricePromise;
      return checkTokenAge(tokenAddress, p?.pairCreatedAt);
    }, "tokenAge"),
    safeCheck(() => pricePromise, "price"),
    safeCheck(() => checkSellSimulation(tokenAddress), "honeypot"),
  ]);

  // Fallback: If mode is Pump but we failed to fetch pumpState (RPC error or bad ID),
  // construct a partial state using Market Cap from price API and dynamic SOL price.
  let finalPumpState = pumpState;
  if (mode === 'pump' && (!finalPumpState || !finalPumpState.exists)) {
      const currentMc = price.data?.marketCap || 0;
      const solPrice = solPriceData?.priceUsd || 600;

      // Pump.fun Graduation Math:
      // - Real SOL collected at graduation: 85 SOL
      // - Virtual SOL at graduation: ~30-40 SOL (initial virtual liquidity)
      // - Virtual tokens remaining: ~280M (after selling 793M of 1.073B)
      // - Market Cap = (virtualSol / virtualTokens) × totalSupply
      // - At graduation: MC ≈ (35 / (280M / 1e6)) × 1B ≈ 125 SOL
      // - In USD: 125 SOL × $600 ≈ $75k (varies with SOL price)
      const PUMP_GRADUATION_MC_SOL = 115; // Empirical MC at graduation (in SOL)
      const PUMP_GRADUATION_REAL_SOL = 85; // Real SOL collected at graduation
      const graduationTargetUsd = solPrice * PUMP_GRADUATION_MC_SOL;

      const currentMcInSol = currentMc / solPrice;
      const fallbackProgress = Math.min(100, Math.round((currentMc / graduationTargetUsd) * 100));

      // Estimate remaining SOL using the ratio: realSOL ≈ (MC_SOL / 115) × 85
      const estimatedRealSol = (currentMcInSol / PUMP_GRADUATION_MC_SOL) * PUMP_GRADUATION_REAL_SOL;
      const remainingSolEstimate = Math.max(0, PUMP_GRADUATION_REAL_SOL - estimatedRealSol);

      finalPumpState = {
          exists: true,
          pda: "Estimated from MC",
          virtualTokenReserves: "0",
          virtualSolReservesLamports: "0",
          virtualSolReservesSol: 0,
          realTokenReserves: "0",
          realSolReservesLamports: "0",
          realSolReservesSol: estimatedRealSol,
          tokenTotalSupply: 1_000_000_000,
          complete: fallbackProgress >= 100,
          pricePerTokenSol: null,
          marketCapSol: currentMcInSol,
          curveProgressPercent: fallbackProgress,
          remainingSolToGraduate: fallbackProgress >= 100 ? 0 : remainingSolEstimate,
      };
  }

  // 5. Advanced Analysis
  const advancedData = analyzeDevWallet(metadata.data, holders.data);

  const checks: ScanResult["checks"] = {
    mintAuthority: mintAuth,
    freezeAuthority: freezeAuth,
    holders,
    liquidity,
    metadata,
    tokenAge,
    honeypot,
    advanced: { status: "success", data: advancedData }
  };

  // Attach derived metadata
  if (pumpState && checks.metadata.data) checks.metadata.data.pumpFunCurve = pumpState;

  // Apply Whitelist Overrides
  if (whitelist && checks.metadata.data) {
    if (!checks.metadata.data.name || checks.metadata.data.name === "Unknown") checks.metadata.data.name = whitelist.name;
    if (!checks.metadata.data.symbol || checks.metadata.data.symbol === "TOKEN") checks.metadata.data.symbol = whitelist.symbol;
    if (whitelist.image && !checks.metadata.data.image) checks.metadata.data.image = whitelist.image;
  }

  // 6. Calculate Score
  let { score, riskFactors } = calculatePenalties(checks, mode, whitelist);

  // Apply Whitelist Floor Score
  if (whitelist?.minScore && score < whitelist.minScore) {
    score = whitelist.minScore;
  }

  // 7. Final Grade (with Auto-F logic)
  const hasCriticalFail = riskFactors.some(r => r.isCritical);
  let { grade, color, label } = getGrade(score, hasCriticalFail);

  // Override label for severe F grades
  if (grade === 'F') {
     const totalPenalty = riskFactors.reduce((sum, p) => sum + p.points, 0);
     if (totalPenalty > 170) label = "Almost Certain Scam";
     else if (totalPenalty > 130) label = "Extreme Risk";
     // else default "Likely Scam"
  }

  return {
    tokenAddress,
    scanMode: mode,
    score,
    grade,
    gradeColor: color,
    gradeLabel: label,
    penalties: riskFactors,
    totalPenalties: riskFactors.reduce((sum, p) => sum + p.points, 0),
    checks,
    scannedAt: new Date(),
    isWhitelisted: !!whitelist,
    whitelistInfo: whitelist ? { name: whitelist.name, symbol: whitelist.symbol, type: jupiterVerified ? `jupiter-verified (${whitelist.type})` : whitelist.type } : undefined,
    price: price.data,
    solPrice: solPriceData?.priceUsd || null,
    bondingCurveData: finalPumpState
  };
}

export { getWhitelistedToken };