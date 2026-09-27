import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const securityChecks = [
  {
    title: "Authority Analysis",
    desc: "Detects active mint and freeze authorities that could be exploited to print tokens or freeze wallets.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    title: "Holder Distribution",
    desc: "Analyzes top 10 holders, concentration risk, and identifies wallet types to flag insider accumulation.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Honeypot Detection",
    desc: "Simulates a sell transaction via Jupiter to verify that holders can actually sell their tokens.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Liquidity Analysis",
    desc: "Checks DEX pool sizes, LP lock/burn status, or Pump.fun bonding curve progress depending on platform.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Sniper & Bundle Detection",
    desc: "Identifies wallets that bought in the same block as deployment and detects coordinated Jito bundles.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Dev Wallet Tracking",
    desc: "Tracks the deployer wallet balance and sell activity to detect insider dumps and linked wallet clusters.",
    icon: (
      <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const grades = [
  {
    grade: "A",
    range: "80 — 100",
    label: "VERIFIED SAFE",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    desc: "Passed core smart contract & authority checks. Deep liquidity, non-freezable, healthy holder distribution.",
  },
  {
    grade: "B",
    range: "60 — 79",
    label: "LOW RISK",
    badgeColor: "bg-lime-500/10 text-lime-400 border-lime-500/30",
    desc: "Minor risk warnings detected (e.g. low token age or moderate concentration). Low exploit probability.",
  },
  {
    grade: "C",
    range: "40 — 59",
    label: "MODERATE RISK",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    desc: "Noticeable risk factors: unlocked liquidity pool, suspicious sniper wallets, or whale concentration.",
  },
  {
    grade: "D",
    range: "20 — 39",
    label: "HIGH RISK",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    desc: "Severe vulnerability vectors: thin liquidity, large deployer holding, or multi-wallet cluster dumping patterns.",
  },
  {
    grade: "F",
    range: "0 — 19",
    label: "CRITICAL / SCAM",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    desc: "Automatic critical override: Honeypot sell simulation failed, active mint authority, or zero liquidity.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f5f9]">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="mb-14">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              UNDERSTAND THE RISK BEFORE YOU TRADE
            </h1>
            <p className="text-sm text-[#94a3b8] max-w-3xl leading-relaxed">
              RugSol analyzes Solana token contracts in real time, executing 8+ independent algorithmic
              security checks to generate a composite risk score (0-100). No registration or account setup required.
            </p>
          </div>

          {/* How it works */}
          <section className="mb-14">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> AUDIT WORKFLOW
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">From token mint address to full forensic verification report in milliseconds.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { step: "01", title: "Target Identification", desc: "Paste any Solana mint address, Raydium pair, or Pump.fun bonding curve token." },
                { step: "02", title: "Parallel RPC Scan", desc: "Direct queries to Helius RPC, DexScreener, Jupiter routing, and on-chain token state." },
                { step: "03", title: "Forensic Synthesis", desc: "Receive an instant 0-100 risk score, letter grade, and detailed breakdown of each vulnerability." },
              ].map((item) => (
                <div key={item.step} className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-[#38bdf8] tracking-widest">[{item.step}]</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1e2433]" />
                  </div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-2">{item.title}</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Security Checks */}
          <section className="mb-14">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> INTEGRATED TELEMETRY VECTORS
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">Multi-angle contract verification executed simultaneously without blocking scanner throughput.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {securityChecks.map((check) => (
                <div key={check.title} className="bg-[#0e1118] border border-[#1e2433] p-4 rounded-xl hover:border-[#38bdf8]/40 transition-colors flex gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#121622] border border-[#1e2433] flex items-center justify-center shrink-0">
                    {check.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1">{check.title}</h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{check.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Scoring System */}
          <section className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                  <span className="text-[#38bdf8]">//</span> AUDIT SCORING ARCHITECTURE
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Algorithmic risk evaluation starting at 100 points. Penalties deduct points; critical exploits trigger an automatic Grade F.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#64748b] bg-[#0e1118] px-2.5 py-1 rounded border border-[#1e2433] shrink-0 self-start sm:self-auto">
                BASE: 100 PTS
              </span>
            </div>

            <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden shadow-xl">
              <div className="hidden sm:grid grid-cols-[110px_110px_150px_1fr] gap-3 px-4 py-2.5 bg-[#121622] border-b border-[#1e2433] text-[10px] font-mono text-[#64748b] uppercase tracking-wider font-semibold">
                <span>Grade</span>
                <span>Score Range</span>
                <span>Threat Verdict</span>
                <span>Audit Criteria</span>
              </div>

              <div className="divide-y divide-[#161b26]">
                {grades.map((g) => (
                  <div
                    key={g.grade}
                    className="grid grid-cols-1 sm:grid-cols-[110px_110px_150px_1fr] gap-2 sm:gap-3 p-3.5 sm:px-4 sm:py-3 hover:bg-[#121622] transition-colors items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-0.5 rounded border uppercase tracking-wider ${g.badgeColor}`}>
                        Grade {g.grade}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-[#f8fafc] tabular-nums font-semibold">
                      {g.range} PTS
                    </div>

                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#e2e8f0]">
                        {g.label}
                      </span>
                    </div>

                    <div className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                      {g.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Platform Support */}
          <section className="mb-14">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> PLATFORM RECOGNITION MATRIX
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">Automatic liquidity engine identification and tailored vulnerability profiling.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2433]">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">DEX Pools (Raydium / Orca / Meteora)</h3>
                  <span className="text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">LIVE POOL</span>
                </div>
                <ul className="text-xs text-[#94a3b8] space-y-2 leading-relaxed font-mono">
                  <li className="flex items-start gap-2"><span className="text-[#38bdf8]">&gt;</span>Full liquidity depth and quote pool balance</li>
                  <li className="flex items-start gap-2"><span className="text-[#38bdf8]">&gt;</span>LP token lock & burn verification</li>
                  <li className="flex items-start gap-2"><span className="text-[#38bdf8]">&gt;</span>Mint and freeze authority revocation audit</li>
                  <li className="flex items-start gap-2"><span className="text-[#38bdf8]">&gt;</span>Mutable metadata flagged as security vector</li>
                </ul>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2433]">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">Pump.fun Bonding Curve</h3>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">CURVE STATE</span>
                </div>
                <ul className="text-xs text-[#94a3b8] space-y-2 leading-relaxed font-mono">
                  <li className="flex items-start gap-2"><span className="text-purple-400">&gt;</span>Bonding curve progress and SOL remaining telemetry</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">&gt;</span>Curve lock state monitored in real-time</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">&gt;</span>Raydium migration readiness detection</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">&gt;</span>Genesis sniper bundle & dev dump analytics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="mb-14">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> PROGRAMMATIC INTEGRATION
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">Connect RugSol intelligence into your automated trading execution layer.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#121622] border border-[#1e2433] flex items-center justify-center text-[#38bdf8]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">REST Scan API</h3>
                    <span className="text-[10px] font-mono text-[#64748b]">HTTP POST /api/scan</span>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
                  Send a token mint address to receive comprehensive risk score, findings, and authority flags as standardized JSON.
                </p>
                <p className="text-[11px] font-mono text-[#38bdf8]">Latency: &lt;100ms via optimized Solana RPC nodes</p>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#121622] border border-[#1e2433] flex items-center justify-center text-purple-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">Trading Bot Webhooks</h3>
                    <span className="text-[10px] font-mono text-[#64748b]">Event-driven triggers</span>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
                  Filter new token deployments, bonding curve migrations, and liquidity unlock events before executing automated buy transactions.
                </p>
                <p className="text-[11px] font-mono text-purple-400">Targeted for custom sniper and MEV bots</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl p-8 sm:p-10">
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#f8fafc] mb-2 uppercase tracking-wide">
                INITIALIZE TOKEN SECURITY AUDIT
              </h2>
              <p className="text-xs text-[#94a3b8] mb-6 max-w-md mx-auto leading-relaxed">
                Paste any Solana contract address or Raydium pair into the terminal command bar for instant diagnosis.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#38bdf8] text-[#08090d] hover:bg-[#38bdf8]/90 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#38bdf8]/20"
              >
                Launch Terminal
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
