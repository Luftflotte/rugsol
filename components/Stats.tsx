"use client";

import { useEffect, useState } from "react";

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function Stats() {
  const [stats, setStats] = useState({ totalScans: 0, rugsDetected: 0 });

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
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold gradient-text">
          {formatNumber(stats.totalScans)}
        </div>
        <p className="text-text-secondary mt-2 tracking-wide">Tokens Scanned</p>
      </div>
      
      <div className="divider-premium hidden md:block" />
      
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold text-text-primary">
          {formatNumber(stats.rugsDetected)}
        </div>
        <p className="text-text-secondary mt-2 tracking-wide">Rugs Detected</p>
      </div>
    </div>
  );
}
