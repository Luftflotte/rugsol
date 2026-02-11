import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scoring Methodology — RugSol",
  description: "How RugSol calculates token risk scores and letter grades.",
};

const penalties = [
  { check: "Honeypot Detected", points: "-50", severity: "critical", desc: "Sell simulation failed — users cannot sell their tokens." },
  { check: "Mint Authority Active", points: "-25", severity: "critical", desc: "Token creator can print unlimited new tokens, diluting holders." },
  { check: "Freeze Authority Active", points: "-15", severity: "high", desc: "Token creator can freeze any wallet, preventing transfers." },
  { check: "Top 10 Holders > 80%", points: "-50", severity: "high", desc: "Extreme concentration — a few wallets control almost all supply." },
  { check: "Top 10 Holders > 50%", points: "-30", severity: "medium", desc: "High concentration risk with potential for coordinated dumps." },
  { check: "Top 10 Holders > 30%", points: "-10", severity: "low", desc: "Moderate concentration, common in newer tokens." },
  { check: "Liquidity < $1,000", points: "-30", severity: "high", desc: "Extremely thin liquidity — high slippage and exit risk." },
  { check: "Liquidity < $5,000", points: "-20", severity: "medium", desc: "Low liquidity pool, significant price impact on trades." },
  { check: "Liquidity < $10,000", points: "-10", severity: "low", desc: "Below-average liquidity for active trading." },
  { check: "Token Age < 24h", points: "-15", severity: "medium", desc: "Very new token — insufficient history to evaluate." },
  { check: "Token Age < 7 days", points: "-5", severity: "low", desc: "Recent token with limited track record." },
  { check: "Mutable Metadata (DEX)", points: "-5", severity: "low", desc: "Token metadata can be changed — name/image may be altered." },
  { check: "LP Not Locked/Burned", points: "-10", severity: "medium", desc: "Liquidity pool can be withdrawn by the creator." },
  { check: "Dev Sold 100%", points: "-20", severity: "high", desc: "Deployer wallet has completely exited their position." },
  { check: "Snipers Detected", points: "-10", severity: "medium", desc: "Wallets bought in the same block as deployment — likely insiders." },
];

const grades = [
  { grade: "A", range: "80 — 100", label: "Safe", color: "#22c55e", desc: "Token passed most security checks. Low risk factors detected." },
  { grade: "B", range: "60 — 79", label: "Caution", color: "#84cc16", desc: "Some minor risk factors present. Review specific warnings." },
  { grade: "C", range: "40 — 59", label: "Risky", color: "#eab308", desc: "Multiple risk factors detected. Exercise significant caution." },
  { grade: "D", range: "20 — 39", label: "High Risk", color: "#f97316", desc: "Serious security concerns identified. High probability of loss." },
  { grade: "F", range: "0 — 19", label: "Likely Scam", color: "#ef4444", desc: "Critical failures detected or extremely high risk. Avoid." },
];

export default function ScoringPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Methodology</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Scoring Methodology
            </h1>
            <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
              A transparent look at how RugSol calculates risk scores. Every penalty
              and threshold is documented here.
            </p>
          </div>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">How Scoring Works</h2>
            <p className="text-sm text-text-secondary mb-8">The algorithm is penalty-based: start at 100, lose points for each risk factor.</p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 rounded-2xl text-center">
                <p className="text-3xl font-bold text-text-primary mb-1">100</p>
                <p className="text-xs text-text-muted">Starting Score</p>
                <p className="text-xs text-text-secondary mt-2">Every token begins with a perfect score</p>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <p className="text-3xl font-bold text-text-primary mb-1">8+</p>
                <p className="text-xs text-text-muted">Security Checks</p>
                <p className="text-xs text-text-secondary mt-2">Independent checks run in parallel</p>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <p className="text-3xl font-bold text-text-primary mb-1">A-F</p>
                <p className="text-xs text-text-muted">Letter Grade</p>
                <p className="text-xs text-text-secondary mt-2">Final score maps to a letter grade</p>
              </div>
            </div>
          </section>

          {/* Grade Scale */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Grade Scale</h2>
            <p className="text-sm text-text-secondary mb-8">Score ranges and their meaning.</p>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_1fr] text-sm">
                {grades.map((g, i) => (
                  <div key={g.grade} className={`contents ${i < grades.length - 1 ? "[&>*]:border-b [&>*]:border-border-color/30" : ""}`}>
                    <div className="px-5 py-4 flex items-center">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: g.color }}
                      >
                        {g.grade}
                      </span>
                    </div>
                    <div className="px-4 py-4 flex items-center text-text-secondary font-mono text-xs tracking-wider">
                      {g.range}
                    </div>
                    <div className="px-4 py-4 flex items-center text-text-primary text-sm font-medium">
                      {g.label}
                    </div>
                    <div className="px-5 py-4 flex items-center text-text-secondary text-xs">
                      {g.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Critical Failures */}
          <section className="mb-16">
            <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-2">Critical Failures</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Certain conditions automatically result in an <strong className="text-red-500">F grade</strong> regardless
                    of the numerical score. These are: <strong className="text-text-primary">honeypot detection</strong> (users
                    cannot sell) and <strong className="text-text-primary">active mint authority</strong> (unlimited token minting).
                    These represent the most severe risks where user funds are in immediate danger.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Penalty Table */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Penalty Breakdown</h2>
            <p className="text-sm text-text-secondary mb-8">Every risk factor and its point deduction.</p>

            <div className="space-y-3">
              {penalties.map((p) => (
                <div key={p.check} className="glass-card px-5 py-4 rounded-2xl flex items-start gap-4">
                  <div className="shrink-0 flex items-center gap-3 min-w-[140px]">
                    <span className={`text-sm font-bold font-mono ${
                      p.severity === "critical" ? "text-red-500" :
                      p.severity === "high" ? "text-orange-500" :
                      p.severity === "medium" ? "text-yellow-500" :
                      "text-text-muted"
                    }`}>
                      {p.points}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      p.severity === "critical" ? "bg-red-500/10 text-red-500" :
                      p.severity === "high" ? "bg-orange-500/10 text-orange-500" :
                      p.severity === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-[var(--silver-accent)]/10 text-text-muted"
                    }`}>
                      {p.severity}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-0.5">{p.check}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Platform Differences */}
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Platform-Specific Adjustments</h2>
            <p className="text-sm text-text-secondary mb-8">Scoring adapts based on whether a token is on a DEX or Pump.fun.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl">
                <h3 className="text-sm font-semibold text-text-primary mb-3">DEX Tokens</h3>
                <ul className="text-sm text-text-secondary space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Full LP depth analysis applied</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>LP lock/burn status affects score</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Mutable metadata penalized (-5)</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>All authority checks enforced</li>
                </ul>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Pump.fun Tokens</h3>
                <ul className="text-sm text-text-secondary space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Bonding curve progress replaces LP check</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>LP lock check marked N/A</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Mutable metadata expected (no penalty)</li>
                  <li className="flex items-start gap-2"><span className="silver-accent mt-0.5">-</span>Migration status tracked</li>
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
