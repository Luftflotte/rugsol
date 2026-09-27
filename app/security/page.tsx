import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — RugSol",
  description: "Security practices and vulnerability reporting for RugSol.",
};

const practices = [
  {
    title: "Encrypted Connections",
    desc: "All traffic to and from RugSol is encrypted using TLS 1.3. We enforce HTTPS across all endpoints and API routes.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "No Wallet Access",
    desc: "RugSol never requests wallet connections, private keys, or seed phrases. We only read public on-chain data. Any site claiming to be RugSol and asking for wallet access is fraudulent.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Read-Only Analysis",
    desc: "Our scanning engine performs read-only operations against the Solana blockchain. We never submit transactions, modify token state, or interact with smart contracts on your behalf.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Input Validation",
    desc: "All user inputs, including token addresses, are validated and sanitized before processing. We enforce strict parameter validation on all API endpoints to prevent injection attacks.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Rate Limiting",
    desc: "API endpoints are protected with rate limiting to prevent abuse and ensure fair access for all users. Excessive requests are automatically throttled.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Minimal Data Collection",
    desc: "We collect no personal information, require no accounts, and store no wallet data. Our privacy-first approach means we only process what's necessary to deliver scan results.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Trust & Safety</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Security
            </h1>
            <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
              Security is foundational to everything we build. Here&apos;s how we protect
              the platform and your data.
            </p>
          </div>

          {/* Practices Grid */}
          <section className="mb-16">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Security Practices</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {practices.map((practice) => (
                <div key={practice.title} className="glass-card p-5 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center shrink-0 silver-accent">
                    {practice.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{practice.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{practice.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vulnerability Reporting */}
          <section className="mb-16">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--silver-accent)]/20">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Vulnerability Reporting</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                If you discover a security vulnerability in RugSol, we encourage responsible disclosure.
                Please report vulnerabilities through our official channels rather than publicly disclosing them.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-sm silver-accent font-mono">01</span>
                  <p className="text-sm text-text-secondary">
                    Contact us via Telegram or GitHub with a detailed description of the vulnerability.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm silver-accent font-mono">02</span>
                  <p className="text-sm text-text-secondary">
                    Include steps to reproduce, potential impact, and any proof-of-concept if available.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm silver-accent font-mono">03</span>
                  <p className="text-sm text-text-secondary">
                    We will acknowledge receipt within 48 hours and provide updates on the remediation timeline.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-6">Infrastructure</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Hosting", value: "Vercel Edge Network", detail: "Global CDN with auto-scaling" },
                { label: "RPC Provider", value: "Helius", detail: "Enterprise-grade Solana RPC" },
                { label: "Uptime Target", value: "99.9%", detail: "Monitored 24/7" },
              ].map((item) => (
                <div key={item.label} className="glass-card p-5 rounded-2xl text-center">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-base font-semibold text-text-primary mb-0.5">{item.value}</p>
                  <p className="text-xs text-text-secondary">{item.detail}</p>
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
