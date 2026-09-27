import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scoring Methodology — RugSol",
  description: "How RugSol calculates token risk scores and letter grades.",
};

const penalties = [
  { check: "Honeypot Detected", points: "-50", severity: "critical", desc: "Sell simulation failed — smart contract or liquidity restricts exiting." },
  { check: "Mint Authority Active", points: "-25", severity: "critical", desc: "Token creator can mint unlimited supply, triggering instant hyper-dilution." },
  { check: "Freeze Authority Active", points: "-15", severity: "high", desc: "Creator retains freeze capability on holder token accounts." },
  { check: "Top 10 Holders > 80%", points: "-50", severity: "high", desc: "Severe concentration — small ring of wallets controls nearly the entire float." },
  { check: "Top 10 Holders > 50%", points: "-30", severity: "medium", desc: "Elevated risk of coordinated multi-wallet liquidity dump." },
  { check: "Top 10 Holders > 30%", points: "-10", severity: "low", desc: "Moderate concentration threshold, standard in newly deployed tokens." },
  { check: "Liquidity < $1,000", points: "-30", severity: "high", desc: "Critical exit illiquidity — severe slippage and immediate rug exposure." },
  { check: "Liquidity < $5,000", points: "-20", severity: "medium", desc: "Shallow liquidity pool, vulnerable to rapid price crash." },
  { check: "Liquidity < $10,000", points: "-10", severity: "low", desc: "Sub-optimal liquidity depth for standard trade execution." },
  { check: "Token Age < 24h", points: "-15", severity: "medium", desc: "Fresh deployment window — insufficient on-chain telemetry and stability history." },
  { check: "Token Age < 7 days", points: "-5", severity: "low", desc: "Nascent deployment with limited transactional track record." },
  { check: "Mutable Metadata (DEX)", points: "-5", severity: "low", desc: "Token name, ticker, and media URIs can be overwritten post-launch." },
  { check: "LP Not Locked/Burned", points: "-10", severity: "medium", desc: "Liquidity pool tokens can be revoked or withdrawn by deployer." },
  { check: "Dev Sold 100%", points: "-20", severity: "high", desc: "Initial deployer wallet completely liquidated all holdings." },
  { check: "Snipers Detected", points: "-10", severity: "medium", desc: "Wallets purchased in block 0 / genesis transaction via coordinated bundles." },
];

