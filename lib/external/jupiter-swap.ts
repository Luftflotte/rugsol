export interface HoneypotCheckResult {
  isHoneypot: boolean;
  reason?: string;
  simulationSuccess: boolean;
  buyTax?: number; // Not easily checking buy tax, but sell simulation covers ability to sell
  sellTax?: number; 
}

const SOL_MINT = "So11111111111111111111111111111111111111112";

export async function checkSellSimulation(tokenAddress: string): Promise<HoneypotCheckResult> {
  // Don't check SOL itself
  if (tokenAddress === SOL_MINT) {
    return { isHoneypot: false, simulationSuccess: true };
  }

  try {
    // Try to swap a small amount of Token -> SOL
    // We assume 6 decimals as standard for memecoins, so 1000000 = 1 token.
    // Even if 9 decimals, 1000000 = 0.001 token, which is usually tradable.
    const amount = "1000000"; 

    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenAddress}&outputMint=${SOL_MINT}&amount=${amount}&slippageBps=500`; // 5% slippage allowance

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      // If 400 Bad Request, usually means "No route found" or "Insufficient liquidity"
      if (response.status === 400 || response.status === 404) {
         return {
           isHoneypot: true,
           simulationSuccess: false,
           reason: "Jupiter could not find a swap route (No liquidity or unsellable)"
         };
      }
      // Other errors (500) might be Jupiter issues, don't flag as honeypot strictly
      return { isHoneypot: false, simulationSuccess: false, reason: "Jupiter API error" };
    }

    const data = await response.json();

    if (!data.outAmount || data.outAmount === "0") {
       return {
         isHoneypot: true,
         simulationSuccess: false,
         reason: "Swap simulation returned 0 SOL output"
       };
    }

    // Success!
    return {
      isHoneypot: false,
      simulationSuccess: true
    };

  } catch (error) {
    // console.warn("Honeypot check failed (network/API error):", error instanceof Error ? error.message : String(error));
    return { isHoneypot: false, simulationSuccess: false, reason: "Check failed (Network/API Error)" };
  }
}
