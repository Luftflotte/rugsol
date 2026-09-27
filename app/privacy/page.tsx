import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RugSol",
  description: "Privacy Policy and on-chain data collection guidelines for the RugSol platform.",
};

const sections = [
  {
    index: "01",
    title: "Zero Personal Data Collection",
    content:
      "RugSol is designed with privacy-first architecture. We do not require accounts, logins, email addresses, phone numbers, or identity verification. The only data processed is public on-chain telemetry associated with the Solana token addresses queried through our interface.",
  },
  {
    index: "02",
    title: "Telemetry & Usage Analytics",
    content:
      "We may monitor aggregate, anonymized infrastructure telemetry including page visits, request rates, network latency, and basic geographic clusters. This operational logging is used exclusively to optimize RPC routing and prevent abusive bot saturation. No usage telemetry is mapped to individual user identities.",
  },
  {
    index: "03",
    title: "Public Blockchain Data",
    content:
      "Queries executed on the Platform interact with the public Solana ledger. All metrics (holder balances, authority states, liquidity pools, transaction volumes) exist in the public domain. RugSol does not store, request, or handle private keys, mnemonic phrases, or transaction execution signatures.",
  },
  {
    index: "04",
    title: "Client-Side Local Storage",
    content:
      "Minimal browser local storage is utilized to persist user interface preferences (recent scans and command bar history). No cross-site advertising or third-party behavioral cookies are installed. Users can clear local cached entries at any time via browser settings.",
  },
  {
    index: "05",
    title: "Third-Party Data Providers",
    content:
      "The Platform routes queries through upstream infrastructure providers including Helius RPC, Birdeye, DexScreener, and Jupiter. Only public token mint hashes are forwarded to execute diagnostics. No personal telemetry or IP fingerprints are shared with third-party vendors for commercial monetization.",
  },
  {
    index: "06",
    title: "Cache TTL & Data Purging",
    content:
      "Scan outputs are retained in volatile in-memory cache for up to 300 seconds to minimize redundant RPC strain. RugSol does not preserve permanent transaction histories linked to specific IP addresses. Expired cache entries are continuously purged.",
  },
  {
    index: "07",
    title: "Security Protocols",
    content:
      "All communications between client terminals and RugSol infrastructure are secured via TLS/HTTPS encryption. While rigorous infrastructure hardening is implemented, no internet-connected platform can guarantee absolute immunity from interception.",
  },
  {
    index: "08",
    title: "Policy Revisions",
    content:
      "We may calibrate this Privacy Policy to reflect architectural or protocol enhancements. Updates become operational upon publication. Continued use of the scanner constitutes acknowledgment of updated terms.",
  },
  {
    index: "09",
    title: "Official Privacy Contact",
    content:
      "Inquiries regarding data practices or telemetry disclosures may be directed through our verified technical channel on X (@RugSolScanner) or our open source repository.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f5f9]">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              PRIVACY POLICY
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>SPECIFICATION V1.4</span>
              <span>//</span>
              <span>EFFECTIVE: FEBRUARY 1, 2026</span>
              <span>//</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                NON-CUSTODIAL & NO-ACCOUNT ARCHITECTURE
              </span>
            </div>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="bg-[#0e1118] border border-emerald-500/30 bg-emerald-500/[0.02] p-4 sm:p-5 rounded-xl mb-8 flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-mono font-bold text-xs mt-0.5">
              ✓
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
                ANONYMOUS & PRIVATE BY DESIGN
              </h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                RugSol does not require registration, email collection, or wallet signature verification for scanning. We only query public Solana blockchain data.
              </p>
            </div>
          </div>

          {/* Sections */}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
