import fs from "fs";
import path from "path";
import crypto from "crypto";

// Путь к файлу хранения использованных сканов
const DATA_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(DATA_DIR, "scan-usage.json");

interface ScanUsageData {
  fingerprints: Map<string, { count: number; lastReset: number; walletAddress?: string }>;
  wallets: Map<string, { scans: number; lastScan: number }>;
}

// In-memory кеш для быстрого доступа
let usageCache: ScanUsageData | null = null;

/**
 * Создаёт директорию data/ если её нет
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Загружает данные использования из файла
 */
function loadUsageData(): ScanUsageData {
  if (usageCache) return usageCache;

  ensureDataDir();

  if (!fs.existsSync(USAGE_FILE)) {
    usageCache = {
      fingerprints: new Map(),
      wallets: new Map(),
    };
    return usageCache;
  }

  try {
    const raw = fs.readFileSync(USAGE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    usageCache = {
      fingerprints: new Map(Object.entries(parsed.fingerprints || {})),
      wallets: new Map(Object.entries(parsed.wallets || {})),
    };
    return usageCache;
  } catch (error) {
    console.error("Failed to load usage data:", error);
    usageCache = {
      fingerprints: new Map(),
      wallets: new Map(),
    };
    return usageCache;
  }
}

/**
 * Сохраняет данные использования в файл
 */
function saveUsageData(data: ScanUsageData): void {
  ensureDataDir();

  const toSave = {
    fingerprints: Object.fromEntries(data.fingerprints),
    wallets: Object.fromEntries(data.wallets),
  };

  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(toSave, null, 2), "utf-8");
    usageCache = data;
  } catch (error) {
    console.error("Failed to save usage data:", error);
  }
}

/**
 * Создаёт fingerprint пользователя на основе IP + User-Agent
 * Это невозможно обойти без VPN/прокси + смены браузера
 */
export function createFingerprint(ip: string, userAgent: string): string {
  const combined = `${ip}|${userAgent}`;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

/**
 * Проверяет лимит сканов для неавторизованного пользователя
 * @returns { allowed: boolean, remaining: number, needsAuth: boolean }
 */
export function checkScanLimit(
  fingerprint: string,
  walletAddress?: string
): { allowed: boolean; remaining: number; needsAuth: boolean } {
  const data = loadUsageData();

  // Если есть verified wallet — проверяем лимиты кошелька
  if (walletAddress) {
    const walletData = data.wallets.get(walletAddress);

    // Для authenticated пользователей — безлимит
    return {
      allowed: true,
      remaining: Infinity,
      needsAuth: false,
    };
  }

  // Для неавторизованных — только 1 скан
  const fingerprintData = data.fingerprints.get(fingerprint);

  if (!fingerprintData) {
    // Первый скан — разрешаем
    return {
      allowed: true,
      remaining: 0, // После этого скана останется 0
      needsAuth: false,
    };
  }

  // Уже использовали бесплатный скан
  return {
    allowed: false,
    remaining: 0,
    needsAuth: true,
  };
}

/**
 * Записывает использование скана
 */
export function recordScan(fingerprint: string, walletAddress?: string): void {
  const data = loadUsageData();

  if (walletAddress) {
    // Записываем скан для authenticated пользователя
    const walletData = data.wallets.get(walletAddress) || {
      scans: 0,
      lastScan: Date.now(),
    };
    walletData.scans++;
    walletData.lastScan = Date.now();
    data.wallets.set(walletAddress, walletData);

    // Также связываем fingerprint с кошельком
    const fingerprintData = data.fingerprints.get(fingerprint) || {
      count: 0,
      lastReset: Date.now(),
    };
    fingerprintData.walletAddress = walletAddress;
    data.fingerprints.set(fingerprint, fingerprintData);
  } else {
    // Записываем скан для неавторизованного
    const fingerprintData = data.fingerprints.get(fingerprint) || {
      count: 0,
      lastReset: Date.now(),
    };
    fingerprintData.count++;
    data.fingerprints.set(fingerprint, fingerprintData);
  }

  saveUsageData(data);
}

/**
 * Авторизует fingerprint через wallet
 */
export function linkWalletToFingerprint(
  fingerprint: string,
  walletAddress: string
): void {
  const data = loadUsageData();

  const fingerprintData = data.fingerprints.get(fingerprint) || {
    count: 0,
    lastReset: Date.now(),
  };
  fingerprintData.walletAddress = walletAddress;
  data.fingerprints.set(fingerprint, fingerprintData);

  saveUsageData(data);
}

/**
 * Получает wallet для fingerprint (если авторизован)
 */
export function getWalletForFingerprint(fingerprint: string): string | null {
  const data = loadUsageData();
  const fingerprintData = data.fingerprints.get(fingerprint);
  return fingerprintData?.walletAddress || null;
}
