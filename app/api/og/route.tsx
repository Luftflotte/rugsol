import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process in chunks to avoid stack overflow
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
    const res = await fetchWithTimeout(targetUrl, 6000);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) return null;

    // Проверяем размер изображения (лимит 500KB для безопасности)
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 500000) {
      console.warn(`Image too large: ${contentLength} bytes`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();

    // Дополнительная проверка размера после загрузки
    if (arrayBuffer.byteLength > 500000) {
      console.warn(`Image buffer too large: ${arrayBuffer.byteLength} bytes`);
      return null;
    }

    // Безопасная конвертация в base64
    try {
      const base64 = arrayBufferToBase64(arrayBuffer);
      return `data:${contentType};base64,${base64}`;
    } catch (e) {
      console.error("Failed to convert image to base64:", e);
      return null;
    }
  } catch (e) {
    console.error("Failed to fetch image:", e);
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
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", background: "linear-gradient(150deg, #080d08 0%, #0b130b 45%, #090f09 100%)", fontFamily: "Inter", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "#22c55e", opacity: 0.04, filter: "blur(140px)", right: -120, top: -120, display: "flex" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#22c55e", opacity: 0.03, filter: "blur(100px)", left: -100, bottom: -200, display: "flex" }} />
        <div style={{ height: 5, width: "100%", background: "linear-gradient(90deg, transparent 0%, #22c55e 50%, transparent 100%)", display: "flex" }} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, position: "relative", padding: "0 72px" }}>
          {/* Logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="72" height="72" viewBox="0 0 48 48" fill="none" style={{ display: "flex" }}><path d="M24 3L42.2 13.5L42.2 34.5L24 45L5.8 34.5L5.8 13.5Z" stroke="#c0c0c0" strokeWidth="1.5" strokeLinejoin="round" fill="none"/><path d="M24 11L35.3 17.5L35.3 30.5L24 37L12.7 30.5L12.7 17.5Z" fill="rgba(192,192,192,0.08)" stroke="#c0c0c0" strokeWidth="1" strokeLinejoin="round"/><path d="M24 15C19.5 15 16.5 16.5 16.5 19L16.5 24.5C16.5 29 19.5 32 24 34.5C28.5 32 31.5 29 31.5 24.5L31.5 19C31.5 16.5 28.5 15 24 15Z" fill="#c0c0c0"/><path d="M20.5 23.5L23 26L28 20.5" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 64, fontWeight: 900, color: "#ffffff", letterSpacing: "-2px", lineHeight: 1, display: "flex" }}>RugSol</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "6px", textTransform: "uppercase", marginTop: 6, display: "flex" }}>Token Scanner</span>
            </div>
          </div>

          {/* Tagline */}
          <span style={{ fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.4)", textAlign: "center", maxWidth: 700, lineHeight: 1.4, display: "flex" }}>Instant rug pull detection for Solana tokens</span>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {["On-chain Analysis", "Honeypot Detection", "Holder Clustering", "Pump.fun Support"].map((f, i) => (
              <span key={i} style={{ fontSize: 15, fontWeight: 600, padding: "10px 22px", borderRadius: 100, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", color: "rgba(34,197,94,0.7)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", opacity: 0.6, display: "flex" }} />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "22px 72px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 28px", borderRadius: 100, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px", display: "flex" }}>rugsol.live</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: {
      "Content-Disposition": 'inline; filename="rugsol-og.png"',
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    }, fonts: [
      { name: "Inter", data: interReg, weight: 400 },
      { name: "Inter", data: interBold, weight: 700 },
      { name: "JetBrains Mono", data: jbMono, weight: 400 },
      { name: "JetBrains Mono", data: jbMonoBold, weight: 700 },
    ]}
  );
}

