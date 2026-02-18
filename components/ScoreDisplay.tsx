"use client";

import { useState, useEffect, useRef } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);
  return isMobile;
}

interface ScoreDisplayProps {
  score: number;
  grade: string;
  gradeColor: string;
  gradeLabel: string;
  animate?: boolean;
}

export function ScoreDisplay({
  score,
  grade,
  gradeColor,
  gradeLabel,
  animate = true,
}: ScoreDisplayProps) {
  const isMobile = useIsMobile();
  const shouldAnimate = animate && !isMobile;
  const [displayScore, setDisplayScore] = useState(shouldAnimate ? 0 : score);
  const [displayColor, setDisplayColor] = useState(shouldAnimate ? "#ef4444" : gradeColor);
  const [, setIsAnimating] = useState(shouldAnimate);
  const animationRef = useRef<number | undefined>(undefined);

  // Helper to interpolate colors
  const interpolateColor = (start: string, end: string, factor: number) => {
    const r1 = parseInt(start.substring(1, 3), 16);
    const g1 = parseInt(start.substring(3, 5), 16);
    const b1 = parseInt(start.substring(5, 7), 16);

    const r2 = parseInt(end.substring(1, 3), 16);
    const g2 = parseInt(end.substring(3, 5), 16);
    const b2 = parseInt(end.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  useEffect(() => {
    if (!shouldAnimate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(score);
      setDisplayColor(gradeColor);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const duration = 1500;

    // Colors for interpolation
    const startColor = "#ef4444"; // Red
    const midColor = "#eab308";   // Yellow
    const endColor = "#22c55e";   // Green

    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentScore = Math.round(easeOutQuart * score);
      
      // Calculate dynamic color based on current score relative to total range (0-100)
      // This makes the color reflect the current number being displayed, not just time
      let currentColor;
      if (currentScore < 50) {
        // Interpolate Red -> Yellow
        currentColor = interpolateColor(startColor, midColor, currentScore / 50);
      } else {
        // Interpolate Yellow -> Green (capped at final grade color if score < 100)
        // If final score is e.g. 60, we don't want to go all the way to pure green
        // So we interpolate towards the final target color or keep the logic simple 0-100 mapping
        
        // Strategy: Map 50-100 range from Yellow to Green
        const factor = (currentScore - 50) / 50;
        currentColor = interpolateColor(midColor, endColor, factor);
      }

      setDisplayScore(currentScore);
      setDisplayColor(currentColor);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateScore);
      } else {
        setIsAnimating(false);
        // Ensure we settle exactly on the prop color at the end
        setDisplayColor(gradeColor);
      }
    };

    animationRef.current = requestAnimationFrame(animateScore);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score, shouldAnimate, gradeColor]);

  // Circle geometry (larger on mobile, scales with container)
  const r = 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5">
      {/* Circular score display with enhanced effects */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 overflow-visible">
        {/* Outer glow effect — hidden on mobile for performance */}
        {!isMobile && (
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
            style={{ background: displayColor }}
          />
        )}

        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 128 128" preserveAspectRatio="xMidYMid meet">
          <defs>
            {!isMobile && (
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: displayColor, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: displayColor, stopOpacity: 0.7 }} />
            </linearGradient>
          </defs>
          {/* Soft inner ring for depth */}
          <circle cx="64" cy="64" r={r} stroke="currentColor" strokeWidth={strokeWidth - 4} fill="transparent" className="text-border-color/40" />
          {/* Glow ring — no filter on mobile */}
          <circle cx="64" cy="64" r={r} stroke={displayColor} strokeWidth={3} fill="transparent" opacity={0.2} filter={isMobile ? undefined : "url(#glow)"} />
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={r}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-border-color"
            strokeOpacity={0.15}
          />
          {/* Progress circle with gradient */}
          <circle
            cx="64"
            cy="64"
            r={r}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 100ms linear",
            }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{
              color: displayColor,
              textShadow: `0 2px 8px ${displayColor}40, 0 0 20px ${displayColor}20`
            }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-text-secondary mt-1 font-medium">/ 100</span>
        </div>
      </div>

      {/* Enhanced Grade badge */}
      <div className="flex items-center gap-2">
        <div
          className={`px-4 py-2 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-colors duration-300 border-2`}
          style={{
            background: `linear-gradient(135deg, ${displayColor}18, ${displayColor}08)`,
            color: displayColor,
            boxShadow: `0 8px 24px ${displayColor}20, inset 0 1px 0 ${displayColor}20`,
            borderColor: `${displayColor}40`,
          }}
        >
          Grade {grade} • {gradeLabel}
        </div>
        <InfoTooltip
          content={
            <div className="space-y-2">
              <p className="font-bold text-text-primary">Token Safety Score</p>
              <div className="space-y-1 text-[11px]">
                <p><strong className="text-green-400">A (80-100):</strong> Safe</p>
                <p><strong className="text-lime-400">B (60-79):</strong> Low Risk</p>
                <p><strong className="text-yellow-400">C (40-59):</strong> Moderate Risk</p>
                <p><strong className="text-orange-400">D (20-39):</strong> High Risk</p>
                <p><strong className="text-red-400">F (&lt;20 or Critical):</strong> Likely Scam</p>
              </div>
              <p className="text-[10px] opacity-70 mt-2">Score starts at 100 and decreases based on detected risk factors.</p>
            </div>
          }
          position="bottom"
        />
      </div>

      {/* Severity Sub-label for F grade */}
      {grade === 'F' && (
         <div className="text-xs font-medium text-red-400 opacity-80 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
            ⚠️ Check Risk Factors for details
         </div>
      )}
    </div>
  );
}

