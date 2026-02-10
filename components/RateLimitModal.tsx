"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { PricingTiers } from "./PricingTiers";

interface RateLimitModalProps {
  secondsLeft: number;
  onClose: () => void;
}

export function RateLimitModal({ secondsLeft, onClose }: RateLimitModalProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [countdown, setCountdown] = useState(secondsLeft);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onClose]);

  // Progress percentage (inverted: 0% at start, 100% when done)
  const progress = Math.max(0, ((secondsLeft - countdown) / secondsLeft) * 100);

  const trackColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const progressColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-0" style={{ alignItems: "start", paddingTop: "5vh" }}>
      <div
        className={`absolute inset-0 backdrop-blur-sm ${isDark ? "bg-black/50" : "bg-white/60"}`}
        onClick={() => router.push("/")}
      />

      <div className="relative z-10 w-full max-w-4xl mx-4 flex flex-col items-center gap-6">
        {/* Timer */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke={trackColor} strokeWidth="3" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke={progressColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className="text-2xl font-bold text-text-primary tabular-nums">{countdown}</span>
          </div>
          <p className="text-sm text-text-muted">You can scan again in <span className="text-text-secondary">{countdown}s</span></p>
        </div>

        {/* Pricing tiers */}
        <div className="w-full">
          <PricingTiers instant compact />
        </div>
      </div>
    </div>
  );
}
