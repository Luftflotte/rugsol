"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { ExternalLink, Share2, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLinksProps {
  address: string;
  scannedAt: Date;
  cached: boolean;
}

const externalLinks = [
  {
    name: "Birdeye",
    url: (address: string) => `https://birdeye.so/token/${address}?chain=solana`,
    icon: "🦅",
  },
  {
    name: "DexScreener",
    url: (address: string) => `https://dexscreener.com/solana/${address}`,
    icon: "📊",
  },
  {
    name: "Solscan",
    url: (address: string) => `https://solscan.io/token/${address}`,
    icon: "🔍",
  },
  {
    name: "Jupiter",
    url: (address: string) =>
      `https://jup.ag/swap/SOL-${address}`,
    icon: "🪐",
  },
];

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

export function SidebarLinks({ address, scannedAt, cached }: SidebarLinksProps) {
  const handleShareImage = async () => {
    const ogUrl = `${window.location.origin}/api/og?address=${address}`;
    try {
      const res = await fetch(ogUrl);
      if (!res.ok) throw new Error("Failed to fetch OG image");
      const blob = await res.blob();
      const file = new File([blob], `rugsol-${address}.png`, { type: blob.type || "image/png" });

      // Try to write image to clipboard (most direct UX). Requires secure context and browser support.
      try {
        // @ts-ignore ClipboardItem may not be available in TS types
        if (navigator.clipboard && (window as any).ClipboardItem) {
          // @ts-ignore
          const clipboardItem = new (window as any).ClipboardItem({ [blob.type || "image/png"]: blob });
          await navigator.clipboard.write([clipboardItem]);
          alert("Image copied to clipboard");
          return;
        }
      } catch (clipErr) {
        console.warn("Clipboard write failed", clipErr);
      }

      // Web Share API Level 2: share files if supported
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({ files: [file], title: "RugSol Scan", text: `Scan results for ${address}` });
        return;
      }

      // Fallback: trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rugsol-${address}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Share image error:", err);
      // Final fallback: open image in new tab
      window.open(`${window.location.origin}/api/og?address=${address}`, "_blank");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/scan/${address}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RugSol Scan Result",
          text: "Check out this token scan on RugSol",
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } catch {
        // Fallback for environments where clipboard API is blocked
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* External Links */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Quick Links</h3>
        <div className="flex flex-col gap-2">
          {externalLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.url(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-color hover:border-silver-accent/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bg-secondary to-bg-card flex items-center justify-center text-sm border border-border-color group-hover:scale-110 transition-transform duration-300">
                <span className="text-base">{link.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary group-hover:text-text-primary/90">{link.name}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Explorer</div>
              </div>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors group-hover:rotate-12" />
            </a>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Link href="/" className="block w-full">
          <Button
            variant="default"
            size="sm"
            className="w-full bg-gradient-to-r from-primary-accent to-secondary-accent hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] text-bg-main font-bold text-sm py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Scan Another Token
            </span>
          </Button>
        </Link>
      </div>

      {/* Metadata */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-bg-secondary/80 to-bg-card/80 border border-border-color backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-text-secondary" />
            <span className="font-medium">Scanned {formatTime(scannedAt)}</span>
          </div>
          {cached && (
            <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-400 rounded-full text-[10px] font-bold border border-blue-500/20 uppercase tracking-wider">
              Cached
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
