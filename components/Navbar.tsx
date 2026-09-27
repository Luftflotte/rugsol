"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tps, setTps] = useState(2680);

  // Subtle real-time TPS variation to feel alive like an active trading terminal
  useEffect(() => {
    const interval = setInterval(() => {
      setTps(2600 + Math.floor(Math.random() * 250));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showComingSoon = useCallback((label: string) => {
    setToast(`${label} — Coming Soon`);
    setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-color bg-bg-main/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="relative flex h-13 items-center justify-between gap-4">
          
          {/* Logo & Terminal Tag */}
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider bg-bg-secondary text-text-muted border border-border-color">
              TERMINAL
            </span>
          </div>

          {/* Network Live Ticker (Mathematically Centered) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4 text-xs font-mono text-text-muted border border-border-color/60 bg-bg-card px-3 py-1 rounded-md pointer-events-none select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-text-secondary">Mainnet Beta</span>
            </div>
            <span className="text-border-color">|</span>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">TPS:</span>
              <span className="text-text-primary tabular-nums font-semibold">{tps.toLocaleString()}</span>
            </div>
            <span className="text-border-color">|</span>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">RPC:</span>
              <span className="text-emerald-500 font-semibold">14ms</span>
            </div>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/about"
              className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/api-docs"
              className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              API
            </Link>
            <a
              href="https://x.com/RugSolScanner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
              title="X / Twitter"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Connect Wallet Button (preserving .k69juq-15 class) */}
            <button className="k69juq-15 px-3 py-1.5 text-xs font-mono font-medium text-text-primary bg-bg-card hover:bg-bg-secondary border border-border-color rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Connect Wallet</span>
            </button>
            
            <ThemeToggle />
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button className="k69juq-15 px-2.5 py-1 text-xs font-mono font-medium text-text-primary bg-bg-card border border-border-color rounded-md">
              Connect
            </button>
            <ThemeToggle />
            <button
              className="p-1 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border-color bg-bg-main">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted px-2 py-1 bg-bg-card rounded mb-2">
                <span>Solana Mainnet</span>
                <span className="text-emerald-500 font-semibold">{tps} TPS</span>
              </div>
              <Link href="/about" className="text-xs text-text-secondary hover:text-text-primary px-2 py-1.5">
                About
              </Link>
              <Link href="/api-docs" className="text-xs text-text-secondary hover:text-text-primary px-2 py-1.5">
                API Docs
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md bg-bg-card border border-border-color shadow-xl text-xs font-mono text-text-primary animate-fade-in-up">
          {toast}
        </div>
      )}
    </nav>
  );
}
