"use client";

import { useEffect, useState, useRef } from "react";

const TOTAL_SCANS_OFFSET = 30000;
const RUGS_DETECTED_OFFSET = 8500;

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function useCountUp(target: number, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === 0) return;

    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    let raf: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevTarget.current = target;
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return current;
}

export function Stats() {
  const [stats, setStats] = useState<{ totalScans: number; rugsDetected: number } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const targetScans = stats ? stats.totalScans + TOTAL_SCANS_OFFSET : 0;
  const targetRugs = stats ? stats.rugsDetected + RUGS_DETECTED_OFFSET : 0;

  const displayTotalScans = useCountUp(targetScans);
  const displayRugsDetected = useCountUp(targetRugs);

  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold gradient-text">
          {stats ? formatNumber(displayTotalScans) : "\u00A0"}
        </div>
        <p className="text-text-secondary mt-2 tracking-wide">Tokens Scanned</p>
      </div>

      <div className="divider-premium hidden md:block" />

      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold text-text-primary">
          {stats ? formatNumber(displayRugsDetected) : "\u00A0"}
        </div>
        <p className="text-text-secondary mt-2 tracking-wide">Rugs Detected</p>
      </div>
    </div>
  );
}
