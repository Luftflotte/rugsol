/**
 * In-memory storage for recent scans
 * In production, replace with Redis or a database
 */

export interface RecentScan {
  address: string;
  name: string;
  symbol: string;
  image?: string;
  score: number;
  grade: string;
  gradeColor: string;
  scannedAt: string;
  createdAt?: string;
}

// Use globalThis to persist data during development HMR
const globalRecentScans = globalThis as unknown as {
  recentScans: RecentScan[];
  totalScans: number;
  rugsDetected: number;
  scannedAddresses: Set<string>;
};

if (!globalRecentScans.recentScans) {
  globalRecentScans.recentScans = [];
  globalRecentScans.totalScans = 0;
  globalRecentScans.rugsDetected = 0;
  globalRecentScans.scannedAddresses = new Set<string>();
}

// Store last 50 scans
const MAX_RECENT_SCANS = 50;
const recentScans = globalRecentScans.recentScans;

// Stats
const scannedAddresses = globalRecentScans.scannedAddresses;

export function addRecentScan(scan: RecentScan): void {
  // Update stats only for new tokens
  if (!scannedAddresses.has(scan.address)) {
    scannedAddresses.add(scan.address);
    globalRecentScans.totalScans++;
    if (scan.score < 40) {
      globalRecentScans.rugsDetected++;
    }
  }

  // Check if this token was already scanned recently
  const existingIndex = recentScans.findIndex(s => s.address === scan.address);
  
  if (existingIndex !== -1) {
    // Update existing entry and move to front
    recentScans.splice(existingIndex, 1);
  }
  
  // Add to beginning
  recentScans.unshift(scan);
  
  // Keep only last MAX_RECENT_SCANS
  if (recentScans.length > MAX_RECENT_SCANS) {
    recentScans.pop();
  }
}

export function getRecentScans(limit: number = 12): RecentScan[] {
  return recentScans.slice(0, limit);
}

export function getRecentScansCount(): number {
  return recentScans.length;
}

export function getStats(): { totalScans: number; rugsDetected: number } {
  return { 
    totalScans: globalRecentScans.totalScans, 
    rugsDetected: globalRecentScans.rugsDetected 
  };
}
