import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function fetchAndOptimizeImage(url: string | null): Promise<string | null> {
  if (!url || url === "") return null;
  
  // If it's a standard data URL or already optimized, return as is
  if (url.startsWith("data:")) return url;

  let targetUrl = url;
  if (url.includes("ipfs.io")) targetUrl = url.replace("ipfs.io", "gateway.pinata.cloud");
  else if (url.startsWith("ipfs://")) targetUrl = url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");

  try {
    // We try to fetch and convert to base64 because Satori handles base64 much better than external URLs in some environments
    const res = await fetch(targetUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return targetUrl; // Fallback to direct URL if fetch fails
    
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";
    
    // Use Buffer for faster and safer base64 conversion if available, or fallback to btoa
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.error("Image fetch error:", e);
    return targetUrl; // Return the original URL as a last resort
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") || "";
    const name = searchParams.get("name") || "Unknown";
    const symbol = searchParams.get("symbol") || "TOKEN";
    const score = parseInt(searchParams.get("score") || "0");
    const grade = searchParams.get("grade") || "F";
    const gradeLabel = searchParams.get("label") || "Likely Scam";
    const image = searchParams.get("image");
    const mode = (searchParams.get("mode") || "dex").toUpperCase();
    const price = searchParams.get("price") || "$0.00";
    const mcap = searchParams.get("mcap") || "0";
    const change = searchParams.get("change") || "0%";
    const liq = searchParams.get("liq") || "$0";
    const top10 = searchParams.get("top10") || "0%";
    const lock = searchParams.get("lock") || "No";
    const sell = searchParams.get("sell") || "Yes";
    const mint = searchParams.get("mint") || "Active";
    const penalty = parseInt(searchParams.get("penalty") || "0");
    const tags = (searchParams.get("tags") || "").split(",").filter(Boolean);

    const [interReg, interBold, interBlack, jbMono, jbMonoBold] = await Promise.all([
      fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-400-normal.ttf", import.meta.url)).then(res => res.arrayBuffer()),
      fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-700-normal.ttf", import.meta.url)).then(res => res.arrayBuffer()),
      fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-900-normal.ttf", import.meta.url)).then(res => res.arrayBuffer()),
      fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@5.1.0/latin-400-normal.ttf", import.meta.url)).then(res => res.arrayBuffer()),
      fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@5.1.0/latin-700-normal.ttf", import.meta.url)).then(res => res.arrayBuffer())
    ]);

    const tokenImage = await fetchAndOptimizeImage(image);

    let theme = { bg: "linear-gradient(150deg, #0d0808 0%, #130b0b 45%, #0f0909 100%)", ac: "#ef4444", acDim: "rgba(239,68,68,0.6)", acBg: "rgba(239,68,68,0.1)", acBorder: "rgba(239,68,68,0.18)" };
    if (score >= 60) theme = { bg: "linear-gradient(150deg, #080d08 0%, #0b130b 45%, #090f09 100%)", ac: "#22c55e", acDim: "rgba(34,197,94,0.6)", acBg: "rgba(34,197,94,0.1)", acBorder: "rgba(34,197,94,0.18)" };
    else if (score >= 40) theme = { bg: "linear-gradient(150deg, #0d0b08 0%, #13100b 45%, #0f0c09 100%)", ac: "#f59e0b", acDim: "rgba(245,158,11,0.6)", acBg: "rgba(245,158,11,0.1)", acBorder: "rgba(245,158,11,0.18)" };

    const circum = 465;
    const offset = circum * (1 - score / 100);
    const dateStr = new Date().toLocaleString('en-GB', { timeZone: 'UTC', hour12: false }).replace(',', '') + ' UTC';

    return new ImageResponse(
      (
        <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", background: theme.bg, fontFamily: "Inter", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
          <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: theme.ac, opacity: 0.035, filter: "blur(100px)", right: -60, top: -60, display: "flex" }} />
          <div style={{ height: 3, background: `linear-gradient(90deg, transparent 0%, ${theme.ac} 50%, transparent 100%)`, display: "flex" }} />
          <div style={{ flex: 1, display: "flex", padding: "36px 48px 20px", gap: 44, position: "relative" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 58, height: 58, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {tokenImage ? <img src={tokenImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.18)", display: "flex" }}>{symbol[0]}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", display: "flex" }}>{name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", background: mode === "PUMP" ? "rgba(249,115,22,0.14)" : "rgba(34,197,94,0.14)", color: mode === "PUMP" ? "#fb923c" : "#4ade80", border: `1px solid ${mode === "PUMP" ? "rgba(249,115,22,0.25)" : "rgba(34,197,94,0.25)"}`, display: "flex" }}>{mode === "PUMP" ? "PUMP.FUN" : "DEX"}</span>
                      <span style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", fontWeight: 500, display: "flex" }}>${symbol}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "rgba(255,255,255,0.16)", display: "flex" }}>{address}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 34, fontWeight: 700, color: "#fff", display: "flex" }}>{price}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: 600, color: change.startsWith("-") ? "#ef4444" : "#22c55e", display: "flex" }}>{change}</span>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 5, display: "flex" }}>MC {mcap}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 26 }}>
                   <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, color: theme.acDim, display: "flex" }}>-{penalty} penalty</span>
                   <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, penalty)}%`, background: `linear-gradient(90deg, ${theme.ac}, ${theme.ac}bb)`, display: "flex" }} />
                   </div>
                </div>
              </div>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                {[
                    { l: mode === "PUMP" ? "Curve" : "Liquidity", v: liq, c: liq === "$0" ? "#ef4444" : "#22c55e" },
                    { l: "Top 10", v: top10, c: parseInt(top10) > 50 ? "#ef4444" : "#22c55e" },
                    { l: mode === "PUMP" ? "Snipers" : "LP Lock", v: lock, c: (lock === "No" || lock === "Active") ? "#ef4444" : "#22c55e" },
                    { l: "Sellable", v: sell, c: sell === "Yes" ? "#22c55e" : "#ef4444" },
                    { l: "Mint", v: mint, c: mint === "Revoked" ? "#22c55e" : "#ef4444" }
                ].map((m, i) => (
                    <div key={i} style={{ flex: 1, padding: "14px 14px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", gap: 6, borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <span style={{ fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontWeight: 600, display: "flex" }}>{m.l}</span>
                        <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: m.c, display: "flex" }}>{m.v}</span>
                    </div>
                ))}
              </div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent 95%)", display: "flex" }} />
            <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 188, height: 188, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="188" height="188" viewBox="0 0 188 188" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)", display: "flex" }}>
                  <circle cx="94" cy="94" r="74" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
                  <circle cx="94" cy="94" r="74" fill="none" stroke={theme.ac} strokeWidth="9" strokeLinecap="round" strokeDasharray={circum} strokeDashoffset={offset} style={{ opacity: 0.85 }} />
                </svg>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: score === 100 ? 58 : 66, fontWeight: 900, color: theme.ac, letterSpacing: "-3px", lineHeight: 1, display: "flex" }}>{score}</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "rgba(255,255,255,0.18)", marginTop: 2, display: "flex" }}>/ 100</span>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, padding: "7px 22px", borderRadius: 100, background: theme.acBg, border: `1px solid ${theme.acBorder}`, color: theme.ac, display: "flex" }}>Grade {grade} · {gradeLabel}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", maxWidth: 280 }}>
                {tags.map((t, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 100, background: theme.acBg, border: `1px solid ${theme.acBorder}`, color: theme.acDim, display: "flex" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none" style={{ display: "flex" }}><path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/><path d="M24 16C24 16 30 19 30 24C30 28 26 31 24 32.5C22 31 18 28 18 24C18 19 24 16 24 16Z" fill="rgba(255,255,255,0.25)"/></svg>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "rgba(255,255,255,0.45)", display: "flex" }}>RugSol</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.15)", letterSpacing: "2.5px", display: "flex" }}>SCANNER</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "rgba(255,255,255,0.3)", display: "flex" }}>rugsol.info</span>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex" }} />
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "rgba(255,255,255,0.14)", display: "flex" }}>{dateStr}</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: [
        { name: "Inter", data: interReg, weight: 400 }, { name: "Inter", data: interBold, weight: 700 }, { name: "Inter", data: interBlack, weight: 900 },
        { name: "JetBrains Mono", data: jbMono, weight: 400 }, { name: "JetBrains Mono", data: jbMonoBold, weight: 700 }
      ]}
    );
  } catch (error) { return new Response("Error generating image", { status: 500 }); }
}
