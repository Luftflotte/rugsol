/**
 * Persistent storage for recent scans & stats.
 * Data is kept in memory for speed and flushed to a JSON file on disk
 * so it survives server restarts.
 */

import fs from "fs";
import path from "path";

export interface RecentScan {
  address: string;
  name: string;
  symbol: string;
  image?: string;
  score: number;
  grade: string;
  gradeLabel?: string;
  gradeColor: string;
  scannedAt: string;
  createdAt?: string;
  ogQuery?: string; // pre-built OG image query string
}

interface PersistedData {
  recentScans: RecentScan[];
  totalScans: number;
  rugsDetected: number;
  scannedAddresses: string[];
}

// --- File path for persistence ---
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "scans.json");

function loadFromDisk(): PersistedData | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw) as PersistedData;
    }
  } catch (e) {
    console.warn("Failed to load scans data from disk:", e);
  }
  return null;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function saveToDisk(): void {
  // Debounce: wait 2s after last write to batch multiple rapid scans
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data: PersistedData = {
        recentScans: globalRecentScans.recentScans,
        totalScans: globalRecentScans.totalScans,
        rugsDetected: globalRecentScans.rugsDetected,
        scannedAddresses: Array.from(globalRecentScans.scannedAddresses),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data), "utf-8");
    } catch (e) {
      console.warn("Failed to save scans data to disk:", e);
    }
  }, 2000);
}

// --- In-memory state (globalThis for HMR in dev) ---
const globalRecentScans = globalThis as unknown as {
  recentScans: RecentScan[];
  totalScans: number;
  rugsDetected: number;
  scannedAddresses: Set<string>;
  _loaded: boolean;
};

if (!globalRecentScans._loaded) {
  const saved = loadFromDisk();
  if (saved) {
    globalRecentScans.recentScans = saved.recentScans;
    globalRecentScans.totalScans = saved.totalScans;
    globalRecentScans.rugsDetected = saved.rugsDetected;
    globalRecentScans.scannedAddresses = new Set(saved.scannedAddresses);
    console.log(`Loaded ${saved.totalScans} scans, ${saved.recentScans.length} recent from disk`);
  } else {
    globalRecentScans.recentScans = [];
    globalRecentScans.totalScans = 0;
    globalRecentScans.rugsDetected = 0;
    globalRecentScans.scannedAddresses = new Set<string>();
  }
  globalRecentScans._loaded = true;
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

  // Persist to disk
  saveToDisk();
}

export function getRecentScanByAddress(address: string): RecentScan | null {
  return recentScans.find(s => s.address === address) || null;
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
