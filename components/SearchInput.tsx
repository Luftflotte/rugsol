"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SAMPLE_TOKENS = [
  { symbol: "USDC", name: "USD Coin", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "JUP", name: "Jupiter", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { symbol: "SOL", name: "Wrapped SOL", address: "So11111111111111111111111111111111111111112" },
  { symbol: "BONK", name: "Bonk", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
];

export function SearchInput() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global hotkey: press '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" && document.activeElement !== inputRef.current) || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScan = (tokenToScan?: string) => {
    const target = (tokenToScan || address).trim();
    if (!target) {
      setError("Enter a Solana token mint address");
      inputRef.current?.focus();
      return;
    }

    // Basic Solana address validation (32-44 chars, base58)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!base58Regex.test(target)) {
      setError("Invalid Solana base58 address format");
      return;
    }

    setError("");
    setIsLoading(true);
    router.push(`/scan/${target}`);
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
        const clean = text.trim();
        setAddress(clean);
        setError("");
        handleScan(clean);
      }
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Bar Container */}
      <div className="relative group">
        <div className="flex items-center gap-2 p-1.5 bg-bg-card border border-border-color rounded-lg focus-within:border-emerald-500/70 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all shadow-sm">
          {/* Terminal Search Icon */}
          <div className="pl-3 text-text-muted flex items-center">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste Solana token address (e.g. EPjFWdd5...)"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 px-2 bg-transparent border-0 text-text-primary placeholder:text-text-muted text-sm font-mono tracking-tight focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pr-1">
            {!address && (
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-border-color/60 border border-border-color rounded transition-colors cursor-pointer"
                type="button"
                title="Paste from clipboard and scan"
              >
                <span>Paste</span>
              </button>
            )}

            {/* Keyboard shortcut hint */}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-bg-secondary border border-border-color rounded">
              /
            </kbd>

            {/* Scan button */}
            <button
              onClick={() => handleScan()}
              disabled={isLoading}
              className="h-8 px-4 text-xs font-mono font-semibold text-black bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Scan</span>
                  <span className="text-[10px] opacity-75">↵</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute -bottom-6 left-1 text-[11px] font-mono text-rose-500 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quick Token Samples */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Quick test:</span>
        {SAMPLE_TOKENS.map((tok) => (
          <button
            key={tok.symbol}
            onClick={() => {
              setAddress(tok.address);
              handleScan(tok.address);
            }}
            className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-text-secondary hover:text-emerald-400 bg-bg-card hover:bg-bg-secondary border border-border-color transition-colors cursor-pointer"
          >
            ${tok.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
