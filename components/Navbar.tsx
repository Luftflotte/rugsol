"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./Logo";
import { ConnectWalletButton } from "./ConnectWalletButton";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-color/50 bg-bg-main/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              About
            </Link>
            <Link
              href="#api"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              API
            </Link>
            <Link
              href="#bot"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              Bot
            </Link>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:silver-accent transition-colors duration-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <ThemeToggle />
            <ConnectWalletButton />
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
              <Link href="#api" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                API
              </Link>
              <Link href="#bot" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Bot
              </Link>
              <div className="pt-2 border-t border-border-color">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
