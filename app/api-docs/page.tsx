import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — RugSol",
  description: "Integrate RugSol token security scanning into your applications with our REST API.",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Developers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              API Documentation
            </h1>
            <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
              Integrate RugSol token scanning into your bots, dashboards, and applications.
              No API key required for basic usage.
            </p>
          </div>

          {/* Base URL */}
          <section className="mb-12">
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-sm font-semibold text-text-primary mb-2">Base URL</h2>
              <div className="bg-bg-secondary/80 rounded-xl px-4 py-3 font-mono text-sm text-text-primary">
                https://rugsol.com/api
              </div>
            </div>
          </section>

          {/* Scan Endpoint */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Endpoints</h2>

            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Endpoint Header */}
              <div className="px-6 py-4 border-b border-border-color/30 flex items-center gap-3">
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
                  POST
                </span>
                <code className="text-sm font-mono text-text-primary">/scan</code>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Description</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Perform a full security scan on a Solana token. Returns a comprehensive risk assessment
                    including score, grade, individual check results, holder data, liquidity info, and detected
                    risk factors.
                  </p>
                </div>

                {/* Request */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Request Body</h3>
                  <div className="bg-bg-secondary/80 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-text-secondary">{`{
  "address": "TokenMintAddress..."
}`}</pre>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-3 text-sm">
                      <code className="font-mono text-text-primary bg-bg-secondary/50 px-1.5 py-0.5 rounded text-xs">address</code>
                      <span className="text-text-secondary">
                        <span className="text-xs font-medium text-red-400 mr-1">required</span>
                        Solana token mint address (base58 string, 32-44 chars)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Response</h3>
                  <div className="bg-bg-secondary/80 rounded-xl p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                    <pre className="text-text-secondary">{`{
  "score": 82,
  "grade": "A",
  "token": {
    "name": "Token Name",
    "symbol": "TKN",
    "image": "https://...",
    "address": "TokenMintAddress...",
    "decimals": 9,
    "supply": "1000000000"
  },
  "checks": {
    "mintAuthority": { "status": "revoked", "passed": true },
    "freezeAuthority": { "status": "revoked", "passed": true },
    "honeypot": { "status": "sellable", "passed": true },
    "topHolders": { "concentration": 28.5, "passed": true },
    "liquidity": { "usd": 125000, "passed": true },
    "lpLocked": { "status": "burned", "passed": true },
    "tokenAge": { "hours": 720, "passed": true },
    "metadata": { "mutable": false, "passed": true }
  },
  "holders": {
    "top10": [
      { "address": "Abc...", "pct": 5.2, "type": "wallet" },
      ...
    ]
  },
  "penalties": [
    { "reason": "Top holder > 5%", "points": -5 }
  ],
  "mode": "dex",
  "price": { "usd": 0.00234, "change24h": -12.5 },
  "liquidity": { "usd": 125000 },
  "cached": false,
  "timestamp": "2026-02-08T12:00:00Z"
}`}</pre>
                  </div>
                </div>

                {/* Status Codes */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Status Codes</h3>
                  <div className="space-y-2">
                    {[
                      { code: "200", desc: "Scan completed successfully" },
                      { code: "400", desc: "Invalid token address format" },
                      { code: "404", desc: "Token not found on Solana" },
                      { code: "429", desc: "Rate limit exceeded — try again later" },
                      { code: "500", desc: "Internal server error" },
                    ].map((s) => (
                      <div key={s.code} className="flex items-center gap-3 text-sm">
                        <code className={`font-mono font-bold text-xs ${
                          s.code === "200" ? "text-emerald-500" :
                          s.code.startsWith("4") ? "text-yellow-500" :
                          "text-red-500"
                        }`}>{s.code}</code>
                        <span className="text-text-secondary">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Example */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Example</h2>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border-color/30">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">cURL</span>
                </div>
                <div className="p-5 bg-bg-secondary/50">
                  <pre className="font-mono text-xs sm:text-sm text-text-secondary overflow-x-auto whitespace-pre-wrap">{`curl -X POST https://rugsol.com/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{"address": "So11111111111111111111111111111111111111112"}'`}</pre>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border-color/30">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">JavaScript</span>
                </div>
                <div className="p-5 bg-bg-secondary/50">
                  <pre className="font-mono text-xs sm:text-sm text-text-secondary overflow-x-auto whitespace-pre-wrap">{`const response = await fetch("https://rugsol.com/api/scan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    address: "So11111111111111111111111111111111111111112"
  })
});

const result = await response.json();
console.log(result.score, result.grade);`}</pre>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border-color/30">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Python</span>
                </div>
                <div className="p-5 bg-bg-secondary/50">
                  <pre className="font-mono text-xs sm:text-sm text-text-secondary overflow-x-auto whitespace-pre-wrap">{`import requests

response = requests.post(
    "https://rugsol.com/api/scan",
    json={"address": "So11111111111111111111111111111111111111112"}
)

result = response.json()
print(f"Score: {result['score']} | Grade: {result['grade']}")`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Rate Limits</h2>

            <div className="glass-card p-6 rounded-2xl">
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary mb-1">30</p>
                  <p className="text-xs text-text-muted">Requests / minute</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary mb-1">500</p>
                  <p className="text-xs text-text-muted">Requests / day</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary mb-1">Free</p>
                  <p className="text-xs text-text-muted">No API key needed</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-4 text-center">
                Need higher limits? Contact us on Telegram for enterprise access.
              </p>
            </div>
          </section>

          {/* Notes */}
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Notes</h2>
            <div className="space-y-4">
              {[
                { title: "Caching", content: "Responses may be cached for up to 5 minutes. The `cached` field in the response indicates whether the result was served from cache. To force a fresh scan, wait for the cache to expire." },
                { title: "Timeouts", content: "Scans typically complete in 3-8 seconds. The API has a 30-second timeout. If a scan takes longer (due to tokens with many holders or slow RPC), you may receive a partial result or timeout error." },
                { title: "Response Size", content: "Full scan responses are typically 2-5 KB. The holder list is capped at the top 10 holders. For tokens with extensive penalty lists, response size may be slightly larger." },
              ].map((note) => (
                <div key={note.title} className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{note.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{note.content}</p>
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
