import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — RugSol",
  description: "Learn how to use RugSol token scanner and integrate with the API.",
};

const quickLinks = [
  {
    title: "Getting Started",
    desc: "Learn the basics of scanning tokens and reading results.",
    href: "#getting-started",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Scoring System",
    desc: "Understand how risk scores and letter grades are calculated.",
    href: "/scoring",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "API Reference",
    desc: "Integrate RugSol scanning into your own applications.",
    href: "/api-docs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "Telegram Bot",
    desc: "Set up and use the RugSol bot in Telegram.",
    href: "#telegram",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Documentation
            </h1>
            <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
              Everything you need to use RugSol effectively — from basic scanning
              to API integration.
            </p>
          </div>

          {/* Quick Links */}
          <section className="mb-16">
            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href} className="glass-card p-5 rounded-2xl flex gap-4 hover:border-[var(--silver-accent)]/30 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center shrink-0 silver-accent group-hover:bg-[var(--silver-accent)]/20 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-[var(--silver-accent)] transition-colors">{link.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Getting Started</h2>
            <p className="text-sm text-text-secondary mb-8">Learn how to scan your first token in seconds.</p>

            <div className="space-y-4">
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono silver-accent tracking-widest mt-0.5">01</span>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Find a Token Address</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Copy the mint address of any Solana SPL token. You can find this on Solscan, Birdeye,
                      DexScreener, or directly from the token&apos;s official channels. The address is a base58
                      string, typically 32-44 characters long.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono silver-accent tracking-widest mt-0.5">02</span>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Paste & Scan</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Paste the address into the search bar on the RugSol homepage and click Scan. The analysis
                      typically completes in 3-8 seconds depending on the token&apos;s complexity and number
                      of holders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono silver-accent tracking-widest mt-0.5">03</span>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Read the Report</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Your scan result includes: a 0-100 risk score with letter grade, individual security check
                      results (pass/fail/warning), top holder distribution chart, liquidity information, and
                      a list of detected risk factors with explanations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Understanding Results */}
          <section id="results" className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Understanding Results</h2>
            <p className="text-sm text-text-secondary mb-8">What each section of the scan report tells you.</p>

            <div className="space-y-4">
              {[
                {
                  title: "Score & Grade",
                  content: "The overall risk score (0-100) summarizes all checks into a single number. Higher is safer. The letter grade (A through F) provides a quick visual indicator. Critical failures like honeypot detection automatically result in an F grade regardless of other factors.",
                },
                {
                  title: "Security Checks",
                  content: "Each check shows a pass (green), warning (yellow), or fail (red) status. Hover over any check for a detailed explanation. Checks include: mint authority, freeze authority, top holder concentration, liquidity depth, honeypot test, token age, metadata mutability, and more.",
                },
                {
                  title: "Holder Distribution",
                  content: "The top 10 holders chart shows what percentage of the total supply is held by the largest wallets. High concentration (e.g., one wallet holding 50%+) is a major risk factor. Known program accounts (like Raydium pools) are labeled separately.",
                },
                {
                  title: "Risk Factors",
                  content: "The penalty list shows exactly which checks failed and how many points were deducted. This helps you understand which specific risks are present. A token might score well overall but still have one concerning factor worth noting.",
                },
              ].map((item) => (
                <div key={item.title} className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Telegram Bot */}
          <section id="telegram" className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Telegram Bot</h2>
            <p className="text-sm text-text-secondary mb-8">Scan tokens directly from Telegram without visiting the website.</p>

            <div className="glass-card p-6 rounded-2xl">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Usage</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    Send a token mint address directly to{" "}
                    <a href="https://t.me/rugsolinfobot" target="_blank" rel="noopener noreferrer" className="text-text-primary underline underline-offset-2 decoration-[var(--silver-accent)]/50 hover:decoration-[var(--silver-accent)]">
                      @rugsolinfobot
                    </a>{" "}
                    and receive an instant security report.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Group Integration</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Add the bot to any Telegram group. Members can paste token addresses and the bot will
                    automatically respond with a security summary. Great for trading groups and alpha channels.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="https://t.me/rugsolinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                  >
                    Open Telegram Bot
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-2">FAQ</h2>
            <p className="text-sm text-text-secondary mb-8">Frequently asked questions.</p>

            <div className="space-y-4">
              {[
                {
                  q: "Is RugSol free to use?",
                  a: "Yes. The web scanner and Telegram bot are free for all users with no account required.",
                },
                {
                  q: "How accurate is the scoring?",
                  a: "Our scoring covers the most common rug pull vectors on Solana. However, no automated tool can guarantee 100% accuracy. Always combine our analysis with your own research.",
                },
                {
                  q: "Does RugSol support tokens on other chains?",
                  a: "Currently, RugSol is Solana-only. We analyze SPL tokens on both DEX platforms and Pump.fun.",
                },
                {
                  q: "Why does a scan take several seconds?",
                  a: "Each scan performs 8+ independent on-chain queries in parallel, including RPC calls, price lookups, and sell simulations. Complex tokens with many holders may take slightly longer.",
                },
                {
                  q: "Can a token's score change over time?",
                  a: "Yes. Token conditions change — authorities can be revoked, liquidity can be removed, holders can accumulate. Always re-scan if significant time has passed since your last check.",
                },
              ].map((item) => (
                <div key={item.q} className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">{item.q}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
