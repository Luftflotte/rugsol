"use client";

import { useState, useEffect, useRef } from "react";

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
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [displayColor, setDisplayColor] = useState(animate ? "#ef4444" : gradeColor); // Start with red if animating
  const [, setIsAnimating] = useState(animate);
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
    if (!animate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(score);
      setDisplayColor(gradeColor);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const duration = 1500; // Increased duration for better color perception

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
  }, [score, animate, gradeColor]);

  // Circle geometry (larger on mobile, scales with container)
  const r = 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {/* Circular score display */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 overflow-hidden">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Soft inner ring for depth */}
          <circle cx="64" cy="64" r={r} stroke="currentColor" strokeWidth={strokeWidth - 4} fill="transparent" className="text-border-color/40" />
          {/* Glow ring */}
          <circle cx="64" cy="64" r={r} stroke={displayColor} strokeWidth={2} fill="transparent" opacity={0.14} filter="url(#glow)" />
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={r}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-border-color"
            strokeOpacity={0.14}
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r={r}
            stroke={displayColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 100ms linear", // Faster transition for smoother sync
            }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: displayColor, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-text-secondary mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        className={`px-3 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-md transition-colors duration-500`}
        style={{
          background: `linear-gradient(90deg, ${displayColor}22, ${displayColor}08)`,
          color: displayColor,
          boxShadow: `0 6px 20px ${displayColor}14`,
          border: `1px solid ${displayColor}30`,
        }}
      >
        Grade {grade} • {gradeLabel}
      </div>
      
      {/* Severity Sub-label for F grade */}
      {grade === 'F' && (
         <div className="text-[10px] sm:text-xs font-mono text-red-400 opacity-75">
            Check Risk Factors for details
         </div>
      )}
    </div>
  );
}

