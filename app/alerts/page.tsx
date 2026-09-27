import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real-Time Alerts — RugSol",
  description: "Get instant event notifications when on-chain token security conditions shift.",
};

const alertTypes = [
  {
    title: "Authority Alterations",
    desc: "Instant trigger when a token mint or freeze authority is transferred or modified.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    title: "Liquidity Pool Drains",
    desc: "Alert when AMM liquidity reserves drop below configured depth thresholds or LP tokens unlock.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
  },
  {
    title: "Whale Wallet Dumps",
    desc: "Track large holder liquidation events and multi-wallet cluster distributions.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Deployer Wallet Activity",
    desc: "Monitor deployer wallet sales, mint operations, and linked cluster fund routing.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Score Threshold Drift",
    desc: "Notifications triggered when algorithmic safety ratings cross risk grade boundaries.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Honeypot Exploit Trigger",
    desc: "Immediate emergency alert if swap simulation reverts, preventing exit liquidity entrapment.",
    icon: (
      <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
];

const channels = [
  { name: "Webhooks", desc: "Low-latency JSON payloads dispatched to custom trading bot servers." },
  { name: "Discord", desc: "Embed notifications into private alpha and trading group channels." },
  { name: "Browser Push", desc: "Desktop notifications for mission-critical risk downgrades." },
  { name: "Email Relay", desc: "Digest alerts and audit summaries dispatched on schedule." },
];

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f5f9]">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header - No pill badge */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              REAL-TIME SECURITY ALERTS
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>EVENT STREAMING ENGINE</span>
              <span>//</span>
              <span className="text-[#38bdf8]">24/7 ON-CHAIN SURVEILLANCE</span>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed mt-3">
              Automated on-chain event listeners monitoring liquidity shifts, authority revocations, and honeypot locks in real-time.
            </p>
          </div>

          {/* Alert Types */}
          <section className="mb-12">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> MONITORED VECTORS
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {alertTypes.map((alert) => (
                <div
                  key={alert.title}
                  className="bg-[#0e1118] border border-[#1e2433] p-4 sm:p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors flex gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#121622] border border-[#1e2433] flex items-center justify-center shrink-0">
                    {alert.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Channels */}
          <section className="mb-12">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> DISPATCH CHANNELS
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {channels.map((ch) => (
                <div key={ch.name} className="bg-[#0e1118] border border-[#1e2433] p-4 rounded-xl text-center">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1">
                    {ch.name}
                  </h3>
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Integration CTA */}
          <section className="text-center">
            <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-8 sm:p-10">
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#f8fafc] mb-2 uppercase tracking-wide">
                CONFIGURE EVENT DISPATCH
              </h2>
              <p className="text-xs text-[#94a3b8] mb-6 max-w-md mx-auto leading-relaxed">
                Connect programmatic webhook endpoints via our developer REST API.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/api-docs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#38bdf8] text-[#08090d] hover:bg-[#38bdf8]/90 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#38bdf8]/20"
                >
                  View API Specs
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#121622] border border-[#1e2433] text-[#f8fafc] hover:bg-[#161b26] font-mono text-xs transition-colors"
                >
                  Documentation
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
