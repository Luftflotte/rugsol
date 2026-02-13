"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleScan = async () => {
    if (!address.trim()) {
      setError("Please enter a token address");
      return;
    }

    // Basic Solana address validation (32-44 chars, base58)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!base58Regex.test(address.trim())) {
      setError("Invalid Solana address format");
      return;
    }

    setError("");
    setIsLoading(true);

    // Navigate to scan result page
    router.push(`/scan/${address.trim()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text.trim());
        setError("");
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-2 bg-bg-secondary/50 border border-border-color rounded-2xl focus-within:border-[var(--silver-accent)]/50 focus-within:ring-1 focus-within:ring-[var(--silver-accent)]/20 transition-colors duration-300">
        <Input
          type="text"
          placeholder="Paste token address..."
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 h-12 px-4 bg-transparent border-0 text-text-primary placeholder:text-text-muted text-lg font-mono tracking-wide focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {!address && (
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 mr-1 text-xs font-medium text-text-secondary bg-[var(--silver-accent)]/10 hover:bg-[var(--silver-accent)]/20 hover:text-[var(--silver-accent)] rounded-lg transition-colors whitespace-nowrap"
            type="button"
            title="Paste from clipboard"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hidden min-[400px]:inline">Paste</span>
          </button>
        )}
        <Button
          onClick={handleScan}
          disabled={isLoading}
          className="btn-premium h-10 px-6 font-semibold rounded-xl disabled:opacity-50 flex-shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Scanning...
            </span>
          ) : (
            "Scan"
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400 text-center animate-fade-in-up">
          {error}
        </p>
      )}

      {/* Example addresses */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs text-text-muted">Try:</span>
        <button
          onClick={() => setAddress("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")}
          className="text-xs text-text-secondary hover:silver-accent transition-colors duration-300"
        >
          USDC
        </button>
        <span className="text-xs text-text-muted">•</span>
        <button
          onClick={() => setAddress("So11111111111111111111111111111111111111112")}
          className="text-xs text-text-secondary hover:silver-accent transition-colors duration-300"
        >
          SOL
        </button>
        <span className="text-xs text-text-muted">•</span>
        <button
          onClick={() => setAddress("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")}
          className="text-xs text-text-secondary hover:silver-accent transition-colors duration-300"
        >
          BONK
        </button>
      </div>
    </div>
  );
}
