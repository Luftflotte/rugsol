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
    desc: "Learn the basics of executing token scans and interpreting telemetry.",
    href: "#getting-started",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Scoring Methodology",
    desc: "Full directory of point penalties and vulnerability thresholds.",
    href: "/scoring",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "REST API Reference",
    desc: "Integrate automated token scanning directly into trading bots.",
    href: "/api-docs",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "About RugSol",
    desc: "Architecture overview and supported decentralized platforms.",
    href: "/about",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              DOCUMENTATION
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>RUGSOL TELEMETRY DOCS</span>
              <span>//</span>
              <span>SOLANA MAINNET-BETA</span>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed mt-3">
              Technical documentation for RugSol on-chain diagnostics, scoring heuristics, and automated bot integrations.
            </p>
          </div>

          {/* Quick Links */}
          <section className="mb-12">
            <div className="grid sm:grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="bg-[#0e1118] border border-[#1e2433] p-4 sm:p-5 rounded-xl flex gap-3.5 hover:border-[#38bdf8]/40 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#121622] border border-[#1e2433] flex items-center justify-center shrink-0">
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1 group-hover:text-[#38bdf8] transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="mb-12">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> GETTING STARTED
              </h2>
            </div>

            <div className="space-y-3">
              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#161b26]">
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">01 //</span>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">Identify Contract Mint</h3>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Copy any 32-44 character base58 Solana token mint address from DexScreener, Solscan, Birdeye, or Pump.fun.
                </p>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#161b26]">
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">02 //</span>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">Execute Diagnostic Query</h3>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Paste the address into the terminal command bar (or press <kbd className="px-1 py-0.5 rounded bg-[#161b26] text-[#38bdf8] font-mono text-[10px]">Ctrl+K</kbd>) and initialize analysis. Direct RPC calls return in 3-6 seconds.
                </p>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#161b26]">
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">03 //</span>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">Synthesize Findings</h3>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Review the composite security score, honeypot sell simulation verdict, LP burn status, and top 10 wallet distribution percentages.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Is RugSol completely free to use?",
                  a: "Yes. Both the web terminal and the public REST API (/api/scan) are freely accessible without account registration or API keys.",
                },
                {
                  q: "How does the honeypot detection work?",
                  a: "We simulate on-chain sell swaps using Jupiter Aggregator routing and local transaction simulation to confirm whether tokens can be liquidated without contract revert.",
                },
                {
                  q: "Does RugSol analyze Pump.fun bonding curves?",
                  a: "Yes. The scanner decodes bonding curve accounts directly from Solana storage, calculating migration progress %, virtual liquidity, and genesis sniper accumulation.",
                },
              ].map((item) => (
                <div key={item.q} className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1.5">{item.q}</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{item.a}</p>
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
