import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — RugSol",
  description: "Important operational and risk disclaimers regarding RugSol token security analysis.",
};

const disclaimerSections = [
  {
    index: "01",
    title: "No Infallibility of Algorithmic Heuristics",
    content:
      "Risk scores (0-100), letter grades (A-F), and security verdicts are computed algorithmically from snapshot on-chain data. They reflect a point-in-time assessment. A Grade A rating does not certify financial viability or guarantee safety. Conversely, a Grade D/F does not conclusively establish malicious intent. On-chain variables can shift within milliseconds.",
  },
  {
    index: "02",
    title: "Scope & Limitations of On-Chain Scanning",
    content:
      "RugSol monitors structural smart contract vectors: mint/freeze authority revocation, LP lock/burn state, holder concentration, and automated Jupiter sell simulation. Off-chain risks—such as developer impersonation, social engineering, off-chain treasury drainage, or coordinated syndicate dumping—fall outside algorithmic contract scanning.",
  },
  {
    index: "03",
    title: "Upstream Dependency & Data Integrity",
    content:
      "Analysis relies upon distributed infrastructure: Helius RPCs, Birdeye market feeds, Jupiter swap routing, and Solana mainnet validator consensus. RugSol does not control network latency, split-second RPC drops, or upstream indexer inconsistencies.",
  },
  {
    index: "04",
    title: "Total Assumption of Capital Risk",
    content:
      "By interacting with the Platform, you acknowledge: (a) cryptocurrency trading carries extreme volatility and total risk of capital loss; (b) past on-chain stability does not guarantee future solvency; (c) users bear sole accountability for execution; (d) RugSol incurs no liability for trading losses.",
  },
  {
    index: "05",
    title: "Zero Commercial Endorsement",
    content:
      "The indexing or display of any token address within RugSol search histories or recent scans does not constitute an endorsement, token sponsorship, or audit certification. All contract analyses are triggered strictly on-demand by user queries.",
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              RISK DISCLAIMER
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>LEGAL SPECIFICATION V2.0</span>
              <span>//</span>
              <span>EFFECTIVE: FEBRUARY 1, 2026</span>
              <span>//</span>
              <span className="text-amber-400">NON-FINANCIAL ADVISORY DISCLOSURE</span>
            </div>
          </div>

          {/* Main Warning Banner */}
          <div className="bg-[#0e1118] border border-amber-500/30 bg-amber-500/[0.03] p-5 rounded-xl mb-8 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-mono font-bold text-sm mt-0.5">
              !
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                MANDATORY REGULATORY & TRADING NOTICE
              </h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                RugSol is strictly an on-chain forensic analytics software instrument. It does <strong className="text-[#f1f5f9]">not</strong> provide financial, investment, or legal advice. Trading Solana tokens involves severe market volatility and potential for complete loss of capital. Always conduct independent technical due diligence prior to executing trades.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {disclaimerSections.map((section) => (
              <div
                key={section.index}
                className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#161b26]">
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">
                    {section.index} //
                  </span>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">
                    {section.title}
                  </h3>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Return CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#38bdf8] text-[#08090d] hover:bg-[#38bdf8]/90 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#38bdf8]/20"
            >
              Return to Terminal
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