function hashAddress(address: string): {
  blur1X: number; blur1Y: number; blur1Size: number;
  blur2X: number; blur2Y: number; blur2Size: number;
  gridOffset: number; gridRotation: number;
  hueShift: number; cornerSeed: string;
  decorAngle: number; decorDistance: number;
} {
  const hash = (s: string, max: number) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h) % max;
  };

  const addr = address || "default";
  return {
    blur1X: -80 + hash(addr + "b1x", 160),
    blur1Y: -160 + hash(addr + "b1y", 100),
    blur1Size: 500 + hash(addr + "b1s", 400),
    blur2X: -200 + hash(addr + "b2x", 200),
    blur2Y: -250 + hash(addr + "b2y", 200),
    blur2Size: 400 + hash(addr + "b2s", 300),
    gridOffset: hash(addr + "grid", 32),
    gridRotation: hash(addr + "rot", 15) - 7,
    hueShift: hash(addr + "hue", 20) - 10,
    cornerSeed: addr.slice(-8),
    decorAngle: hash(addr + "da", 360),
    decorDistance: 100 + hash(addr + "dd", 150),
  };
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
    const unique = hashAddress(address);
    const rawName = searchParams.get("name") || "Unknown";
    const name = rawName.length > 20 ? rawName.slice(0, 18) + "..." : rawName;
    const symbol = searchParams.get("symbol") || "TOKEN";
    const score = Math.max(0, Math.min(100, parseInt(searchParams.get("score") || "0") || 0));
    const grade = searchParams.get("grade") || "F";
    const gradeLabel = searchParams.get("label") || "Likely Scam";
    const image = searchParams.get("image");
    const mode = (searchParams.get("mode") || "dex").toUpperCase();
    const rawPrice = searchParams.get("price") || "$0.00";
    const price = rawPrice.length > 14 ? rawPrice.slice(0, 12) + ".." : rawPrice;
    const mcap = searchParams.get("mcap") || "0";
    const rawChange = searchParams.get("change") || "0%";
    const change = rawChange.length > 8 ? rawChange.slice(0, 7) + "%" : rawChange;
    const liq = searchParams.get("liq") || "$0";
    const top10 = searchParams.get("top10") || "0%";
    const lock = searchParams.get("lock") || "No";
    const sell = searchParams.get("sell") || "Yes";
    const mint = searchParams.get("mint") || "Active";
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
    if (image?.toLowerCase().endsWith('.webp')) {
      console.warn('Skipping WebP image — not supported by Satori');
      tokenImage = null;
    } else {
      tokenImage = await fetchAndOptimizeImage(image);
    }

    let theme = { bg: "linear-gradient(150deg, #0d0808 0%, #130b0b 45%, #0f0909 100%)", ac: "#ef4444", acDim: "rgba(239,68,68,0.6)", acBg: "rgba(239,68,68,0.1)", acBorder: "rgba(239,68,68,0.18)" };
    if (score >= 60) theme = { bg: "linear-gradient(150deg, #080d08 0%, #0b130b 45%, #090f09 100%)", ac: "#22c55e", acDim: "rgba(34,197,94,0.6)", acBg: "rgba(34,197,94,0.1)", acBorder: "rgba(34,197,94,0.18)" };
    else if (score >= 40) theme = { bg: "linear-gradient(150deg, #0d0b08 0%, #13100b 45%, #0f0c09 100%)", ac: "#f59e0b", acDim: "rgba(245,158,11,0.6)", acBg: "rgba(245,158,11,0.1)", acBorder: "rgba(245,158,11,0.18)" };

    if (isLight) {
      if (score >= 60) theme.bg = "linear-gradient(150deg, #f7faf7 0%, #eef6ee 45%, #f4faf4 100%)";
      else if (score >= 40) theme.bg = "linear-gradient(150deg, #faf8f5 0%, #f7f2eb 45%, #faf6f1 100%)";
      else theme.bg = "linear-gradient(150deg, #faf5f5 0%, #f7ebeb 45%, #faf2f2 100%)";
    }

    const c = isLight ? {
      text: "#0a0a0a",
      textSoft: "rgba(0,0,0,0.5)",
      textDim: "rgba(0,0,0,0.35)",
      textGhost: "rgba(0,0,0,0.18)",
      textMuted: "rgba(0,0,0,0.25)",
      cardBg: "rgba(0,0,0,0.025)",
      subtle: "rgba(0,0,0,0.06)",
      subtler: "rgba(0,0,0,0.04)",
      grid: "rgba(0,0,0,0.03)",
      footerBg: "rgba(0,0,0,0.04)",
      footerBorder: "rgba(0,0,0,0.06)",
      svgStroke: "rgba(0,0,0,0.3)",
      svgFill: "rgba(0,0,0,0.08)",
      svgShield: "rgba(0,0,0,0.3)",
      svgCheck: "rgba(255,255,255,0.9)",
      svgLine: "rgba(0,0,0,0.12)",
      glow: 0.06,
    } : {
      text: "#ffffff",
      textSoft: "rgba(255,255,255,0.3)",
      textDim: "rgba(255,255,255,0.25)",
      textGhost: "rgba(255,255,255,0.18)",
      textMuted: "rgba(255,255,255,0.16)",
      cardBg: "rgba(255,255,255,0.015)",
      subtle: "rgba(255,255,255,0.04)",
      subtler: "rgba(255,255,255,0.04)",
      grid: "rgba(255,255,255,0.02)",
      footerBg: "rgba(0,0,0,0.4)",
      footerBorder: "rgba(255,255,255,0.03)",
      svgStroke: "rgba(255,255,255,0.25)",
      svgFill: "rgba(255,255,255,0.06)",
      svgShield: "rgba(255,255,255,0.25)",
      svgCheck: "rgba(0,0,0,0.7)",
      svgLine: "rgba(255,255,255,0.12)",
      glow: 0.04,
    };

    const circum = 680;
    const offset = circum * (1 - score / 100);
    const dateStr = new Date().toLocaleString('en-GB', { timeZone: 'UTC', hour12: false }).replace(',', '') + ' UTC';

    let m3Color = "#22c55e";
    if (mode === "PUMP") {
        const snipers = parseInt(lock) || 0;
        if (snipers > 5) m3Color = "#ef4444";
        else if (snipers > 0) m3Color = "#f59e0b";
    } else {
        if (lock === "No" || lock === "Active" || lock === "0") m3Color = "#ef4444";
    }

    // Score ring enhancements — tick marks + arc cap
    const tickCount = 40;
    const filledTicks = Math.floor(score * tickCount / 100);
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / tickCount);
      const isLong = i % 10 === 0;
      const oR = 130, iR = isLong ? 117 : 122;
      return { x1: 135 + iR * Math.cos(a), y1: 135 + iR * Math.sin(a), x2: 135 + oR * Math.cos(a), y2: 135 + oR * Math.sin(a), isLong, filled: i < filledTicks };
    });
    const endA = -Math.PI / 2 + (score / 100) * 2 * Math.PI;
    const capX = 135 + 108 * Math.cos(endA);
    const capY = 135 + 108 * Math.sin(endA);

    const gridSize = 48 + unique.gridOffset;

    return new ImageResponse(
      (
        <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", background: theme.bg, fontFamily: "Inter", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", backgroundImage: `linear-gradient(${c.grid} 1px, transparent 1px), linear-gradient(90deg, ${c.grid} 1px, transparent 1px)`, backgroundSize: `${gridSize}px ${gridSize}px`, transform: `rotate(${unique.gridRotation}deg)` }} />
          <div style={{ position: "absolute", width: unique.blur1Size, height: unique.blur1Size, borderRadius: "50%", background: theme.ac, opacity: c.glow, filter: "blur(140px)", right: unique.blur1X, top: unique.blur1Y, display: "flex" }} />
          <div style={{ position: "absolute", width: unique.blur2Size, height: unique.blur2Size, borderRadius: "50%", background: theme.ac, opacity: 0.025, filter: "blur(100px)", left: unique.blur2X, bottom: unique.blur2Y, display: "flex" }} />
          <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: c.textGhost, opacity: 0.15, left: 50 + (unique.decorDistance * Math.cos(unique.decorAngle * Math.PI / 180)), top: 50 + (unique.decorDistance * Math.sin(unique.decorAngle * Math.PI / 180)), display: "flex" }} />
          <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: c.textGhost, opacity: 0.1, left: 100 + (unique.decorDistance * 0.7 * Math.cos((unique.decorAngle + 120) * Math.PI / 180)), top: 200 + (unique.decorDistance * 0.7 * Math.sin((unique.decorAngle + 120) * Math.PI / 180)), display: "flex" }} />
          <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: c.textGhost, opacity: 0.08, right: 150 + (unique.decorDistance * 0.5 * Math.cos((unique.decorAngle + 240) * Math.PI / 180)), bottom: 100 + (unique.decorDistance * 0.5 * Math.sin((unique.decorAngle + 240) * Math.PI / 180)), display: "flex" }} />
          <div style={{ height: 5, width: "100%", background: `linear-gradient(90deg, transparent 0%, ${theme.ac} 50%, transparent 100%)`, display: "flex" }} />

          <div style={{ flex: 1, display: "flex", padding: "52px 72px 32px", gap: 40, position: "relative" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 60 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                  <div style={{ width: 90, height: 90, borderRadius: 22, background: c.subtler, border: `1px solid ${c.subtle}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {tokenImage ? <img src={tokenImage} width="90" height="90" style={{ objectFit: "cover" }} /> : <span style={{ fontSize: 36, fontWeight: 800, color: c.textGhost, display: "flex" }}>{symbol[0]}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", flexWrap: "nowrap", gap: 16 }}>
                      <span style={{ fontSize: 44, fontWeight: 800, color: c.text, letterSpacing: "-1px", lineHeight: 1, display: "flex" }}>{name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 7, textTransform: "uppercase", background: mode === "PUMP" ? "rgba(249,115,22,0.14)" : "rgba(34,197,94,0.14)", color: mode === "PUMP" ? "#fb923c" : "#4ade80", border: `1px solid ${mode === "PUMP" ? "rgba(249,115,22,0.25)" : "rgba(34,197,94,0.25)"}`, display: "flex", alignItems: "center", marginBottom: 4 }}>{mode === "PUMP" ? "PUMP.FUN" : "DEX"}</span>
                      <span style={{ fontSize: 22, color: c.textSoft, fontWeight: 500, lineHeight: 1, display: "flex", marginBottom: 7 }}>${symbol}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, color: c.textMuted, letterSpacing: "0.5px", display: "flex" }}>{address}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 54, fontWeight: 700, color: c.text, letterSpacing: "-2.5px", lineHeight: 1, display: "flex" }}>{price}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 600, color: change.startsWith("-") ? "#ef4444" : change === "0%" ? c.textDim : "#22c55e", lineHeight: 1, display: "flex", marginBottom: 5 }}>{change}</span>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, color: c.textDim, marginTop: 10, letterSpacing: "0.5px", display: "flex" }}>MC {mcap}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36 }}>
                   <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 600, color: penalty === 0 ? "rgba(34,197,94,0.6)" : penalty >= 50 ? "rgba(239,68,68,0.7)" : penalty >= 25 ? "rgba(245,158,11,0.7)" : "rgba(234,179,8,0.6)", display: "flex" }}>{penalty === 0 ? "No penalties" : `-${penalty} points`}</span>
                   <div style={{ flex: 1, height: 7, background: theme.acBg, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(100, (penalty / 100) * 100)}%`, background: penalty >= 50 ? "linear-gradient(90deg, #ef4444, #ef4444bb)" : penalty >= 25 ? "linear-gradient(90deg, #f59e0b, #f59e0bbb)" : "linear-gradient(90deg, #eab308, #eab308bb)", display: "flex" }} />
                   </div>
                </div>
              </div>
              <div style={{ display: "flex", borderRadius: 16, overflow: "hidden", border: `1px solid ${c.subtle}` }}>
                {[
                    { l: mode === "PUMP" ? "Curve" : "Liquidity", v: liq, c: (liq === "$0" || liq === "0" || liq === "0%") ? "#ef4444" : "#22c55e" },
                    { l: "Top 10", v: top10, c: parseInt(top10) > 50 ? "#ef4444" : "#22c55e" },
                    { l: mode === "PUMP" ? "Snipers" : "LP Lock", v: lock, c: m3Color },
                    { l: "Sellable", v: sell, c: sell === "Yes" ? "#22c55e" : "#ef4444" },
                    { l: "Mint", v: mint, c: mint === "Revoked" ? "#22c55e" : "#ef4444" }
                ].map((m, i) => (
                    <div key={i} style={{ flex: 1, padding: "22px 20px", background: c.cardBg, display: "flex", flexDirection: "column", gap: 10, borderLeft: i === 0 ? "0" : `1px solid ${c.subtle}` }}>
                        <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "2px", color: c.textDim, fontWeight: 600, display: "flex" }}>{m.l}</span>
                        <span style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: m.c, display: "flex" }}>{m.v}</span>
                    </div>
                ))}
              </div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: `linear-gradient(180deg, transparent 5%, ${c.subtle} 30%, ${c.subtle} 70%, transparent 95%)`, display: "flex" }} />
            <div style={{ width: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
              <div style={{ position: "relative", width: 270, height: 270, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Idea 3: Subtle accent fill inside ring */}
                <div style={{ position: "absolute", width: 196, height: 196, borderRadius: "50%", background: theme.acBg, top: 37, left: 37, display: "flex" }} />
                {/* Soft radial glow — Satori-compatible (no blur) */}
                <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${theme.ac}20 0%, transparent 70%)`, top: 55, left: 55, display: "flex" }} />
                {/* Idea 1: Tick marks + Idea 6: Inner thin ring */}
                <svg width="270" height="270" viewBox="0 0 270 270" style={{ position: "absolute", top: 0, left: 0, display: "flex" }}>
                  {ticks.map((t, i) => (
                    <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.filled ? theme.ac : c.subtle} strokeWidth={t.isLong ? 2.5 : 1.5} strokeLinecap="round" style={{ opacity: t.filled ? 0.7 : 0.4 }} />
                  ))}
                  <circle cx="135" cy="135" r="98" fill="none" stroke={c.subtle} strokeWidth="2" />
                </svg>
                {/* Main progress ring */}
                <svg width="270" height="270" viewBox="0 0 270 270" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)", display: "flex" }}>
                  <circle cx="135" cy="135" r="108" fill="none" stroke={c.subtle} strokeWidth="12" />
                  <circle cx="135" cy="135" r="108" fill="none" stroke={theme.ac} strokeWidth="14" strokeLinecap="round" strokeDasharray={circum} strokeDashoffset={offset} style={{ opacity: 0.85 }} />
                </svg>
                {/* Idea 8: Arc start & end cap markers */}
                {score > 0 && score < 100 && (
                  <svg width="270" height="270" viewBox="0 0 270 270" style={{ position: "absolute", top: 0, left: 0, display: "flex" }}>
                    <circle cx={capX} cy={capY} r="5" fill={theme.ac} style={{ opacity: 0.9 }} />
                    <circle cx="135" cy="27" r="4" fill={theme.acDim} style={{ opacity: 0.5 }} />
                  </svg>
                )}
                {/* Score centered in circle, /100 slightly below */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 20 }}>
                  <span style={{ fontSize: score === 100 ? 92 : 96, fontWeight: 900, color: theme.ac, letterSpacing: "-4px", lineHeight: 1, display: "flex" }}>{score}</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: c.textGhost, opacity: 0.5, marginTop: -2, display: "flex" }}>/ 100</span>
                </div>
              </div>
              {/* Idea 4: Enhanced grade badge */}
              <div style={{ fontSize: 22, fontWeight: 700, padding: "14px 36px", borderRadius: 100, background: theme.acBg, border: `2px solid ${theme.acBorder}`, color: theme.ac, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: theme.ac, display: "flex" }} />
                Grade {grade} · {gradeLabel}
              </div>
              {/* Idea 5: Tags with severity dots */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 340 }}>
                {tags.map((t, i) => {
                    const pts = tagPointsList[i] || 0;
                    const tagColor = pts >= 30 ? "#ef4444" : pts >= 15 ? "#f59e0b" : pts > 0 ? "#eab308" : "#22c55e";
                    return (
                      <span key={i} style={{ fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 100, background: `${tagColor}18`, border: `1px solid ${tagColor}30`, color: `${tagColor}cc`, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: tagColor, display: "flex" }} />
                        {t}
                      </span>
                    );
                })}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 72px", background: c.footerBg, borderTop: `1px solid ${c.footerBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ display: "flex", opacity: 0.35 }}><path d="M24 3L42.2 13.5L42.2 34.5L24 45L5.8 34.5L5.8 13.5Z" stroke={isLight ? "#8b8b8b" : "#c0c0c0"} strokeWidth="1.5" strokeLinejoin="round" fill="none"/><path d="M24 11L35.3 17.5L35.3 30.5L24 37L12.7 30.5L12.7 17.5Z" fill={isLight ? "rgba(139,139,139,0.08)" : "rgba(192,192,192,0.08)"} stroke={isLight ? "#8b8b8b" : "#c0c0c0"} strokeWidth="1" strokeLinejoin="round"/><path d="M24 15C19.5 15 16.5 16.5 16.5 19L16.5 24.5C16.5 29 19.5 32 24 34.5C28.5 32 31.5 29 31.5 24.5L31.5 19C31.5 16.5 28.5 15 24 15Z" fill={isLight ? "#8b8b8b" : "#c0c0c0"}/><path d="M20.5 23.5L23 26L28 20.5" stroke={isLight ? "#f5f5f5" : "#0a0a0a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.25, color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.35)", display: "flex" }}>RugSol</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)", letterSpacing: "3px", textTransform: "uppercase", marginTop: 3, display: "flex" }}>Scanner</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: c.textMuted, display: "flex" }}>{dateStr}</span>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 24px", borderRadius: 100, background: `${theme.acBg}`, border: `1px solid ${theme.acBorder}` }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: theme.ac, letterSpacing: "0.5px", display: "flex" }}>rugsol.live</span>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 8, right: 72, opacity: 0.03, display: "flex" }}>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: c.textGhost, letterSpacing: "1px", display: "flex" }}>#{unique.cornerSeed}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, headers: {
        "Content-Disposition": `inline; filename="rugsol-${symbol.toLowerCase()}-${score}.png"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      }, fonts: [
        { name: "Inter", data: interReg, weight: 400 },
        { name: "Inter", data: interBold, weight: 700 },
        { name: "JetBrains Mono", data: jbMono, weight: 400 },
        { name: "JetBrains Mono", data: jbMonoBold, weight: 700 }
      ]}
    );
  } catch (error) { 
    console.error("OG Generation Error:", error);
    return new Response("Error generating image", { status: 500 }); 
  }
}
