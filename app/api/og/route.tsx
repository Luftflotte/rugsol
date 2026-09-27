import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

/** Strip characters unsupported by the Latin-only fonts (Inter / JetBrains Mono). */
function sanitizeForLatinFont(text: string): string {
  const clean = text.replace(/[^\u0020-\u007E\u00A0-\u024F\u0400-\u04FF]/g, "").trim();
  return clean || "?";
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchAndOptimizeImage(url: string | null): Promise<string | null> {
  if (!url || url === "" || url === "undefined" || url === "null") return null;
  let targetUrl = url;
  if (url.startsWith("ipfs://")) targetUrl = url.replace("ipfs://", "https://ipfs.io/ipfs/");
  else if (url.includes("cf-ipfs.com")) targetUrl = url.replace("cf-ipfs.com", "ipfs.io");
  else if (url.includes("gateway.pinata.cloud")) targetUrl = url.replace("gateway.pinata.cloud", "ipfs.io");
  else if (url.includes("cloudflare-ipfs.com")) targetUrl = url.replace("cloudflare-ipfs.com", "ipfs.io");

  try {
    const res = await fetchWithTimeout(targetUrl, 1500);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) return null;

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 500000) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > 500000) {
      return null;
    }

    try {
      const base64 = arrayBufferToBase64(arrayBuffer);
      return `data:${contentType};base64,${base64}`;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// Cache fonts in memory so they're fetched once per server lifetime
let fontCache: { interReg: ArrayBuffer; interBold: ArrayBuffer; jbMono: ArrayBuffer; jbMonoBold: ArrayBuffer } | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const [interReg, interBold, jbMono, jbMonoBold] = await Promise.all([
    fetchWithTimeout("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-400-normal.ttf", 8000).then(r => r.arrayBuffer()),
    fetchWithTimeout("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-700-normal.ttf", 8000).then(r => r.arrayBuffer()),
    fetchWithTimeout("https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@5.1.0/latin-400-normal.ttf", 8000).then(r => r.arrayBuffer()),
    fetchWithTimeout("https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@5.1.0/latin-700-normal.ttf", 8000).then(r => r.arrayBuffer()),
  ]);
  fontCache = { interReg, interBold, jbMono, jbMonoBold };
  return fontCache;
}

