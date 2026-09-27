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
          padding: "36px 52px 28px",
          boxSizing: "border-box",
        }}
      >
        {/* Top Accent Stripe */}
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

        {/* Header */}
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
              padding: "8px 18px",
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

        {/* Center Hero */}
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
            <span style={{ fontSize: 22, color: "#94a3b8", maxWidth: 840, marginTop: 14, lineHeight: 1.4, display: "flex" }}>
              Instant threat intelligence, honeypot simulation, liquidity lock forensics, and holder clustering analysis.
            </span>
          </div>

          {/* 4 Cards */}
          <div style={{ display: "flex", gap: 16, marginTop: 10, width: "100%", maxWidth: 1080 }}>
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #1e2433",
            paddingTop: 16,
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
              padding: "10px 28px",
              borderRadius: 8,
              background: "rgba(56,189,248,0.14)",
              border: "2px solid #38bdf8",
              boxShadow: "0 0 20px rgba(56,189,248,0.3)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 800, color: "#38bdf8", letterSpacing: "0.5px", display: "flex" }}>
              rugsol.xyz →
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
    const rawPrice = (searchParams.get("price") || "$0.00").trim();
    const displayPrice = rawPrice.startsWith("$") ? rawPrice : `$${rawPrice}`;
    const price = displayPrice.length > 14 ? displayPrice.slice(0, 12) + ".." : displayPrice;
    
    // Safely format Market Cap without double dollar sign bug
    const rawMcap = searchParams.get("mcap") || "0";
    const displayMcap = rawMcap.startsWith("$") ? rawMcap : `$${rawMcap}`;

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
    const tagsParam = searchParams.get("tags") || "";
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : ["Analyzed"];
    const tagPointsParam = searchParams.get("tagPoints") || "";
    const tagPointsList = tagPointsParam ? tagPointsParam.split(",").map(Number) : [];
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

    // Status colors matching site design
    const isSafe = score >= 60;
    const isMedium = score >= 40 && score < 60;
    const theme = {
      ac: isSafe ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444",
      acBg: isSafe ? "rgba(16, 185, 129, 0.1)" : isMedium ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
      acBorder: isSafe ? "rgba(16, 185, 129, 0.28)" : isMedium ? "rgba(245, 158, 11, 0.28)" : "rgba(239, 68, 68, 0.28)",
    };

    // Color palette matching site design
    const c = isLight
      ? {
          bg: "#f8fafc",
          cardBg: "#ffffff",
          subtler: "#f1f5f9",
          subtle: "#e2e8f0",
          text: "#0f172a",
          textDim: "#64748b",
          textGhost: "rgba(0,0,0,0.25)",
          textMuted: "#94a3b8",
          grid: "rgba(0,0,0,0.03)",
          footerBg: "#ffffff",
          footerBorder: "#e2e8f0",
          brandCyan: "#0284c7",
        }
      : {
          bg: "#08090d",
          cardBg: "#0e1118",
          subtler: "#141824",
          subtle: "#1e2433",
          text: "#f8fafc",
          textDim: "#94a3b8",
          textGhost: "rgba(255,255,255,0.25)",
          textMuted: "#64748b",
          grid: "rgba(255,255,255,0.025)",
          footerBg: "#08090d",
          footerBorder: "#1e2433",
          brandCyan: "#38bdf8",
        };

    const dateStr = new Date().toLocaleString("en-GB", { timeZone: "UTC", hour12: false }).replace(",", "") + " UTC";

    // Dynamic price font size to prevent collisions on micro-cap fractional prices
    const priceFontSize = price.length > 11 ? 44 : price.length > 8 ? 48 : 54;

    // LP Lock status & color
    let m3Color = "#10b981";
    let displayLock = lock;
    if (mode === "PUMP") {
      const snipers = parseInt(lock) || 0;
      displayLock = `${snipers} Snipers`;
      if (snipers > 5) m3Color = "#ef4444";
      else if (snipers > 0) m3Color = "#f59e0b";
      else m3Color = "#10b981";
    } else {
      if (lock === "No" || lock === "Active" || lock === "0") {
        m3Color = "#ef4444";
        displayLock = "Unlocked";
      } else {
        m3Color = "#10b981";
      }
    }

    // Geometry for the calibrated circular dial
    const circum = 680;
    const offset = circum * (1 - score / 100);

    // 40 precision calibrated tick marks radiating around the dial
    const tickCount = 40;
    const filledTicks = Math.floor((score * tickCount) / 100);
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const a = -Math.PI / 2 + i * ((2 * Math.PI) / tickCount);
      const isLong = i % 10 === 0;
      const iR = 120;
      const oR = isLong ? 134 : 127;
      return {
        x1: 135 + iR * Math.cos(a),
        y1: 135 + iR * Math.sin(a),
        x2: 135 + oR * Math.cos(a),
        y2: 135 + oR * Math.sin(a),
        isLong,
        filled: i < filledTicks,
      };
    });

    const endA = -Math.PI / 2 + (score / 100) * 2 * Math.PI;
    const capX = 135 + 108 * Math.cos(endA);
    const capY = 135 + 108 * Math.sin(endA);

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            background: c.bg,
            fontFamily: "Inter",
            position: "relative",
            overflow: "hidden",
            justifyContent: "space-between",
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
              background: theme.ac,
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
              backgroundImage: `linear-gradient(${c.grid} 1px, transparent 1px), linear-gradient(90deg, ${c.grid} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.ac}16 0%, transparent 68%)`,
              right: 40,
              top: 20,
              display: "flex",
            }}
          />

          {/* Main Body */}
          <div style={{ flex: 1, display: "flex", padding: "40px 60px 24px", gap: 48, position: "relative", zIndex: 10 }}>
            {/* Left Column: Avatar + Name + Address -> Price -> Penalty -> 5-Cell Metric Bar */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {/* 1. Avatar + Name + Address Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 18,
                    background: c.subtler,
                    border: `1.5px solid ${c.subtle}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {tokenImage ? (
                    <img src={tokenImage} width="78" height="78" style={{ objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 800, color: c.brandCyan, fontFamily: "JetBrains Mono", display: "flex" }}>
                      {symbol.slice(0, 3)}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 38, fontWeight: 900, color: c.text, letterSpacing: "-1px", lineHeight: 1, display: "flex" }}>
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "JetBrains Mono",
                        padding: "4px 10px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                        background: mode === "PUMP" ? "rgba(249,115,22,0.14)" : "rgba(16,185,129,0.14)",
                        color: mode === "PUMP" ? "#fb923c" : "#10b981",
                        border: mode === "PUMP" ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(16,185,129,0.3)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {mode === "PUMP" ? "PUMP" : "DEX"}
                    </span>
                    <span style={{ fontSize: 20, color: c.textDim, fontWeight: 600, fontFamily: "JetBrains Mono", display: "flex" }}>
                      ${symbol}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: c.textMuted, letterSpacing: "0.5px", display: "flex" }}>
                      {address}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Price + Market Cap Row */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: priceFontSize, fontWeight: 800, color: c.text, letterSpacing: "-2px", lineHeight: 1, display: "flex" }}>
                    {price}
                  </span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono",
                      fontSize: 22,
                      fontWeight: 700,
                      color: change.startsWith("-") ? "#ef4444" : change === "0%" ? c.textDim : "#10b981",
                      lineHeight: 1,
                      display: "flex",
                    }}
                  >
                    {change}
                  </span>
                </div>

                <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: c.textMuted, marginTop: 8, letterSpacing: "0.5px", fontWeight: 600, display: "flex" }}>
                  MC {displayMcap}
                </div>
              </div>

              {/* 3. Penalty Bar Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    fontFamily: "JetBrains Mono",
                    fontSize: 14,
                    fontWeight: 600,
                    color: penalty === 0 ? "#10b981" : penalty >= 50 ? "#ef4444" : "#f59e0b",
                    display: "flex",
                  }}
                >
                  {penalty === 0 ? "No penalties" : `-${penalty} points deducted`}
                </span>

                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 3,
                      width: penalty === 0 ? "0%" : `${Math.min(100, penalty)}%`,
                      background: penalty >= 50 ? "#ef4444" : penalty >= 25 ? "#f59e0b" : "#eab308",
                      display: "flex",
                    }}
                  />
                </div>
              </div>

              {/* 4. Original 5-Cell Continuous Metric Bar */}
              <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", border: `1px solid ${c.subtle}`, background: c.cardBg, marginTop: 32 }}>
                {[
                  { l: mode === "PUMP" ? "Curve" : "Liquidity", v: liq, c: (liq === "$0" || liq === "0" || liq === "0%") ? "#ef4444" : "#10b981" },
                  { l: "Top 10", v: top10, c: parseInt(top10) > 50 ? "#ef4444" : parseInt(top10) > 30 ? "#f59e0b" : "#10b981" },
                  { l: mode === "PUMP" ? "Snipers" : "LP Lock", v: displayLock, c: m3Color },
                  { l: "Sellable", v: sell === "Yes" ? "Yes" : "Trap", c: sell === "Yes" ? "#10b981" : "#ef4444" },
                  { l: "Mint", v: mint === "Revoked" || mint === "Locked" ? "Revoked" : "Active", c: (mint === "Revoked" || mint === "Locked") ? "#10b981" : "#ef4444" },
                ].map((m, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: "18px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      borderLeft: i === 0 ? "0" : `1px solid ${c.subtle}`,
                    }}
                  >
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: "1.5px", color: c.textMuted, fontWeight: 600, display: "flex" }}>
                      {m.l}
                    </span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 800, color: m.c, display: "flex" }}>
                      {m.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Original 270x270 Score Dial, Grade Badge, Tags */}
            <div style={{ width: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              {/* Circular Gauge with Calibrated Tick Marks */}
              <div style={{ position: "relative", width: 270, height: 270, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Subtle accent fill inside ring */}
                <div style={{ position: "absolute", width: 196, height: 196, borderRadius: "50%", background: theme.acBg, top: 37, left: 37, display: "flex" }} />

                {/* Soft radial glow */}
                <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${theme.ac}20 0%, transparent 70%)`, top: 55, left: 55, display: "flex" }} />

                {/* Calibrated Tick Marks radiating outward */}
                <svg width="270" height="270" viewBox="0 0 270 270" style={{ position: "absolute", top: 0, left: 0, display: "flex" }}>
                  {ticks.map((t, i) => (
                    <line
                      key={i}
                      x1={t.x1}
                      y1={t.y1}
                      x2={t.x2}
                      y2={t.y2}
                      stroke={theme.ac}
                      strokeWidth={t.isLong ? 2.5 : 1.5}
                      strokeLinecap="round"
                      style={{ opacity: t.filled ? 0.95 : 0.22 }}
                    />
                  ))}
                </svg>

                {/* Main Progress Ring */}
                <svg
                  width="270"
                  height="270"
                  viewBox="0 0 270 270"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: "rotate(-90deg)",
                    display: "flex",
                  }}
                >
                  <circle cx="135" cy="135" r="108" fill="none" stroke={c.subtle} strokeWidth="12" />
                  <circle
                    cx="135"
                    cy="135"
                    r="108"
                    fill="none"
                    stroke={theme.ac}
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={circum}
                    strokeDashoffset={offset}
                    style={{ opacity: 0.95 }}
                  />
                </svg>

                {/* Arc Cap Marker */}
                {score > 0 && score < 100 && (
                  <svg width="270" height="270" viewBox="0 0 270 270" style={{ position: "absolute", top: 0, left: 0, display: "flex" }}>
                    <circle cx={capX} cy={capY} r="5" fill={theme.ac} style={{ opacity: 0.95 }} />
                  </svg>
                )}

                {/* Score centered in circle, / 100 below */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "Inter", fontSize: score === 100 ? 94 : 100, fontWeight: 900, color: theme.ac, letterSpacing: "-4px", lineHeight: 1, display: "flex" }}>
                    {score}
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: c.textMuted, opacity: 0.65, marginTop: 4, display: "flex" }}>
                    / 100
                  </span>
                </div>
              </div>

              {/* Grade Badge */}
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  fontFamily: "JetBrains Mono",
                  padding: "9px 24px",
                  borderRadius: 100,
                  background: theme.acBg,
                  border: `2px solid ${theme.acBorder}`,
                  color: theme.ac,
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.ac, display: "flex" }} />
                <span>Grade {grade} · {gradeLabel}</span>
              </div>

              {/* Tags with severity dots */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 360 }}>
                {tags.map((t, i) => {
                  const pts = tagPointsList[i] || 0;
                  const tagColor = pts >= 30 ? "#ef4444" : pts >= 15 ? "#f59e0b" : pts > 0 ? "#eab308" : "#10b981";
                  return (
                    <span
                      key={i}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "6px 14px",
                        borderRadius: 100,
                        background: `${tagColor}15`,
                        border: `1px solid ${tagColor}30`,
                        color: `${tagColor}ee`,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: tagColor, display: "flex" }} />
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer: RugSol Branding & Prominent Viral Domain */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 60px",
              background: c.footerBg,
              borderTop: `1px solid ${c.footerBorder}`,
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Left: RugSol Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" style={{ display: "flex" }}>
                <path d="M24 3L42.2 13.5L42.2 34.5L24 45L5.8 34.5L5.8 13.5Z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M24 11L35.3 17.5L35.3 30.5L24 37L12.7 30.5L12.7 17.5Z" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth="1" strokeLinejoin="round" />
                <path d="M24 15C19.5 15 16.5 16.5 16.5 19L16.5 24.5C16.5 29 19.5 32 24 34.5C28.5 32 31.5 29 31.5 24.5L31.5 19C31.5 16.5 28.5 15 24 15Z" fill="#38bdf8" />
                <path d="M20.5 23.5L23 26L28 20.5" stroke="#08090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: c.text, letterSpacing: "-0.5px", lineHeight: 1, display: "flex" }}>
                  RugSol
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, letterSpacing: "3px", textTransform: "uppercase", marginTop: 3, display: "flex" }}>
                  SCANNER
                </span>
              </div>
            </div>

            {/* Right: Timestamp + High-Visibility Domain Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: c.textMuted, display: "flex" }}>
                {dateStr}
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "9px 24px",
                  borderRadius: 100,
                  background: "rgba(56, 189, 248, 0.12)",
                  border: "2px solid #38bdf8",
                  boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
                }}
              >
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 19, fontWeight: 800, color: "#38bdf8", letterSpacing: "0.5px", display: "flex" }}>
                  rugsol.xyz →
                </span>
              </div>
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
