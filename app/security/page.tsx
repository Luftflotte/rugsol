import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — RugSol",
  description: "Security architecture, operational protocols, and responsible vulnerability reporting for RugSol.",
};

const practices = [
  {
    title: "Encrypted Transport (TLS 1.3)",
    desc: "All traffic between client browsers, API consumers, and RugSol edge nodes is encrypted using TLS 1.3. Strict HTTPS is enforced globally across all endpoints.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Zero Private Key Exposure",
    desc: "RugSol never asks for private keys, seed phrases, or wallet connection permissions. Any domain or interface requesting private credentials under the RugSol name is fraudulent.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Isolated Read-Only RPC Calls",
    desc: "All diagnostic checks execute exclusively via non-mutating getAccountInfo and simulateTransaction RPC calls. RugSol never broadcasts state-changing transactions.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Sanitized Parameter Ingestion",
    desc: "Address inputs undergo strict base58 validation and 32-44 character boundary verification prior to downstream RPC dispatch, preventing injection attempts.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Volumetric Rate Limiting",
    desc: "Heuristic token analysis is bounded by token-bucket rate limiters at edge proxies to safeguard RPC capacity and maintain low latency for active traders.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Non-Custodial Architecture",
    desc: "RugSol operates with complete non-custodial independence. We store zero user balances, escrow no tokens, and require no account registration credentials.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f5f9]">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              SECURITY ARCHITECTURE
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>INFRASTRUCTURE HARDENING</span>
              <span>//</span>
              <span className="text-emerald-400">AUDIT PROTOCOLS</span>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed mt-3">
              Rigorous operational security standards designed for high-frequency algorithmic contract verification.
            </p>
          </div>

          {/* Practices Grid */}
          <section className="mb-12">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> OPERATIONAL SECURITY CONTROLS
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {practices.map((practice) => (
                <div
                  key={practice.title}
                  className="bg-[#0e1118] border border-[#1e2433] p-4 sm:p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors flex gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#121622] border border-[#1e2433] flex items-center justify-center shrink-0">
                    {practice.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1">
                      {practice.title}
                    </h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{practice.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vulnerability Reporting */}
          <section className="mb-12">
            <div className="bg-[#0e1118] border border-[#1e2433] p-5 sm:p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#161b26]">
                <span className="text-xs font-mono font-bold text-[#38bdf8]">SECURITY ADVISORY //</span>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">
                  Responsible Vulnerability Disclosure
                </h2>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
                If you detect a vulnerability, exploit vector, or algorithmic anomaly within RugSol scoring engines, submit details via responsible disclosure channels.
              </p>
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-start gap-2.5 bg-[#121622] p-3 rounded-lg border border-[#1e2433]">
                  <span className="text-[#38bdf8] font-bold">[01]</span>
                  <p className="text-[#94a3b8] font-sans">
                    Submit disclosures via direct message to our verified handle on X (@RugSolScanner).
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-[#121622] p-3 rounded-lg border border-[#1e2433]">
                  <span className="text-[#38bdf8] font-bold">[02]</span>
                  <p className="text-[#94a3b8] font-sans">
                    Provide token address, exact RPC reproduction steps, and technical impact assessment.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-[#121622] p-3 rounded-lg border border-[#1e2433]">
                  <span className="text-[#38bdf8] font-bold">[03]</span>
                  <p className="text-[#94a3b8] font-sans">
                    Our engineering team triages submissions within 48 hours and provides remediation timelines.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section>
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> PRODUCTION INFRASTRUCTURE
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Deployment Edge", value: "Global Vercel Edge", detail: "Distributed low-latency PoPs" },
                { label: "Solana RPC Tier", value: "Helius Dedicated Nodes", detail: "Direct validator websocket streams" },
                { label: "Target Availability", value: "99.95% Operational SLA", detail: "Continuous synthetic monitoring" },
              ].map((item) => (
                <div key={item.label} className="bg-[#0e1118] border border-[#1e2433] p-4 rounded-xl text-center">
                  <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm font-mono font-bold text-[#f8fafc] mb-0.5">{item.value}</p>
                  <p className="text-[11px] text-[#94a3b8]">{item.detail}</p>
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
