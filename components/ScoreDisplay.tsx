"use client";

import { useState, useEffect, useRef } from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

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
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    const startTime = Date.now();
    const duration = 1200;

    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentScore = Math.round(easeOutQuart * score);

      setDisplayScore(currentScore);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateScore);
      }
    };

    animationRef.current = requestAnimationFrame(animateScore);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score, animate]);

  // Geometry for precision radial gauge
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Match GRADES constants exactly: A (80+), B (60-79), C (40-59), D (20-39), F (0-19)
  const isGradeA = grade === "A" || score >= 80;
  const isGradeB = grade === "B" || (score >= 60 && score < 80);
  const isGradeC = grade === "C" || (score >= 40 && score < 60);
  const isGradeD = grade === "D" || (score >= 20 && score < 40);
  const isGradeF = grade === "F" || score < 20;

  const statusColor = isGradeA
    ? "#22c55e"  // A: green
    : isGradeB
    ? "#84cc16"  // B: lime
    : isGradeC
    ? "#eab308"  // C: yellow
    : isGradeD
    ? "#f97316"  // D: orange
    : "#ef4444"; // F: red

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Precision Circular Telemetry Dial */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Calibrated Tick Marks ring */}
        <div className="absolute inset-0 rounded-full border border-border-color" />

        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 128 128">
          {/* Background track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={statusColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 80ms linear",
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-baseline font-mono tracking-tight">
            <span
              className="text-4xl font-extrabold tabular-nums"
              style={{ color: statusColor }}
            >
              {displayScore}
            </span>
            <span className="text-xs text-text-muted font-medium ml-1">/100</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted mt-0.5">
            Safety Score
          </span>
        </div>
      </div>

      {/* Grade Banner */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div
          className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg border w-full font-mono text-xs font-bold tracking-wide"
          style={{
            borderColor: `${statusColor}40`,
            backgroundColor: `${statusColor}10`,
            color: statusColor,
          }}
        >
          {isGradeF ? (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          ) : isGradeD || isGradeC ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0" />
          )}
          <span>GRADE {grade} • {gradeLabel.toUpperCase()}</span>
          <InfoTooltip
            content={
              <div className="space-y-2 font-sans">
                <p className="font-bold text-text-primary">Scoring Architecture</p>
                <div className="space-y-1 text-xs">
                  <p><span className="text-green-400 font-mono font-bold">A (80-100):</span> Safe. Audited parameters verified.</p>
                  <p><span className="text-lime-400 font-mono font-bold">B (60-79):</span> Low risk. Minor warnings detected.</p>
                  <p><span className="text-yellow-400 font-mono font-bold">C (40-59):</span> Moderate risk. Noticeable vulnerabilities.</p>
                  <p><span className="text-orange-400 font-mono font-bold">D (20-39):</span> High risk. Significant liquidity/holder flags.</p>
                  <p><span className="text-rose-400 font-mono font-bold">F (&lt;20):</span> Likely scam. Critical threat or honeypot.</p>
                </div>
              </div>
            }
            position="bottom"
          />
        </div>

        {/* Status diagnosis tag */}
        <span className="text-[11px] font-mono text-text-muted">
          {isGradeA || isGradeB
            ? "✓ CONTRACT VERIFIED BY ENGINE"
            : isGradeC
            ? "⚠ ELEVATED RISK FACTORS DETECTED"
            : isGradeD
            ? "⚠ HIGH PROBABILITY OF LIQUIDITY DUMP"
            : "✕ CRITICAL FAILURE: DANGEROUS CONTRACT"}
        </span>
      </div>
    </div>
  );
}
