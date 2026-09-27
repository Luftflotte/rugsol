import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — RugSol",
  description: "Integrate RugSol token security scanning into your trading bots and applications via REST API.",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-14 sm:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-[#f8fafc] mb-3">
              API DOCUMENTATION
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#64748b]">
              <span>REST PROTOCOL V1</span>
              <span>//</span>
              <span>FORMAT: JSON</span>
              <span>//</span>
              <span className="text-[#38bdf8]">PUBLIC ACCESS (NO AUTH REQUIRED)</span>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed mt-3">
              Integrate RugSol deterministic token audits directly into your sniper bots, MEV routers, and trading dashboards.
            </p>
          </div>

          {/* Base URL */}
          <section className="mb-16 sm:mb-20">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> NETWORK GATEWAY
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Global low-latency edge endpoints routed across Solana RPC validator clusters.
              </p>
            </div>

            <div className="bg-[#0e1118] border border-[#1e2433] p-4 sm:p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">PRODUCTION BASE RPC ENDPOINT</span>
                <span className="text-[10px] font-mono text-emerald-400">HTTPS ONLY</span>
              </div>
              <div className="bg-[#121622] border border-[#1e2433] rounded-lg px-4 py-2.5 font-mono text-xs sm:text-sm text-[#38bdf8] select-all">
                https://rugsol.xyz/api
              </div>
            </div>
          </section>

          {/* Scan Endpoint */}
          <section className="mb-16 sm:mb-20">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> ENDPOINTS
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                High-throughput token contract audit endpoints for programmatic execution.
              </p>
            </div>

            <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden shadow-xl">
              {/* Endpoint Header */}
              <div className="px-5 py-3.5 bg-[#121622] border-b border-[#1e2433] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    POST
                  </span>
                  <code className="text-sm font-mono font-semibold text-[#f8fafc]">/scan</code>
                </div>
                <span className="text-[10px] font-mono text-[#64748b]">RATE: 30 REQ/MIN</span>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-[#f8fafc] mb-1.5">Description</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    Executes parallel on-chain security verification on any Solana mint address. Returns composite risk score (0-100), letter grade (A-F), authority revocation checks, honeypot sell simulation, liquidity depth, and top holder concentration telemetry.
                  </p>
                </div>

                {/* Request */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-[#f8fafc] mb-2">Request Body (application/json)</h3>
                  <div className="bg-[#121622] border border-[#1e2433] rounded-lg p-3.5 font-mono text-xs overflow-x-auto text-[#f1f5f9]">
                    <pre>{`{
  "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
}`}</pre>
                  </div>
                  <div className="mt-3 flex items-start gap-2.5 text-xs font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#161b26] border border-[#1e2433] text-[#38bdf8] shrink-0">address</span>
                    <span className="text-rose-400 shrink-0">[required]</span>
                    <span className="text-[#94a3b8] font-sans">Solana token mint address (Base58 encoded, 32-44 characters).</span>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-[#f8fafc] mb-2">Sample Response (200 OK)</h3>
                  <div className="bg-[#121622] border border-[#1e2433] rounded-lg p-3.5 font-mono text-xs overflow-x-auto text-[#94a3b8]">
                    <pre>{`{
  "score": 88,
  "grade": "A",
  "token": {
    "name": "Bonk",
    "symbol": "Bonk",
    "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "decimals": 5,
    "supply": "92790930419355"
  },
  "checks": {
    "mintAuthority": { "status": "revoked", "passed": true },
    "freezeAuthority": { "status": "revoked", "passed": true },
    "honeypot": { "status": "sellable", "passed": true },
    "topHolders": { "concentration": 21.4, "passed": true },
    "liquidity": { "usd": 4200000, "passed": true },
    "lpLocked": { "status": "burned", "passed": true }
  },
  "mode": "dex",
  "cached": true,
  "timestamp": "2026-02-08T12:00:00Z"
}`}</pre>
                  </div>
                </div>

                {/* Status Codes */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-[#f8fafc] mb-2">HTTP Status Codes</h3>
                  <div className="divide-y divide-[#161b26] border border-[#1e2433] rounded-lg overflow-hidden bg-[#121622]">
                    {[
                      { code: "200", color: "text-emerald-400", desc: "Scan completed successfully with full audit telemetry payload." },
                      { code: "400", color: "text-amber-400", desc: "Invalid Solana address format or malformed JSON payload." },
                      { code: "404", color: "text-amber-400", desc: "Token mint address does not exist on Solana mainnet-beta." },
                      { code: "429", color: "text-rose-400", desc: "Rate quota exceeded (30 requests/minute). Throttled." },
                      { code: "500", color: "text-rose-400", desc: "RPC node timeout or upstream infrastructure failure." },
                    ].map((s) => (
                      <div key={s.code} className="flex items-center gap-3 px-3.5 py-2 text-xs font-mono">
                        <span className={`w-12 font-bold ${s.color}`}>{s.code}</span>
                        <span className="text-[#94a3b8] font-sans">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Example Code */}
          <section className="mb-16 sm:mb-20">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> CODE SNIPPETS
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Production-ready implementation examples in cURL, TypeScript, and Python.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-[#121622] border-b border-[#1e2433] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#64748b]">cURL CLI</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">TERMINAL</span>
                </div>
                <div className="p-4 bg-[#0a0d14] font-mono text-xs text-[#94a3b8] overflow-x-auto whitespace-pre-wrap">
{`curl -X POST https://rugsol.xyz/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{"address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"}'`}
                </div>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-[#121622] border-b border-[#1e2433] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#64748b]">Node.js / TypeScript</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">FETCH API</span>
                </div>
                <div className="p-4 bg-[#0a0d14] font-mono text-xs text-[#94a3b8] overflow-x-auto whitespace-pre-wrap">
{`const res = await fetch("https://rugsol.xyz/api/scan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" }),
});
const audit = await res.json();
console.log(\`Score: \${audit.score} | Grade: \${audit.grade}\`);`}
                </div>
              </div>

              <div className="bg-[#0e1118] border border-[#1e2433] rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-[#121622] border-b border-[#1e2433] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#64748b]">Python 3</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">REQUESTS</span>
                </div>
                <div className="p-4 bg-[#0a0d14] font-mono text-xs text-[#94a3b8] overflow-x-auto whitespace-pre-wrap">
{`import requests

res = requests.post("https://rugsol.xyz/api/scan", json={
    "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
})
data = res.json()
print(f"Verdict: Grade {data['grade']} ({data['score']}/100)")`}
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="mb-16 sm:mb-20">
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> RATE QUOTAS & CAPACITY
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Tier allocation limits and burst threshold policies for public RPC consumers.
              </p>
            </div>

            <div className="bg-[#0e1118] border border-[#1e2433] p-5 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-[#121622] border border-[#1e2433] rounded-lg">
                  <p className="text-2xl font-mono font-bold text-[#f8fafc] mb-1">30</p>
                  <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Requests / Minute</p>
                </div>
                <div className="p-4 bg-[#121622] border border-[#1e2433] rounded-lg">
                  <p className="text-2xl font-mono font-bold text-[#f8fafc] mb-1">500</p>
                  <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Requests / Day</p>
                </div>
                <div className="p-4 bg-[#121622] border border-[#1e2433] rounded-lg">
                  <p className="text-2xl font-mono font-bold text-emerald-400 mb-1">FREE</p>
                  <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">No API Key Required</p>
                </div>
              </div>
              <p className="text-xs text-[#94a3b8] mt-4 text-center">
                Need high-throughput enterprise limits? Reach out via official X (@RugSolScanner) for whitelisted node allocations.
              </p>
            </div>
          </section>

          {/* Operational Notes */}
          <section>
            <div className="mb-4 px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                <span className="text-[#38bdf8]">//</span> OPERATIONAL PROTOCOLS
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Caching mechanics, execution latency guarantees, and payload structural schemas.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { title: "Cache Expiry", content: "Responses are cached for 300 seconds (5 min) to prevent redundant on-chain RPC calls. The 'cached' boolean indicates origin." },
                { title: "Timeout Threshold", content: "Parallel checks execute under a 30s deadline. High-holder token trees with deep transactions may return partial results if RPCs stall." },
                { title: "Payload Sizing", content: "Payloads average 2-4 KB. Holder distributions are strictly capped at the top 10 wallets to maximize network throughput." },
              ].map((note) => (
                <div key={note.title} className="bg-[#0e1118] border border-[#1e2433] p-4 rounded-xl hover:border-[#38bdf8]/40 transition-colors">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f8fafc] mb-1.5">{note.title}</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{note.content}</p>
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
