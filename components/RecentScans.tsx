"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { reloadNoirScript } from "@/lib/utils";

interface RecentScan {
  address: string;
  symbol: string;
  name: string;
  score: number;
  grade: string;
  gradeColor: string;
  image?: string;
  scannedAt: string;
  price?: number | null;
  createdAt?: string;
}

// Pool of known Solana mainnet tokens used to simulate live activity
const FAKE_POOL: Omit<RecentScan, "scannedAt">[] = [
  { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", name: "USD Coin", symbol: "USDC", score: 97, grade: "A", gradeColor: "#22c55e" },
  { address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", name: "Tether USD", symbol: "USDT", score: 94, grade: "A", gradeColor: "#22c55e" },
  { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", name: "Bonk", symbol: "BONK", score: 78, grade: "B", gradeColor: "#84cc16" },
  { address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", name: "dogwifhat", symbol: "WIF", score: 82, grade: "A", gradeColor: "#22c55e" },
  { address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", name: "Jupiter", symbol: "JUP", score: 91, grade: "A", gradeColor: "#22c55e" },
  { address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", name: "Popcat", symbol: "POPCAT", score: 74, grade: "B", gradeColor: "#84cc16" },
  { address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", name: "Pyth Network", symbol: "PYTH", score: 88, grade: "A", gradeColor: "#22c55e" },
  { address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", name: "Raydium", symbol: "RAY", score: 85, grade: "A", gradeColor: "#22c55e" },
  { address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", name: "Orca", symbol: "ORCA", score: 83, grade: "A", gradeColor: "#22c55e" },
  { address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", name: "Marinade staked SOL", symbol: "mSOL", score: 93, grade: "A", gradeColor: "#22c55e" },
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", name: "Samoyedcoin", symbol: "SAMO", score: 68, grade: "B", gradeColor: "#84cc16" },
  { address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", name: "cat in a dogs world", symbol: "MEW", score: 71, grade: "B", gradeColor: "#84cc16" },
  { address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk", name: "Wen", symbol: "WEN", score: 66, grade: "B", gradeColor: "#84cc16" },
  { address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", name: "Book of Meme", symbol: "BOME", score: 63, grade: "B", gradeColor: "#84cc16" },
];

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 0.01) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } else if (price >= 0.0001) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  } else {
    const str = price.toPrecision(4);
    return parseFloat(str).toLocaleString('en-US', { maximumFractionDigits: 10 });
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function TokenImage({ src, symbol }: { src?: string; symbol: string }) {
  if (src) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={symbol}
          className="w-10 h-10 rounded-full bg-bg-secondary"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
      </>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center border border-border-color">
      <span className="text-sm font-bold text-text-primary">
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

// Auth Modal Component
function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        reloadNoirScript();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative glass-card p-8 rounded-3xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--silver-accent)]/10 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 silver-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-text-primary text-center mb-3">
          Authentication Required
        </h3>
        <p className="text-text-secondary text-center mb-8 leading-relaxed">
          Connect your wallet to add tokens to your watchlist and access personalized features.
        </p>

        <button
          className="noir-connect w-full py-4 bg-text-primary text-bg-main font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Connect Wallet</span>
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

export function RecentScans() {
  const [displayedScans, setDisplayedScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const displayedScansRef = useRef<RecentScan[]>([]);
  const fakeAddressesRef = useRef(new Set<string>());
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    displayedScansRef.current = displayedScans;
  }, [displayedScans]);

  // Fetch real scans from API
  useEffect(() => {
    async function fetchRecentScans() {
      try {
        const res = await fetch("/api/recent");
        const data = await res.json();
        if (data.success) {
          const apiScans: RecentScan[] = data.data;
          setDisplayedScans(prev => {
            // Preserve fake entries at the top
            const fakes = prev.filter(s => fakeAddressesRef.current.has(s.address));
            const fakeAddrs = new Set(fakes.map(f => f.address));
            const reals = apiScans.filter(s => !fakeAddrs.has(s.address));
            const merged = [...fakes, ...reals];
            const seen = new Set<string>();
            return merged.filter(s => {
              if (seen.has(s.address)) return false;
              seen.add(s.address);
              return true;
            }).slice(0, 20);
          });
        }
      } catch (error) {
        console.error("Failed to fetch recent scans:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentScans();
    const interval = setInterval(fetchRecentScans, 30000);
    return () => clearInterval(interval);
  }, []);

  // Periodic fake scan injection
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function inject() {
      const current = displayedScansRef.current;
      const available = FAKE_POOL.filter(f => !current.some(s => s.address === f.address));

      if (available.length > 0) {
        const fake = available[Math.floor(Math.random() * available.length)];
        fakeAddressesRef.current.add(fake.address);

        const entry: RecentScan = {
          ...fake,
          scannedAt: new Date().toISOString(),
          price: null,
        };

        setDisplayedScans(prev => [entry, ...prev].slice(0, 20));

        // Highlight the new card
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        setHighlightedId(fake.address);
        highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 2000);

        // Increment fake count in localStorage for Stats component
        try {
          const count = parseInt(localStorage.getItem("fakeScansCount") || "0", 10);
          localStorage.setItem("fakeScansCount", String(count + 1));
          window.dispatchEvent(new CustomEvent("fakeScansUpdate"));
        } catch {}
      }

      // Schedule next injection: random 8–40 seconds
      const delay = 8000 + Math.random() * 32000;
      timeoutId = setTimeout(inject, delay);
    }

    // First injection after 8–20 seconds
    const initialDelay = 8000 + Math.random() * 12000;
    timeoutId = setTimeout(inject, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max px-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-56 h-36 rounded-xl bg-bg-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (displayedScans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">No recent scans yet. Be the first to scan a token!</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes scan-card-glow {
          0%   { box-shadow: 0 0 0 2px rgba(132, 204, 22, 0.85), 0 0 20px rgba(132, 204, 22, 0.35); }
          100% { box-shadow: 0 0 0 0px rgba(132, 204, 22, 0),    0 0  0px rgba(132, 204, 22, 0); }
        }
        .scan-card-new {
          animation: scan-card-glow 2s ease-out forwards;
        }
      `}</style>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--silver-accent)]/30" />
            <span className="text-xs silver-accent uppercase tracking-widest">Recent Activity</span>
          </div>
          {/* Only show on mobile */}
          <button
            className="noir-connect md:hidden group flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--silver-accent)]/5 border border-[var(--silver-accent)]/20 text-sm text-text-secondary hover:text-text-primary hover:border-[var(--silver-accent)]/40 hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
          >
            <svg
              className="w-4 h-4 silver-accent group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>My Portfolio</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--silver-accent)]/20 silver-accent ml-1">Soon</span>
          </button>
        </div>

        <div
          className="w-full overflow-x-auto recent-scans-container relative"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          }}
        >
          <div className="flex gap-4 min-w-max px-4 py-2">
            {displayedScans.map((scan, index) => {
              const isNew = scan.address === highlightedId;
              return (
                <Link href={`/scan/${scan.address}`} key={scan.address}>
                  <Card
                    className={`glass-card p-4 w-56 flex-shrink-0 animate-fade-in-up cursor-pointer relative group${isNew ? " scan-card-new" : ""}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={handleFavoriteClick}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:silver-accent hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
                      title="Add to watchlist"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>

                    <div className="flex items-start gap-3">
                      <TokenImage src={scan.image} symbol={scan.symbol} />
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="font-semibold text-text-primary truncate">${scan.symbol}</h4>
                        <p className="text-xs text-text-secondary truncate">{scan.name}</p>
                        <p className="text-xs silver-accent font-mono mt-0.5 h-4">
                          {scan.price ? `$${formatPrice(scan.price)}` : '\u00A0'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: scan.gradeColor }}
                        >
                          {scan.score}
                        </span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${scan.gradeColor}20`,
                            color: scan.gradeColor,
                          }}
                        >
                          {scan.grade}
                        </span>
                      </div>
                      <span
                        className="text-xs text-text-muted"
                        title={scan.createdAt ? new Date(scan.createdAt).toLocaleString() : new Date(scan.scannedAt).toLocaleString()}
                      >
                        {timeAgo(scan.createdAt || scan.scannedAt)}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-text-muted font-mono truncate">
                        {scan.address.slice(0, 4)}...{scan.address.slice(-4)}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}

            {/* Portfolio Teaser Card */}
            <button
              className="noir-connect group flex-shrink-0"
            >
              <Card className="glass-card p-4 w-56 h-full border-dashed border-2 border-[var(--silver-accent)]/30 hover:border-[var(--silver-accent)]/60 hover:bg-[var(--silver-accent)]/5 transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--silver-accent)]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 silver-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-1">Your Portfolio</h4>
                  <p className="text-xs text-text-secondary mb-2">Scan your wallet for risks</p>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--silver-accent)]/20 silver-accent">Coming Soon</span>
                </div>
              </Card>
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
