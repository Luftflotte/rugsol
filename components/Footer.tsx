"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Terminal, Shield, Cpu, Activity } from "lucide-react";

export function Footer() {
  const [toast, setToast] = useState<string | null>(null);

  const showComingSoon = useCallback((label: string) => {
    setToast(`${label} — Coming Soon`);
    setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <footer className="border-t border-[#1e2433] bg-[#08090d] text-[#94a3b8] font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Logo size="md" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b26] text-[#38bdf8] border border-[#1e2433]">
                TERMINAL v2.4
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed max-w-md">
              Enterprise-grade real-time security auditor for the Solana ecosystem. Powered by direct RPC node simulations, Jupiter honeypot execution routes, and liquidity pool forensics.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono">
              <a
                href="https://rugsol.xyz"
                className="text-[#38bdf8] hover:underline"
              >
                rugsol.xyz
              </a>
              <span className="text-[#1e2433]">•</span>
              <a
                href="https://t.me/rugsolinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f1f5f9] transition-colors"
              >
                Telegram Bot
              </a>
              <span className="text-[#1e2433]">•</span>
              <Link href="/api-docs" className="hover:text-[#f1f5f9] transition-colors">
                API Docs
              </Link>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-mono uppercase font-bold text-[#f1f5f9] tracking-wider mb-3">
              INTELLIGENCE TOOLS
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/" className="hover:text-[#38bdf8] transition-colors">
                  &gt; Token Scanner
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-[#38bdf8] transition-colors">
                  &gt; REST Security API
                </Link>
              </li>
              <li>
                <a
                  href="https://t.me/rugsolinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#38bdf8] transition-colors"
                >
                  &gt; @rugsolinfobot (TG)
                </a>
              </li>
              <li>
                <span className="text-[#64748b] cursor-not-allowed">
                  &gt; Sniper Bot Radar (Beta)
                </span>
              </li>
            </ul>
          </div>

          {/* Node Health / Telemetry */}
          <div>
            <h4 className="text-xs font-mono uppercase font-bold text-[#f1f5f9] tracking-wider mb-3">
              NETWORK TELEMETRY
            </h4>
            <div className="p-3 rounded-lg bg-[#0e1118] border border-[#1e2433] space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">NETWORK:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Solana Mainnet
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">RPC LATENCY:</span>
                <span className="text-[#f1f5f9]">14ms (Helius)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">ROUTER:</span>
                <span className="text-[#f1f5f9]">Jupiter v6 Ultra</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">STATUS:</span>
                <span className="text-emerald-400">100% OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar & disclaimer */}
        <div className="pt-6 border-t border-[#1e2433] flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] font-mono text-[#64748b]">
          <div>
            © {new Date().getFullYear()} RugSol Analytics. Built for on-chain traders and protocols.
          </div>

          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#94a3b8] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#94a3b8] transition-colors">
              Privacy
            </Link>
            <Link href="/scoring" className="hover:text-[#94a3b8] transition-colors">
              Methodology
            </Link>
            <span>v2.4.1</span>
          </div>
        </div>

        <div className="mt-4 text-[10px] text-[#475569] leading-relaxed">
          Disclaimer: RugSol provides algorithmically computed token heuristics for research and informational purposes only. On-chain simulations and scoring cannot guarantee future contract behavior or replace independent due diligence. Trade at your own risk.
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-lg bg-[#0e1118] border border-[#38bdf8]/40 text-xs font-mono text-[#f1f5f9] shadow-xl">
          {toast}
        </div>
      )}
    </footer>
  );
}
