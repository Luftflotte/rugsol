module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/storage/recent-scans.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addRecentScan",
    ()=>addRecentScan,
    "getRecentScanByAddress",
    ()=>getRecentScanByAddress,
    "getRecentScans",
    ()=>getRecentScans,
    "getRecentScansCount",
    ()=>getRecentScansCount,
    "getStats",
    ()=>getStats
]);
/**
 * Persistent storage for recent scans & stats.
 * Data is kept in memory for speed and flushed to a JSON file on disk
 * so it survives server restarts.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
// --- File path for persistence ---
const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data");
const DATA_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "scans.json");
function loadFromDisk() {
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DATA_FILE)) {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DATA_FILE, "utf-8");
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn("Failed to load scans data from disk:", e);
    }
    return null;
}
let saveTimeout = null;
function saveToDisk() {
    // Debounce: wait 2s after last write to batch multiple rapid scans
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(()=>{
        try {
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DATA_DIR)) {
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(DATA_DIR, {
                    recursive: true
                });
            }
            const data = {
                recentScans: globalRecentScans.recentScans,
                totalScans: globalRecentScans.totalScans,
                rugsDetected: globalRecentScans.rugsDetected,
                scannedAddresses: Array.from(globalRecentScans.scannedAddresses)
            };
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(DATA_FILE, JSON.stringify(data), "utf-8");
        } catch (e) {
            console.warn("Failed to save scans data to disk:", e);
        }
    }, 2000);
}
// --- In-memory state (globalThis for HMR in dev) ---
const globalRecentScans = globalThis;
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
        globalRecentScans.scannedAddresses = new Set();
    }
    globalRecentScans._loaded = true;
}
// Store last 50 scans
const MAX_RECENT_SCANS = 50;
const recentScans = globalRecentScans.recentScans;
// Stats
const scannedAddresses = globalRecentScans.scannedAddresses;
function addRecentScan(scan) {
    // Update stats only for new tokens
    if (!scannedAddresses.has(scan.address)) {
        scannedAddresses.add(scan.address);
        globalRecentScans.totalScans++;
        if (scan.score < 40) {
            globalRecentScans.rugsDetected++;
        }
    }
    // Check if this token was already scanned recently
    const existingIndex = recentScans.findIndex((s)=>s.address === scan.address);
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
function getRecentScanByAddress(address) {
    return recentScans.find((s)=>s.address === address) || null;
}
function getRecentScans(limit = 12) {
    return recentScans.slice(0, limit);
}
function getRecentScansCount() {
    return recentScans.length;
}
function getStats() {
    return {
        totalScans: globalRecentScans.totalScans,
        rugsDetected: globalRecentScans.rugsDetected
    };
}
}),
"[project]/app/api/recent/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$recent$2d$scans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/recent-scans.ts [app-route] (ecmascript)");
;
;
const dynamic = "force-dynamic"; // Disable caching to ensure new scans appear immediately
// In-memory cache for prices
const priceCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes - DexScreener обновляется часто
async function fetchTokenPrices(addresses) {
    if (addresses.length === 0) return new Map();
    const prices = new Map();
    const addressesToFetch = [];
    // Check cache first
    addresses.forEach((address)=>{
        const cached = priceCache.get(address.toLowerCase());
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            prices.set(address.toLowerCase(), cached.price);
        } else {
            addressesToFetch.push(address);
        }
    });
    if (addressesToFetch.length === 0) {
        return prices;
    }
    try {
        // DexScreener API - free, public, no rate limits mentioned
        // Can fetch up to 30 tokens per request
        const batch = addressesToFetch.slice(0, 10);
        const addressesParam = batch.join(",");
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addressesParam}`, {
            next: {
                revalidate: 120
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            console.error("Failed to fetch prices from DexScreener:", response.status);
            return prices;
        }
        const data = await response.json();
        if (data.pairs && Array.isArray(data.pairs)) {
            // Group pairs by token address and pick the one with highest volume
            const tokenPrices = new Map();
            data.pairs.forEach((pair)=>{
                if (pair.baseToken?.address && pair.priceUsd) {
                    const address = pair.baseToken.address.toLowerCase();
                    const price = parseFloat(pair.priceUsd);
                    const volume = pair.volume?.h24 || 0;
                    // Keep the price from pair with highest volume
                    const existing = tokenPrices.get(address);
                    if (!existing || volume > existing.volume) {
                        tokenPrices.set(address, {
                            price,
                            volume
                        });
                    }
                }
            });
            // Update cache and prices map
            tokenPrices.forEach((info, address)=>{
                prices.set(address, info.price);
                priceCache.set(address, {
                    price: info.price,
                    timestamp: Date.now()
                });
            });
        }
        return prices;
    } catch (error) {
        console.error("Error fetching prices from DexScreener:", error);
        return prices;
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "12", 10);
        const recentScans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$recent$2d$scans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRecentScans"])(Math.min(limit, 50)) || [];
        if (!Array.isArray(recentScans)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Internal error: recentScans is not an array"
            }, {
                status: 500
            });
        }
        // Fetch prices for all tokens
        const addresses = recentScans.map((scan)=>scan.address);
        let prices = new Map();
        try {
            prices = await fetchTokenPrices(addresses);
        } catch (e) {
            // Логируем, но не падаем
            console.error("fetchTokenPrices error", e);
        }
        // Add prices to scans
        const scansWithPrices = recentScans.map((scan)=>({
                ...scan,
                price: prices.get(scan.address?.toLowerCase?.()) || null
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: scansWithPrices,
            count: scansWithPrices.length
        });
    } catch (e) {
        console.error("/api/recent error", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__adacb632._.js.map