"use client";

import { useEffect, useState } from "react";

const TOTAL_SCANS_OFFSET = 30000;
const RUGS_DETECTED_OFFSET = 8500;

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function readFakeCount(): number {
  try {
    return parseInt(localStorage.getItem("fakeScansCount") || "0", 10);
  } catch {
    return 0;
  }
}

export function Stats() {
  const [stats, setStats] = useState({ totalScans: 0, rugsDetected: 0 });
  const [fakeCount, setFakeCount] = useState(0);

  useEffect(() => {
    // Read initial fake count from localStorage
    setFakeCount(readFakeCount());

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

    // Sync fake count whenever RecentScans injects a new fake card
    function onFakeUpdate() {
      setFakeCount(readFakeCount());
    }
    window.addEventListener("fakeScansUpdate", onFakeUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("fakeScansUpdate", onFakeUpdate);
    };
  }, []);

  const displayTotalScans = stats.totalScans + fakeCount + TOTAL_SCANS_OFFSET;
  const displayRugsDetected = stats.rugsDetected + RUGS_DETECTED_OFFSET;

  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold gradient-text">
          {formatNumber(displayTotalScans)}
        </div>
        <p className="text-text-secondary mt-2 tracking-wide">Tokens Scanned</p>
      </div>

      <div className="divider-premium hidden md:block" />

      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold text-text-primary">
          {formatNumber(displayRugsDetected)}
        </div>
        <p className="text-text-secondary mt-2 tracking-wide">Rugs Detected</p>
      </div>
    </div>
  );
}
