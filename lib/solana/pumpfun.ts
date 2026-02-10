import { PublicKey } from "@solana/web3.js";
import { connection } from "./connection";

const PUMP_FUN_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);

const LAMPORTS_PER_SOL = 1_000_000_000;

// Pump.fun Constants
const INITIAL_VIRTUAL_TOKEN_RESERVES = BigInt("1073000000000000"); // 1.073B tokens with 6 decimals
const TOTAL_TOKENS_FOR_SALE = BigInt("793100000000000"); // 793.1M tokens available to buy (standard for 100% progress)
const GRADUATION_REAL_SOL_TARGET = 85; // Target in real SOL collected

export interface PumpFunCurveState {
  exists: boolean;
  pda: string;
  virtualTokenReserves: string;
  virtualSolReservesLamports: string;
  virtualSolReservesSol: number;
  realTokenReserves: string;
  realSolReservesLamports: string;
  realSolReservesSol: number;
  tokenTotalSupply: number;
  complete: boolean;
  pricePerTokenSol: number | null;
  marketCapSol: number | null;
  curveProgressPercent: number | null;
  remainingSolToGraduate: number | null;
}

export async function getPumpFunCurveState(
  mintAddress: string
): Promise<PumpFunCurveState | null> {
  try {
    const mintPk = new PublicKey(mintAddress);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding-curve"), mintPk.toBuffer()],
      PUMP_FUN_PROGRAM_ID
    );

    const pdaInfo = await connection.getAccountInfo(pda);

    if (!pdaInfo || !pdaInfo.data) {
      return { exists: false, pda: pda.toBase58(), virtualTokenReserves: "0", virtualSolReservesLamports: "0", virtualSolReservesSol: 0, realTokenReserves: "0", realSolReservesLamports: "0", realSolReservesSol: 0, tokenTotalSupply: 0, complete: false, pricePerTokenSol: null, marketCapSol: null, curveProgressPercent: null, remainingSolToGraduate: null };
    }

    const buf = Buffer.from(pdaInfo.data);
    const START_OFFSET = 8; // Anchor discriminator
    const REQUIRED_SIZE = START_OFFSET + 41; // 8 (discriminator) + 5 * 8 (u64 fields) + 1 (bool) = 49 bytes

    // Guard: If account data is too small, it's not a valid Pump.fun bonding curve
    if (buf.length < REQUIRED_SIZE) {
      return { exists: false, pda: pda.toBase58(), virtualTokenReserves: "0", virtualSolReservesLamports: "0", virtualSolReservesSol: 0, realTokenReserves: "0", realSolReservesLamports: "0", realSolReservesSol: 0, tokenTotalSupply: 0, complete: false, pricePerTokenSol: null, marketCapSol: null, curveProgressPercent: null, remainingSolToGraduate: null };
    }

    // Decoding
    const virtualTokenReserves = buf.readBigUInt64LE(START_OFFSET + 0);
    const virtualSolReservesLamports = buf.readBigUInt64LE(START_OFFSET + 8);
    const realTokenReserves = buf.readBigUInt64LE(START_OFFSET + 16);
    const realSolReservesLamports = buf.readBigUInt64LE(START_OFFSET + 24);
    const tokenTotalSupply = buf.readBigUInt64LE(START_OFFSET + 32);
    const complete = Boolean(buf.readUInt8(START_OFFSET + 40));

    const virtualSolReservesSol = Number(virtualSolReservesLamports) / LAMPORTS_PER_SOL;
    const realSolReservesSol = Number(realSolReservesLamports) / LAMPORTS_PER_SOL;

    // 1. Calculate Progress by TOKENS
    const tokensSold = INITIAL_VIRTUAL_TOKEN_RESERVES - virtualTokenReserves;
    const progress = Number((tokensSold * BigInt(10000)) / TOTAL_TOKENS_FOR_SALE) / 100;

    // 2. Market Cap calculation (Corrected)
    // Formula: (Virtual SOL / Virtual Tokens) * Total Supply * (10^6 / 10^9)
    // Simplified: (Virtual SOL Lamports / Virtual Tokens) * 10^9 / 10^9 = Price in Lamports per RAW token
    // MC in SOL = (virtualSolReservesSol / (Number(virtualTokenReserves) / 1e6)) * 1,000,000,000
    let marketCapSol = 0;
    if (virtualTokenReserves > BigInt(0)) {
        const pricePerTokenSol = virtualSolReservesSol / (Number(virtualTokenReserves) / 1_000_000);
        marketCapSol = pricePerTokenSol * 1_000_000_000;
    }

    // 3. Remaining SOL to graduate
    const remainingSol = Math.max(0, GRADUATION_REAL_SOL_TARGET - realSolReservesSol);

    return {
      exists: true,
      pda: pda.toBase58(),
      virtualTokenReserves: virtualTokenReserves.toString(),
      virtualSolReservesLamports: virtualSolReservesLamports.toString(),
      virtualSolReservesSol,
      realTokenReserves: realTokenReserves.toString(),
      realSolReservesLamports: realSolReservesLamports.toString(),
      realSolReservesSol,
      tokenTotalSupply: 1_000_000_000,
      complete,
      pricePerTokenSol: marketCapSol / 1_000_000_000,
      marketCapSol,
      curveProgressPercent: complete ? 100 : Math.min(99.9, progress),
      remainingSolToGraduate: complete ? 0 : remainingSol,
    };
  } catch (error) {
    console.error("getPumpFunCurveState error:", error);
    return null;
  }
}

export default getPumpFunCurveState;
