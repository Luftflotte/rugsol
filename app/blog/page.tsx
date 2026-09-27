import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Intelligence — RugSol",
  description: "Security research, rug pull forensics, and Solana ecosystem vulnerability dispatches from RugSol.",
};

const posts = [
  {
    title: "Anatomy of a Solana Rug Pull: On-Chain Forensic Breakdown",
    excerpt: "A deep dive into malicious exploit patterns on Solana — from mint authority dilation to coordinated LP token removal. Real transaction graphs and bytecode forensics.",
    date: "2026-02-08",
    tag: "RESEARCH",
    readTime: "8 MIN",
  },
  {
    title: "How RugSol Simulates Honeypot Transactions in Sub-Seconds",
    excerpt: "Honeypot detection architecture simulating sell swaps through Jupiter Aggregator routing and local transaction simulation engines.",
    date: "2026-02-03",
    tag: "ENGINEERING",
    readTime: "6 MIN",
  },
  {
    title: "Pump.fun Curve Security: Bonding Telemetry & Migration Risks",
    excerpt: "Analysis of bonding curve mechanics, genesis transaction bundles, virtual liquidity depth, and Raydium migration risks.",
    date: "2026-01-27",
    tag: "ANALYSIS",
    readTime: "5 MIN",
  },
  {
    title: "Block-0 Snipers & Jito MEV Bundles: Detecting Insider Rings",
    excerpt: "Genesis block heuristic algorithms: how we detect coordinated multi-wallet cluster funding and tip accounts on Solana.",
    date: "2026-01-20",
    tag: "RESEARCH",
    readTime: "7 MIN",
  },
  {
    title: "Top-10 Holder Concentration Risk Modeling",
    excerpt: "Distinguishing AMM liquidity reserves and staking contracts from coordinated deployer whale wallets using on-chain graph analysis.",
    date: "2026-01-14",
    tag: "METHODOLOGY",
    readTime: "4 MIN",
  },
  {
    title: "Scoring Engine v2.4: Multi-Wallet Cluster Detection",
    excerpt: "Algorithmic clustering for wallets funded from identical SOL root faucets that masquerade as distributed community holders.",
    date: "2026-01-08",
    tag: "CHANGELOG",
    readTime: "3 MIN",
  },
];

const tagBadgeStyles: Record<string, string> = {
  RESEARCH: "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30",
  ENGINEERING: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  ANALYSIS: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  METHODOLOGY: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  CHANGELOG: "text-[#94a3b8] bg-[#161b26] border-[#1e2433]",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              SECURITY RESEARCH & DISPATCHES
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>RUGSOL THREAT INTELLIGENCE</span>
              <span>//</span>
              <span>ON-CHAIN INCIDENT FORENSICS</span>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed mt-3">
              Technical post-mortems, exploit mechanism analyses, and Solana contract security dispatches.
            </p>
          </div>

          {/* Featured Post */}
          <section className="mb-10">
            <div className="bg-[#0e1118] border border-[#1e2433] p-6 sm:p-7 rounded-xl hover:border-[#38bdf8]/40 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${tagBadgeStyles[posts[0].tag]}`}>
                  {posts[0].tag}
                </span>
                <span className="text-xs font-mono text-[#64748b]">{posts[0].date}</span>
                <span className="text-xs font-mono text-[#64748b]">• {posts[0].readTime} READ</span>
              </div>
              <h2 className="text-lg sm:text-xl font-mono font-bold text-[#f8fafc] mb-2 group-hover:text-[#38bdf8] transition-colors">
                {posts[0].title}
              </h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
                {posts[0].excerpt}
              </p>
              <span className="text-xs font-mono font-semibold text-[#38bdf8] inline-flex items-center gap-1.5">
                READ BRIEFING
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </section>

          {/* All Posts */}
          <section className="mb-12">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> ARCHIVED BRIEFINGS
              </h2>
            </div>

            <div className="space-y-3">
              {posts.slice(1).map((post) => (
                <div
                  key={post.title}
                  className="bg-[#0e1118] border border-[#1e2433] p-4 sm:p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${tagBadgeStyles[post.tag]}`}>
                      {post.tag}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748b]">{post.date}</span>
                    <span className="text-[11px] font-mono text-[#64748b]">• {post.readTime}</span>
                  </div>
                  <h3 className="text-sm font-mono font-bold text-[#f8fafc] mb-1.5 group-hover:text-[#38bdf8] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Threat Intel Dispatch Subscribe */}
          <section className="text-center">
            <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-8 sm:p-10">
              <h2 className="text-xl font-mono font-bold text-[#f8fafc] mb-2 uppercase tracking-wide">
                REAL-TIME THREAT INTEL ON X
              </h2>
              <p className="text-xs text-[#94a3b8] mb-6 max-w-md mx-auto leading-relaxed">
                Follow our official research account for zero-day exploit warnings, deployer cluster dumps, and incident post-mortems.
              </p>
              <a
                href="https://x.com/RugSolScanner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#38bdf8] text-[#08090d] hover:bg-[#38bdf8]/90 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#38bdf8]/20"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow @RugSolScanner
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
