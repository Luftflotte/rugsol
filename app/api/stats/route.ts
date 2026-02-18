import { NextResponse } from "next/server";
import { getStats, getRecentScansCount } from "@/lib/storage/recent-scans";

export async function GET() {
  try {
    const stats = getStats() || { totalScans: 0, rugsDetected: 0 };
    const recentCount = typeof getRecentScansCount === 'function' ? getRecentScansCount() : 0;
    return NextResponse.json({
      success: true,
      data: {
        totalScans: stats.totalScans ?? 0,
        rugsDetected: stats.rugsDetected ?? 0,
        recentCount,
      },
    });
  } catch (e) {
    console.error("/api/stats error", e);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
