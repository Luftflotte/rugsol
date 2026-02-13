import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border-color/50 bg-bg-main">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="py-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-sm">
              Industry-leading Solana token security analysis platform.
              Real-time on-chain intelligence to protect you from rug pulls,
              honeypots, and malicious contracts.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-secondary/50 text-text-secondary hover:text-text-primary hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://t.me/rugsolinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-secondary/50 text-text-secondary hover:text-text-primary hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
                aria-label="Telegram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-secondary/50 text-text-secondary hover:text-text-primary hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-secondary/50 text-text-secondary hover:text-text-primary hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
                aria-label="Discord"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Token Scanner
                </Link>
              </li>
              <li>
                <a
                  href="https://t.me/rugsolinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Telegram Bot
                </a>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/alerts"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Real-Time Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/scoring"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Scoring Methodology
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="py-6 border-t border-border-color/30">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">250K+</p>
              <p className="text-xs text-text-muted mt-0.5">Tokens Scanned</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">12K+</p>
              <p className="text-xs text-text-muted mt-0.5">Rugs Detected</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">$48M+</p>
              <p className="text-xs text-text-muted mt-0.5">User Funds Protected</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">99.7%</p>
              <p className="text-xs text-text-muted mt-0.5">Detection Accuracy</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border-color/30 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} RugSol. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="md:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 max-md:opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-text-muted">All systems operational</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-muted/60 font-mono">v2.4.1</span>
            <span className="text-border-color">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-text-muted/80" viewBox="0 0 397.7 311.7" fill="currentColor">
                <path d="M311.9 311.7H64.1c-1.4 0-2.6-.7-3.3-1.9s-.7-2.6 0-3.8L185 2.1c1.4-2.5 5-2.5 6.4 0L315.2 306c.7 1.2.7 2.6 0 3.8s-1.9 1.9-3.3 1.9z" />
              </svg>
              <span className="text-[10px] text-text-muted/60">Built on Solana</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pb-6">
          <p className="text-[11px] text-text-muted/50 leading-relaxed max-w-4xl">
            RugSol provides on-chain security analysis for informational purposes only.
            Nothing on this platform constitutes financial, investment, legal, or tax advice.
            Token scores and risk assessments are algorithmically generated and should not be
            the sole basis for any investment decision. Always do your own research (DYOR).
            Past detection performance does not guarantee future results. By using RugSol,
            you agree to our Terms of Service and acknowledge the inherent risks of
            cryptocurrency trading.
          </p>
        </div>
      </div>
    </footer>
  );
}