function renderHomepageCard(fonts: { interReg: ArrayBuffer; interBold: ArrayBuffer; jbMono: ArrayBuffer; jbMonoBold: ArrayBuffer }) {
  const { interReg, interBold, jbMono, jbMonoBold } = fonts;
  const dateStr = new Date().toLocaleString("en-GB", { timeZone: "UTC", hour12: false }).replace(",", "") + " UTC";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090d",
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
          padding: "36px 48px",
          boxSizing: "border-box",
        }}
      >
        {/* Ambient Top Accent Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #38bdf8 0%, #10b981 50%, #38bdf8 100%)",
            display: "flex",
          }}
        />

        {/* Technical Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ display: "flex" }}>
              <path d="M24 3L42.2 13.5L42.2 34.5L24 45L5.8 34.5L5.8 13.5Z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              <path d="M24 11L35.3 17.5L35.3 30.5L24 37L12.7 30.5L12.7 17.5Z" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth="1" strokeLinejoin="round" />
              <path d="M24 15C19.5 15 16.5 16.5 16.5 19L16.5 24.5C16.5 29 19.5 32 24 34.5C28.5 32 31.5 29 31.5 24.5L31.5 19C31.5 16.5 28.5 15 24 15Z" fill="#38bdf8" />
              <path d="M20.5 23.5L23 26L28 20.5" stroke="#08090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px", lineHeight: 1, display: "flex" }}>
                RugSol
              </span>
              <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase", marginTop: 4, display: "flex" }}>
                SECURITY PROTOCOL // SOLANA
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 6,
              background: "#0e1118",
              border: "1px solid #1e2433",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "flex" }} />
            <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#10b981", fontWeight: 700, display: "flex" }}>
              MAINNET ACTIVE // FAST RPC
            </span>
          </div>
        </div>

        {/* Center Hero Block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 22, position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 18px", borderRadius: 20, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
            <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 700, color: "#38bdf8", letterSpacing: "1px", textTransform: "uppercase", display: "flex" }}>
              AUTOMATED SMART CONTRACT FORENSICS
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: "#f8fafc", letterSpacing: "-1.5px", lineHeight: 1.1, display: "flex" }}>
              Real-Time Solana Token Audit
            </span>
            <span style={{ fontSize: 22, color: "#94a3b8", maxWidth: 820, marginTop: 14, lineHeight: 1.4, display: "flex" }}>
              Instant threat intelligence, honeypot simulation, liquidity lock forensics, and holder clustering analysis.
            </span>
          </div>

          {/* 4 Feature Telemetry Cards */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, width: "100%", maxWidth: 1100 }}>
            {[
              { tag: "[ HONEYPOT ]", title: "Sell Simulator", desc: "Simulates route via Jupiter API" },
              { tag: "[ LP LOCK ]", title: "Liquidity Audit", desc: "Burn & lock status across DEXs" },
              { tag: "[ PRIVILEGES ]", title: "Authority Forensics", desc: "Mint & freeze privilege verification" },
              { tag: "[ WHALES ]", title: "Cluster Forensics", desc: "Concentration & block-0 snipers" },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "18px 16px",
                  borderRadius: 12,
                  background: "#0e1118",
                  border: "1px solid #1e2433",
                }}
              >
                <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#38bdf8", fontWeight: 700, display: "flex" }}>
                  {f.tag}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", display: "flex" }}>
                  {f.title}
                </span>
                <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4, display: "flex" }}>
                  {f.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #1e2433",
            paddingTop: 18,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#64748b", display: "flex" }}>
              TERMINAL AUDITOR v2.4
            </span>
            <span style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#334155", display: "flex" }}>|</span>
            <span style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#64748b", display: "flex" }}>
              TIMESTAMP: {dateStr}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 22px",
              borderRadius: 6,
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.25)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#38bdf8", letterSpacing: "0.5px", display: "flex" }}>
              rugsol.xyz
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Content-Disposition": 'inline; filename="rugsol-og.png"',
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
      fonts: [
        { name: "Inter", data: interReg, weight: 400 },
        { name: "Inter", data: interBold, weight: 700 },
        { name: "JetBrains Mono", data: jbMono, weight: 400 },
        { name: "JetBrains Mono", data: jbMonoBold, weight: 700 },
      ],
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Homepage mode — branded card without token data
    if (searchParams.get("mode") === "home" || (!searchParams.get("address") && !searchParams.get("name"))) {
      const fonts = await loadFonts();
      return renderHomepageCard(fonts);
    }

    const address = searchParams.get("address") || "";
    const rawName = sanitizeForLatinFont(searchParams.get("name") || "Unknown");
    const name = rawName.length > 20 ? rawName.slice(0, 18) + "..." : rawName;
    const symbol = sanitizeForLatinFont(searchParams.get("symbol") || "TOKEN");
    const score = Math.max(0, Math.min(100, parseInt(searchParams.get("score") || "0") || 0));
    const grade = searchParams.get("grade") || "F";
    const gradeLabel = searchParams.get("label") || "High Risk";
    const image = searchParams.get("image");
    const mode = (searchParams.get("mode") || "dex").toUpperCase();
    const rawPrice = searchParams.get("price") || "$0.00";
    const price = rawPrice.length > 15 ? rawPrice.slice(0, 13) + ".." : rawPrice;
    const mcap = searchParams.get("mcap") || "0";
    const rawChange = (searchParams.get("change") || "0%").trim();
    let change = rawChange;
    if (!change.startsWith("-") && !change.startsWith("+") && change !== "0%" && !change.startsWith("0")) {
      change = `+${change}`;
    }
    const liq = searchParams.get("liq") || "$0";
    const top10 = searchParams.get("top10") || "0%";
    const lock = searchParams.get("lock") || "No";
    const sell = searchParams.get("sell") || "Yes";
    const mint = searchParams.get("mint") || "Revoked";
    const penalty = Math.min(100, Math.max(0, parseInt(searchParams.get("penalty") || "0") || 0));
    const isLight = searchParams.get("theme") === "light";

    const fonts = await loadFonts();
    const { interReg, interBold, jbMono, jbMonoBold } = fonts;

    // Workaround: Skip WebP images — Satori doesn't support WebP decoding
    let tokenImage: string | null = null;
    if (image?.toLowerCase().endsWith(".webp")) {
      tokenImage = null;
    } else {
      tokenImage = await fetchAndOptimizeImage(image);
    }

    // Determine status color & severity
    const isSafe = score >= 70;
    const isMedium = score >= 40 && score < 70;
    const statusColor = isSafe ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444";

    // High-contrast clean color scheme
    const c = isLight
      ? {
          bg: "#f8fafc",
          cardBg: "#ffffff",
          chipBg: "#f1f5f9",
          border: "#cbd5e1",
          textPrimary: "#0f172a",
          textSecondary: "#334155",
          textMuted: "#64748b",
          gridColor: "rgba(0, 0, 0, 0.04)",
          brandCyan: "#0284c7",
        }
      : {
          bg: "#08090d",
          cardBg: "#0e1118",
          chipBg: "#141824",
          border: "#1e2433",
          textPrimary: "#f8fafc",
          textSecondary: "#94a3b8",
          textMuted: "#64748b",
          gridColor: "rgba(255, 255, 255, 0.025)",
          brandCyan: "#38bdf8",
        };

    const dateStr = new Date().toLocaleString("en-GB", { timeZone: "UTC", hour12: false }).replace(",", "") + " UTC";

    // Metric evaluations
    const isLiqCritical = liq === "$0" || liq === "0" || liq === "0%";
    const top10Num = parseFloat(top10) || 0;
    const isTop10Critical = top10Num > 60;
    const isTop10Warning = top10Num > 40;
    const isSellOk = sell === "Yes";
    const isMintRevoked = mint === "Revoked" || mint === "Locked";

    let lpStatusColor = "#10b981";
    let lpStatusLabel = "LOCKED";
    let lpStatusValue = lock === "No" ? "Unlocked" : lock;
    if (mode === "PUMP") {
      const snipers = parseInt(lock) || 0;
      lpStatusValue = `${snipers} Snipers`;
      if (snipers > 5) {
        lpStatusColor = "#ef4444";
        lpStatusLabel = "BOT HEAVY";
      } else if (snipers > 0) {
        lpStatusColor = "#f59e0b";
        lpStatusLabel = "SNIPES";
      } else {
        lpStatusColor = "#10b981";
        lpStatusLabel = "CLEAN";
      }
    } else {
      if (lock === "Burned" || lock === "100% Burned") {
        lpStatusColor = "#10b981";
        lpStatusLabel = "BURNED";
      } else if (lock === "Locked") {
        lpStatusColor = "#10b981";
        lpStatusLabel = "LOCKED";
      } else {
        lpStatusColor = "#ef4444";
        lpStatusLabel = "UNLOCKED";
      }
    }

    // Geometry for large high-impact circular dial:
    // ViewBox: 210x210, Center: cx=105, cy=105, Radius: 84
    // Circumference: 2 * PI * 84 = 527.79
    const dialRadius = 84;
    const dialCircumference = 527.79;
    const dialOffset = dialCircumference * (1 - score / 100);

    const displayAddress = address.length > 24 ? `${address.slice(0, 10)}...${address.slice(-10)}` : address;
    const priceFontSize = price.length > 11 ? 40 : price.length > 8 ? 46 : 52;

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: c.bg,
            fontFamily: "Inter",
            position: "relative",
            overflow: "hidden",
            padding: "30px 42px 24px",
            boxSizing: "border-box",
          }}
        >
          {/* Top Status Accent Bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: statusColor,
              display: "flex",
            }}
          />

          {/* Grid Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              backgroundImage: `linear-gradient(${c.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${c.gridColor} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Ambient Glow behind Score Gauge */}
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${statusColor}18 0%, transparent 70%)`,
              right: -50,
              top: 30,
              display: "flex",
            }}
          />

          {/* 1. Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Left: Avatar + Token Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: c.chipBg,
                  border: `2px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {tokenImage ? (
                  <img src={tokenImage} width="64" height="64" style={{ objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 800, color: c.brandCyan, fontFamily: "JetBrains Mono", display: "flex" }}>
                    {symbol.slice(0, 3)}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: c.textPrimary, letterSpacing: "-0.5px", lineHeight: 1, display: "flex" }}>
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: mode === "PUMP" ? "rgba(249,115,22,0.14)" : "rgba(56,189,248,0.14)",
                      color: mode === "PUMP" ? "#fb923c" : c.brandCyan,
                      border: mode === "PUMP" ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(56,189,248,0.3)",
                      display: "flex",
                    }}
                  >
                    {mode === "PUMP" ? "[ PUMP.FUN ]" : "[ DEX POOL ]"}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: c.brandCyan, fontFamily: "JetBrains Mono", display: "flex" }}>
                    ${symbol}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: c.textSecondary, fontWeight: 600, display: "flex" }}>
                    {displayAddress}
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#475569", display: "flex" }}>•</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#10b981", fontWeight: 700, display: "flex" }}>
                    SOLANA MAINNET
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Telemetry Stamp */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
                padding: "10px 16px",
                borderRadius: 8,
                background: c.cardBg,
                border: `1px solid ${c.border}`,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, fontWeight: 700, letterSpacing: "1px", display: "flex" }}>
                [ ON-CHAIN AUDIT // 8+ VECTORS ]
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, display: "flex" }} />
                <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: statusColor, fontWeight: 800, display: "flex" }}>
                  {isSafe ? "AUDIT VERIFIED CLEAN" : isMedium ? "WARNINGS DETECTED" : "CRITICAL RISK IDENTIFIED"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Middle Content Grid */}
          <div style={{ display: "flex", gap: 24, alignItems: "stretch", position: "relative", zIndex: 10, flex: 1, margin: "16px 0" }}>
            {/* Left Column: Price, Banner, 5 Metrics */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {/* Price & MCAP Row */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: priceFontSize, fontWeight: 800, color: c.textPrimary, letterSpacing: "-1.5px", lineHeight: 1, display: "flex" }}>
                    {price}
                  </span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono",
                      fontSize: 18,
                      fontWeight: 800,
                      padding: "5px 12px",
                      borderRadius: 6,
                      background: change.startsWith("-") ? "rgba(239,68,68,0.14)" : "rgba(16,185,129,0.14)",
                      color: change.startsWith("-") ? "#ef4444" : "#10b981",
                      border: change.startsWith("-") ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)",
                      display: "flex",
                    }}
                  >
                    {change}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: c.textSecondary, fontWeight: 700, display: "flex" }}>
                    MCAP: {mcap}
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#475569", display: "flex" }}>|</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: c.textMuted, display: "flex" }}>
                    ENGINE: RUGSOL v2.4
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#475569", display: "flex" }}>|</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: c.textMuted, display: "flex" }}>
                    REAL-TIME TELEMETRY
                  </span>
                </div>
              </div>

              {/* Security Deductions Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderRadius: 10,
                  background: penalty === 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  border: penalty === 0 ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {penalty === 0 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
                      <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
                      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 800, color: penalty === 0 ? "#10b981" : "#ef4444", display: "flex" }}>
                    {penalty === 0
                      ? "0 PENALTIES — ALL SMART CONTRACT VECTORS CLEAN"
                      : `-${penalty} PTS DEDUCTIONS — ${penalty >= 50 ? "CRITICAL RISKS COMPROMISED" : "CONTRACT RISKS DETECTED"}`}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: penalty === 0 ? "#10b981" : "#ef4444", fontWeight: 800, display: "flex" }}>
                    {penalty === 0 ? "100% CLEAN" : `-${penalty} PTS`}
                  </span>
                  <div style={{ width: 110, height: 8, borderRadius: 4, background: c.border, overflow: "hidden", display: "flex" }}>
                    <div
                      style={{
                        height: "100%",
                        width: penalty === 0 ? "100%" : `${Math.min(100, (penalty / 100) * 100)}%`,
                        background: penalty === 0 ? "#10b981" : penalty >= 50 ? "#ef4444" : "#f59e0b",
                        display: "flex",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 5 Core Telemetry Metric Cards */}
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                {/* Metric 1: Liquidity */}
                <div
                  style={{
                    flex: 1,
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 108,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex" }}>
                    {mode === "PUMP" ? "CURVE" : "LIQUIDITY"}
                  </span>
                  <span style={{ fontSize: 21, fontFamily: "JetBrains Mono", color: isLiqCritical ? "#ef4444" : "#10b981", fontWeight: 800, display: "flex" }}>
                    {liq}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 4,
                      background: isLiqCritical ? "rgba(239,68,68,0.14)" : "rgba(16,185,129,0.14)",
                      color: isLiqCritical ? "#ef4444" : "#10b981",
                      border: isLiqCritical ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)",
                      alignSelf: "flex-start",
                      display: "flex",
                    }}
                  >
                    {isLiqCritical ? "ZERO POOL" : mode === "PUMP" ? "PROGRESS" : "HEALTHY"}
                  </span>
                </div>

                {/* Metric 2: Top 10 */}
                <div
                  style={{
                    flex: 1,
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 108,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex" }}>
                    TOP 10
                  </span>
                  <span style={{ fontSize: 21, fontFamily: "JetBrains Mono", color: isTop10Critical ? "#ef4444" : isTop10Warning ? "#f59e0b" : "#10b981", fontWeight: 800, display: "flex" }}>
                    {top10}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 4,
                      background: isTop10Critical
                        ? "rgba(239,68,68,0.14)"
                        : isTop10Warning
                        ? "rgba(245,158,11,0.14)"
                        : "rgba(16,185,129,0.14)",
                      color: isTop10Critical ? "#ef4444" : isTop10Warning ? "#f59e0b" : "#10b981",
                      border: isTop10Critical
                        ? "1px solid rgba(239,68,68,0.3)"
                        : isTop10Warning
                        ? "1px solid rgba(245,158,11,0.3)"
                        : "1px solid rgba(16,185,129,0.3)",
                      alignSelf: "flex-start",
                      display: "flex",
                    }}
                  >
                    {isTop10Critical ? "DANGEROUS" : isTop10Warning ? "CAUTION" : "CLEAN"}
                  </span>
                </div>

                {/* Metric 3: LP Lock */}
                <div
                  style={{
                    flex: 1,
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 108,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex" }}>
                    {mode === "PUMP" ? "SNIPERS" : "LP LOCK"}
                  </span>
                  <span style={{ fontSize: 21, fontFamily: "JetBrains Mono", color: lpStatusColor, fontWeight: 800, display: "flex" }}>
                    {lpStatusValue}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 4,
                      background: `${lpStatusColor}18`,
                      color: lpStatusColor,
                      border: `1px solid ${lpStatusColor}35`,
                      alignSelf: "flex-start",
                      display: "flex",
                    }}
                  >
                    {lpStatusLabel}
                  </span>
                </div>

                {/* Metric 4: Honeypot */}
                <div
                  style={{
                    flex: 1,
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 108,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex" }}>
                    HONEYPOT
                  </span>
                  <span style={{ fontSize: 21, fontFamily: "JetBrains Mono", color: isSellOk ? "#10b981" : "#ef4444", fontWeight: 800, display: "flex" }}>
                    {isSellOk ? "Passed" : "Trap"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 4,
                      background: isSellOk ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                      color: isSellOk ? "#10b981" : "#ef4444",
                      border: isSellOk ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)",
                      alignSelf: "flex-start",
                      display: "flex",
                    }}
                  >
                    {isSellOk ? "SELLABLE" : "TRAPPED"}
                  </span>
                </div>

                {/* Metric 5: Mint Auth */}
                <div
                  style={{
                    flex: 1,
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 108,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex" }}>
                    MINT AUTH
                  </span>
                  <span style={{ fontSize: 21, fontFamily: "JetBrains Mono", color: isMintRevoked ? "#10b981" : "#ef4444", fontWeight: 800, display: "flex" }}>
                    {isMintRevoked ? "Revoked" : "Active"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 4,
                      background: isMintRevoked ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                      color: isMintRevoked ? "#10b981" : "#ef4444",
                      border: isMintRevoked ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)",
                      alignSelf: "flex-start",
                      display: "flex",
                    }}
                  >
                    {isMintRevoked ? "IMMUTABLE" : "INFLATABLE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Impact Score Hero Panel */}
            <div
              style={{
                width: 360,
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: 16,
                padding: "22px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              {/* Giant Radial Score Gauge (210x210) */}
              <div style={{ position: "relative", width: 210, height: 210, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Calibrated outer tick bezel */}
                <svg width="210" height="210" viewBox="0 0 210 210" style={{ position: "absolute", top: 0, left: 0, display: "flex" }}>
                  <circle cx="105" cy="105" r="98" fill="none" stroke={c.border} strokeWidth="1" strokeDasharray="3 6" />
                </svg>

                {/* Progress SVG rotated -90deg */}
                <svg
                  width="210"
                  height="210"
                  viewBox="0 0 210 210"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: "rotate(-90deg)",
                    display: "flex",
                  }}
                >
                  {/* Track */}
                  <circle cx="105" cy="105" r={dialRadius} fill="none" stroke={c.border} strokeWidth="10" />
                  {/* Active Progress */}
                  <circle
                    cx="105"
                    cy="105"
                    r={dialRadius}
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={dialCircumference}
                    strokeDashoffset={dialOffset}
                  />
                </svg>

                {/* Spacious Center Readout */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span style={{ fontSize: 62, fontWeight: 900, fontFamily: "JetBrains Mono", color: statusColor, lineHeight: 1, display: "flex" }}>
                      {score}
                    </span>
                    <span style={{ fontSize: 15, fontFamily: "JetBrains Mono", color: c.textMuted, marginLeft: 2, fontWeight: 700, display: "flex" }}>
                      /100
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: c.textMuted, letterSpacing: "2px", textTransform: "uppercase", marginTop: 4, fontWeight: 700, display: "flex" }}>
                    SAFETY SCORE
                  </span>
                </div>
              </div>

              {/* Verdict Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: `${statusColor}18`,
                  border: `2px solid ${statusColor}40`,
                  color: statusColor,
                  fontFamily: "JetBrains Mono",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, display: "flex" }} />
                <span>GRADE {grade} • {gradeLabel.toUpperCase()}</span>
              </div>

              {/* Security Vectors Pills with crisp SVG icons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", width: "100%" }}>
                {[
                  { text: isMintRevoked ? "MINT REVOKED" : "MINT ACTIVE", pass: isMintRevoked },
                  { text: lpStatusLabel === "BURNED" ? "LP BURNED" : lpStatusLabel === "LOCKED" ? "LP LOCKED" : "LP UNLOCKED", pass: lpStatusLabel === "BURNED" || lpStatusLabel === "LOCKED" },
                  { text: isSellOk ? "HONEYPOT PASS" : "HONEYPOT FAIL", pass: isSellOk },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 11,
                      fontFamily: "JetBrains Mono",
                      fontWeight: 700,
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: item.pass ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      border: item.pass ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)",
                      color: item.pass ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {item.pass ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
                        <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span>{item.text}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Footer Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${c.border}`,
              paddingTop: 16,
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Left: RugSol Terminal Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ display: "flex" }}>
                <path d="M24 3L42.2 13.5L42.2 34.5L24 45L5.8 34.5L5.8 13.5Z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M24 11L35.3 17.5L35.3 30.5L24 37L12.7 30.5L12.7 17.5Z" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth="1" strokeLinejoin="round" />
                <path d="M24 15C19.5 15 16.5 16.5 16.5 19L16.5 24.5C16.5 29 19.5 32 24 34.5C28.5 32 31.5 29 31.5 24.5L31.5 19C31.5 16.5 28.5 15 24 15Z" fill="#38bdf8" />
                <path d="M20.5 23.5L23 26L28 20.5" stroke="#08090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: c.textPrimary, letterSpacing: "-0.5px", display: "flex" }}>
                  RugSol
                </span>
                <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", display: "flex" }}>
                  TERMINAL AUDITOR v2.4
                </span>
              </div>
            </div>

            {/* Center: Timestamp */}
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: c.textMuted, display: "flex" }}>
              TIMESTAMP: {dateStr}
            </span>

            {/* Right: Domain Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                borderRadius: 6,
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.25)",
              }}
            >
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#38bdf8", letterSpacing: "0.5px", display: "flex" }}>
                rugsol.xyz
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Content-Disposition": `inline; filename="rugsol-${symbol.toLowerCase()}-${score}.png"`,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
        fonts: [
          { name: "Inter", data: interReg, weight: 400 },
          { name: "Inter", data: interBold, weight: 700 },
          { name: "JetBrains Mono", data: jbMono, weight: 400 },
          { name: "JetBrains Mono", data: jbMonoBold, weight: 700 },
        ],
      }
    );
  } catch (error) {
    console.error("OG Generation Error:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
