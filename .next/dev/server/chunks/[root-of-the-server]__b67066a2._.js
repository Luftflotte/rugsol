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
"[project]/app/api/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$recent$2d$scans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/recent-scans.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$recent$2d$scans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStats"])() || {
            totalScans: 0,
            rugsDetected: 0
        };
        const recentCount = typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$recent$2d$scans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRecentScansCount"] === 'function' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$recent$2d$scans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRecentScansCount"])() : 0;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                totalScans: stats.totalScans ?? 0,
                rugsDetected: stats.rugsDetected ?? 0,
                recentCount
            }
        });
    } catch (e) {
        console.error("/api/stats error", e);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__b67066a2._.js.map