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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* External Links - Mobile: Horizontal scroll, Desktop: Vertical list */}
      <div>
        <h3 className="text-xs md:text-sm font-semibold text-text-secondary mb-2">View On</h3>
        <div className="flex flex-col md:flex-col gap-2">
          {externalLinks.map((link) => (
            <a
              key={link.name}
              href={link.url(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-card border border-border-color hover:shadow-md hover:translate-y-[-2px] transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-bg-secondary flex items-center justify-center text-sm">
                <span className="text-base">{link.icon}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{link.name}</div>
                <div className="text-xs text-text-secondary">External</div>
              </div>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-text-primary" />
            </a>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleShareImage}
          variant="outline"
          size="sm"
          className="w-full bg-bg-secondary border-border-color hover:bg-bg-card text-text-primary text-sm py-2 mb-2"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share image
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="w-full bg-bg-secondary border-border-color hover:bg-bg-card text-text-primary text-sm py-2"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Link href="/" className="block w-full">
          <Button
            variant="default"
            size="sm"
            className="w-full bg-gradient-to-r from-primary-accent to-secondary-accent hover:opacity-95 text-bg-main font-semibold text-sm py-2"
          >
            <Search className="w-4 h-4 mr-2" />
            New Scan
          </Button>
        </Link>
      </div>

      {/* Metadata */}
      <div className="p-3 rounded-lg bg-bg-secondary border border-border-color">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Clock className="w-3 h-3" />
          <span>Scanned {formatTime(scannedAt)}</span>
          {cached && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              Cached
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
