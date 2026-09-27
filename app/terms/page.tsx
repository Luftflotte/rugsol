import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RugSol",
  description: "Terms of Service and operational protocol for using the RugSol platform.",
};

const sections = [
  {
    index: "01",
    title: "Acceptance of Terms",
    content:
      'By accessing or querying RugSol ("the Platform"), including through our web interface, REST APIs, or automated integrations, you enter into a binding agreement governed by these Terms of Service. If you do not consent to all provisions herein, discontinue use immediately. We reserve the unilateral right to update these terms at any time; your continued interaction with the Platform represents full acceptance of revisions.',
  },
  {
    index: "02",
    title: "Description of Service",
    content:
      "RugSol provides programmatic, real-time security analysis for Solana blockchain tokens. The Platform executes parallel algorithmic evaluations covering mint/freeze authorities, holder concentration curves, DEX liquidity depth, lock/burn telemetry, and automated Jupiter sell simulation (honeypot detection). All outputs represent static, snapshot-in-time diagnostics compiled solely for technical research and informational purposes.",
  },
  {
    index: "03",
    title: "No Financial Advice",
    content:
      "Nothing generated, displayed, or communicated by the Platform constitutes financial, legal, investment, or tax counsel. Security scores (0-100), letter grades (A-F), and risk flags are algorithmic outputs derived from public on-chain heuristics and must not serve as the basis for trading or capital allocation decisions. You assume 100% responsibility and liability for your financial operations.",
  },
  {
    index: "04",
    title: "Accuracy of Telemetry",
    content:
      "While our heuristic engines query verified RPC endpoints, RugSol provides no warranties regarding the accuracy, completeness, or infallibility of any metric. Smart contract exploit vectors evolve rapidly, and malicious actors actively obfuscate fraudulent logic. A Grade A rating does not guarantee security, nor does a low score indisputably prove illicit intent.",
  },
  {
    index: "05",
    title: "User Obligations & Fair Use",
    content:
      "Users agree to interact with the Platform strictly in compliance with applicable laws and agree not to: (a) reverse-engineer or disrupt internal scoring engines; (b) launch volumetric denial-of-service attacks or bypass rate limit controls; (c) falsify or misattribute audit report data; (d) utilize Platform telemetry to coordinate market abuse or pump-and-dump operations.",
  },
  {
    index: "06",
    title: "API Access & Rate Quotas",
    content:
      "Public REST API endpoints (/api/scan, /api/stats) are governed by automated rate limiters. We reserve the authority to throttle, blacklist, or terminate access for IP addresses or entities demonstrating abusive traffic patterns or excessive concurrent RPC strain. Commercial high-frequency consumption requires prior operational approval.",
  },
  {
    index: "07",
    title: "Intellectual Property Rights",
    content:
      "All proprietary software, algorithm definitions, user interface designs, and brand trademarks remain the exclusive intellectual property of RugSol. You are permitted to share individual contract audit reports and diagnostic cards provided appropriate attribution to RugSol is preserved.",
  },
  {
    index: "08",
    title: "Limitation of Absolute Liability",
    content:
      'The Platform is provided on an "AS IS" and "AS AVAILABLE" basis without express or implied warranties. In no event shall RugSol, its developers, or infrastructure operators be liable for direct, indirect, incidental, or catastrophic capital losses resulting from smart contract exploits, rug pulls, or trading actions taken in reliance upon Platform outputs.',
  },
  {
    index: "09",
    title: "Third-Party Data Dependencies",
    content:
      "Platform operations depend upon external distributed infrastructure, including Helius RPCs, Jupiter Aggregator routing, Birdeye market data, and Solana blockchain validator consensus. RugSol disclaims all liability for outages, latency degradation, or data inaccuracies originating from upstream third-party services.",
  },
  {
    index: "10",
    title: "Service Modification & Termination",
    content:
      "We reserve the discretionary authority to modify, restrict, or decommission any Platform feature or endpoint without prior notice or indemnity. Upon termination, authorization to query RugSol telemetry ceases with immediate effect.",
  },
  {
    index: "11",
    title: "Governing Jurisdiction",
    content:
      "These Terms shall be interpreted and enforced in accordance with standard international commercial arbitration principles. Any claims or disputes arising under these provisions shall be submitted to confidential, binding arbitration.",
  },
  {
    index: "12",
    title: "Official Communications",
    content:
      "Direct technical inquiries, vulnerability disclosures, or terms clarification requests to our verified communications channels via X (@RugSolScanner).",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              TERMS OF SERVICE
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>SPECIFICATION V2.1</span>
              <span>//</span>
              <span>EFFECTIVE: FEBRUARY 1, 2026</span>
              <span>//</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ACTIVE LEGAL PROTOCOL
              </span>
            </div>
          </div>

          {/* Critical Risk & Non-Custodial Advisory */}
          <div className="bg-[#0e1118] border border-amber-500/30 bg-amber-500/[0.02] p-4 sm:p-5 rounded-xl mb-8 flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-mono font-bold text-xs mt-0.5">
              !
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
                DISCLAIMER & NON-CUSTODIAL NATURE
              </h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                RugSol is an automated blockchain analytics instrument. Scores and grades represent point-in-time heuristic estimations and do not constitute financial advice, audit guarantees, or investment recommendations. Trading Solana tokens involves catastrophic risk of loss.
              </p>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-3">
            {sections.map((section) => (
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

          {/* Quick Contact & Verification */}
          <div className="mt-8 p-4 bg-bg-card border border-border-color rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-text-muted">
            <div>
              <span>OFFICIAL DISCLOSURES & COMMUNICATIONS</span>
            </div>
            <div className="flex items-center gap-4 text-[#38bdf8]">
              <a
                href="https://x.com/RugSolScanner"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-colors"
              >
                X: @RugSolScanner
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
