"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showComingSoon = useCallback((label: string) => {
    setToast(`${label} — Coming Soon`);
    setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-color/50 bg-bg-main/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              About
            </Link>
            <Link
              href="/api-docs"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              API
            </Link>
            <button
              onClick={() => showComingSoon("Telegram")}
              className="text-text-secondary hover:silver-accent transition-colors duration-300 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </button>
            <button
              onClick={() => showComingSoon("Twitter")}
              className="text-text-secondary hover:silver-accent transition-colors duration-300 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              className="text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-color">
            <div className="flex flex-col gap-4">
              <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                About
              </Link>
              <Link href="/api-docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                API
              </Link>
              <button onClick={() => showComingSoon("Telegram Bot")} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">
                Bot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Coming Soon Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-bg-card border border-border-color/50 shadow-lg text-sm text-text-primary font-medium animate-fade-in-up">
          {toast}
        </div>
      )}
    </nav>
  );
}
