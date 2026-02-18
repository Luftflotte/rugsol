import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const securityChecks = [
  {
    title: "Authority Analysis",
    desc: "Detects active mint and freeze authorities that could be exploited to print tokens or freeze wallets.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    title: "Holder Distribution",
    desc: "Analyzes top 10 holders, concentration risk, and identifies wallet types to flag insider accumulation.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Honeypot Detection",
    desc: "Simulates a sell transaction via Jupiter to verify that holders can actually sell their tokens.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Liquidity Analysis",
    desc: "Checks DEX pool sizes, LP lock/burn status, or Pump.fun bonding curve progress depending on platform.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Sniper & Bundle Detection",
    desc: "Identifies wallets that bought in the same block as deployment and detects coordinated Jito bundles.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Dev Wallet Tracking",
    desc: "Tracks the deployer wallet balance and sell activity to detect insider dumps and linked wallet clusters.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const grades = [
  { grade: "A", range: "80 — 100", label: "Safe", color: "#22c55e" },
  { grade: "B", range: "60 — 79", label: "Low Risk", color: "#84cc16" },
  { grade: "C", range: "40 — 59", label: "Moderate Risk", color: "#eab308" },
  { grade: "D", range: "20 — 39", label: "High Risk", color: "#f97316" },
  { grade: "F", range: "0 — 19", label: "Likely Scam", color: "#ef4444" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-8 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">On-chain security analysis</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="text-text-primary">Understand the risk</span>
              <br />
              <span className="gradient-text">before you trade</span>
            </h1>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              RugSol analyzes Solana tokens in real-time, running 8+ independent security checks
              to produce a risk score from 0 to 100. No sign-up required — full scanning and scoring
              is available without creating an account or logging in.
            </p>
          </div>

          {/* How it works */}
          <section className="mb-20">
            <h2 className="text-xl font-semibold text-text-primary mb-2 px-1">How it works</h2>
            <p className="text-sm text-text-secondary mb-8 px-1">Paste a token address and get a comprehensive report in seconds.</p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Enter address", desc: "Paste any Solana token mint address or Pump.fun token." },
                { step: "02", title: "On-chain scan", desc: "We run parallel checks against the blockchain, Jupiter, DexScreener, and more." },
                { step: "03", title: "Get your score", desc: "Receive a 0-100 risk score, letter grade, and detailed breakdown of every finding." },
              ].map((item) => (
                <div key={item.step} className="glass-card p-5 rounded-2xl">
                  <span className="text-xs font-mono silver-accent tracking-widest">{item.step}</span>
                  <h3 className="text-base font-semibold text-text-primary mt-2 mb-1">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Security Checks */}
          <section className="mb-20">
            <h2 className="text-xl font-semibold text-text-primary mb-2 px-1">Security checks</h2>
            <p className="text-sm text-text-secondary mb-8 px-1">Every scan runs these checks in parallel. Failed checks are flagged but never crash the report.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {securityChecks.map((check) => (
                <div key={check.title} className="glass-card p-5 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center shrink-0 silver-accent">
                    {check.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{check.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{check.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Scoring */}
          <section className="mb-20">
            <h2 className="text-xl font-semibold text-text-primary mb-2 px-1">Scoring system</h2>
            <p className="text-sm text-text-secondary mb-8 px-1">
              Tokens start at 100 points. Each risk factor deducts points. Critical failures like honeypot detection or active mint authority result in an automatic F grade.
            </p>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] text-sm">
                {grades.map((g, i) => (
                  <div key={g.grade} className={`contents ${i < grades.length - 1 ? "[&>*]:border-b [&>*]:border-border-color/30" : ""}`}>
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: g.color }}
                      >
                        {g.grade}
                      </span>
                    </div>
                    <div className="px-4 py-3.5 flex items-center text-text-secondary font-mono text-xs tracking-wider">
                      {g.range}
                    </div>
                    <div className="px-5 py-3.5 flex items-center text-text-secondary text-sm">
                      {g.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Platform Support */}
          <section className="mb-20">
            <h2 className="text-xl font-semibold text-text-primary mb-2 px-1">Platform support</h2>
            <p className="text-sm text-text-secondary mb-8 px-1">The scanner auto-detects the token platform and adjusts checks accordingly.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl">
                <h3 className="text-sm font-semibold text-text-primary mb-2">DEX Tokens</h3>
                <ul className="text-sm text-text-secondary space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Full liquidity pool analysis</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>LP lock & burn verification</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Authority & metadata checks</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Mutable metadata flagged as risk</li>
                </ul>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Pump.fun Tokens</h3>
                <ul className="text-sm text-text-secondary space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Bonding curve progress tracking</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>LP check replaced with curve state</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Metadata mutability expected</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Migration status detection</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="mb-20">
            <h2 className="text-xl font-semibold text-text-primary mb-2 px-1">Integrations</h2>
            <p className="text-sm text-text-secondary mb-8 px-1">Use RugSol programmatically or get alerts in Telegram.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--silver-accent)]/10 flex items-center justify-center silver-accent">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">Public API</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  POST to <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--silver-accent)]/10 text-text-primary font-mono">/api/scan</code> with a token address to get a full security report as JSON.
                </p>
                <p className="text-xs text-text-secondary">No API key required for basic usage.</p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--silver-accent)]/10 flex items-center justify-center silver-accent">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">Telegram Bot</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  Scan tokens directly from Telegram with inline commands. Get instant alerts for your groups.
                </p>
                <p className="text-xs text-text-secondary">Add the bot to any group for real-time monitoring.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="glass-card rounded-2xl p-8 sm:p-12">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">Ready to check a token?</h2>
              <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
                Paste any Solana token address and get an instant security report.
              </p>
              <Link
                href="/"
                className="btn-premium inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
              >
                Start scanning
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