const grades = [
  {
    grade: "A",
    range: "80 — 100",
    label: "VERIFIED SAFE",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    desc: "Passed all core smart contract & authority checks. Deep liquidity, non-freezable, healthy holder distribution.",
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

export default function ScoringPage() {
  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f5f9]">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0e1118] border border-[#1e2433] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase tracking-wider">
                AUDIT ARCHITECTURE SPECIFICATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              SCORING METHODOLOGY
            </h1>
            <p className="text-sm text-[#94a3b8] max-w-3xl leading-relaxed">
              RugSol uses a deterministic penalty deduction engine. Scans evaluate 8+ independent on-chain
              vectors in parallel, deducting points from a base score of 100 with zero-tolerance overrides
              for fatal exploits.
            </p>
          </div>

          {/* How it works */}
          <section className="mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Base Float</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#f8fafc] tabular-nums">100 PTS</p>
                <p className="text-xs text-[#94a3b8] mt-1">Starting baseline score for every analyzed contract</p>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Telemetry Engines</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                </div>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#f8fafc] tabular-nums">8+ VECTORS</p>
                <p className="text-xs text-[#94a3b8] mt-1">Parallel RPC and DEX checks executed simultaneously</p>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Threat Spectrum</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#f8fafc] tabular-nums">GRADE A — F</p>
                <p className="text-xs text-[#94a3b8] mt-1">Deterministic risk classification for trading execution</p>
              </div>
            </div>
          </section>

          {/* Grade Scale */}
          <section className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                  <span className="text-[#38bdf8]">//</span> AUDIT GRADE MATRIX & THRESHOLDS
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1">Calibrated score intervals and their security classification.</p>
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

          {/* Critical Failures */}
          <section className="mb-14">
            <div className="bg-[#0e1118] border border-rose-500/30 bg-rose-500/[0.03] p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-rose-400 tracking-wider uppercase">
                      [CRITICAL OVERRIDE VECTOR] ZERO-TOLERANCE SCAM LOGIC
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    Certain on-chain states trigger an unconditional, hard-stop <strong className="text-rose-400 font-mono">Grade F (Score 0)</strong> override,
                    irrespective of how many points other parameters accumulate. These vectors are: <strong className="text-[#f1f5f9]">Honeypot sell simulation failure</strong> (inability
                    to exit on Raydium/Orca/Jupiter) and <strong className="text-[#f1f5f9]">Active Mint Authority</strong> (ability to infinitely dilute or mint tokens). User capital is deemed at immediate, catastrophic risk.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Penalty Table */}
          <section className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                  <span className="text-[#38bdf8]">//</span> PENALTY DEDUCTION DIRECTORY
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1">Granular point penalties deducted for individual vulnerability vectors.</p>
              </div>
              <span className="text-[10px] font-mono text-[#64748b]">15 AUDIT CHECKS</span>
            </div>

            <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden shadow-xl">
              <div className="hidden sm:grid grid-cols-[100px_90px_200px_1fr] gap-3 px-4 py-2.5 bg-[#121622] border-b border-[#1e2433] text-[10px] font-mono text-[#64748b] uppercase tracking-wider font-semibold">
                <span>Deduction</span>
                <span>Severity</span>
                <span>Vulnerability Check</span>
                <span>Technical Risk Profile</span>
              </div>

              <div className="divide-y divide-[#161b26]">
                {penalties.map((p) => {
                  const severityMap: Record<string, { text: string; border: string; bg: string }> = {
                    critical: { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10" },
                    high: { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
                    medium: { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
                    low: { text: "text-[#94a3b8]", border: "border-[#1e2433]", bg: "bg-[#161b26]" },
                  };
                  const severityConfig = severityMap[p.severity] || severityMap.low;

                  return (
                    <div
                      key={p.check}
                      className="grid grid-cols-1 sm:grid-cols-[100px_90px_200px_1fr] gap-2 sm:gap-3 p-3 sm:px-4 sm:py-2.5 hover:bg-[#121622] transition-colors items-center"
                    >
                      <div className="font-mono text-xs font-bold text-rose-400 tabular-nums">
                        {p.points} PTS
                      </div>

                      <div>
                        <span className={`inline-block font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border font-semibold ${severityConfig.bg} ${severityConfig.text} ${severityConfig.border}`}>
                          {p.severity}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-semibold text-[#f1f5f9]">
                        {p.check}
                      </div>

                      <div className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                        {p.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Platform Differences */}
          <section>
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> PLATFORM ARCHITECTURE ADAPTATIONS
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">Automatic algorithm calibration depending on pool liquidity structure.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2433]">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">DEX Tokens (Raydium / Orca)</h3>
                  <span className="text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">AMM PROTOCOL</span>
                </div>
                <ul className="text-xs text-[#94a3b8] space-y-2 leading-relaxed font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-[#38bdf8]">&gt;</span>
                    <span>Full liquidity depth and quote asset balance analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#38bdf8]">&gt;</span>
                    <span>LP token burn / lock status directly alters score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#38bdf8]">&gt;</span>
                    <span>Mutable Metaplex metadata penalized (-5 PTS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#38bdf8]">&gt;</span>
                    <span>Strict mint & freeze authority revocation enforced</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2433]">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc]">Pump.fun Bonding Curve</h3>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">CURVE ENGINE</span>
                </div>
                <ul className="text-xs text-[#94a3b8] space-y-2 leading-relaxed font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">&gt;</span>
                    <span>Bonding curve completion % replaces standard LP check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">&gt;</span>
                    <span>LP lock check marked N/A prior to Raydium migration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">&gt;</span>
                    <span>Metadata mutability expected by design (no penalty applied)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">&gt;</span>
                    <span>Genesis sniper clusters and dev wallet holding tracked</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
