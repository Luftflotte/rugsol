import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function fetchAndOptimizeImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  
  let targetUrl = url;
  if (url.includes("ipfs.io")) {
    targetUrl = url.replace("ipfs.io", "cf-ipfs.com");
  } else if (url.startsWith("ipfs://")) {
    targetUrl = url.replace("ipfs://", "https://cf-ipfs.com/ipfs/");
  }

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
    const mimeType = res.headers.get("content-type") || "image/png";
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") || "";
    const tokenName = searchParams.get("name") || "Unknown Token";
    const tokenSymbol = searchParams.get("symbol") || "TOKEN";
    const score = parseInt(searchParams.get("score") || "0");
    const gradeLabel = searchParams.get("grade") || "Unknown Risk";
    const tokenImage = searchParams.get("image");
    const isLight = searchParams.get("theme") === "light";
    
    const liqText = searchParams.get("liq") || "Low Liquidity";
    const holderText = searchParams.get("holders") || "Moderate";
    const mintText = searchParams.get("mint") || "Active";

    // Load Fonts
    const interRegular = await fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-400-normal.ttf", import.meta.url)).then((res) => res.arrayBuffer());
    const interBold = await fetch(new URL("https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.0/latin-700-normal.ttf", import.meta.url)).then((res) => res.arrayBuffer());

    const finalTokenImage = await fetchAndOptimizeImage(tokenImage);

    // Original Theme Logic
    let safetyTheme = "red";
    if (score >= 60) safetyTheme = "green";
    else if (score >= 40) safetyTheme = "yellow";
    
    let primaryColor = isLight ? "#dc2626" : "#ef4444"; 
    let containerBg = isLight ? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)" : "linear-gradient(135deg, #050505 0%, #1f0a0a 100%)";
    const cardBg = isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(20, 20, 25, 0.7)";
    const textColor = isLight ? "#0f172a" : "white";
    const subTextColor = isLight ? "#64748b" : "#888899";
    let glowColor = "rgba(239, 68, 68, 0.15)";
    let borderColor = isLight ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.3)";

    if (safetyTheme === "green") {
        primaryColor = isLight ? "#059669" : "#00ff88"; 
        containerBg = isLight ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #050505 0%, #0a1f15 100%)";
        glowColor = "rgba(0, 255, 136, 0.15)";
        borderColor = isLight ? "rgba(5, 150, 105, 0.3)" : "rgba(0, 255, 136, 0.3)";
    } else if (safetyTheme === "yellow") {
        primaryColor = isLight ? "#d97706" : "#eab308"; 
        containerBg = isLight ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" : "linear-gradient(135deg, #050505 0%, #1f1a0a 100%)";
        glowColor = "rgba(234, 179, 8, 0.15)";
        borderColor = isLight ? "rgba(217, 119, 6, 0.3)" : "rgba(234, 179, 8, 0.3)";
    }

    const cx = 100; const cy = 100; const r = 80; const strokeWidth = 16;
    const angle = Math.PI * (1 - score / 100); 
    const endX = cx + r * Math.cos(angle);
    const endY = cy - r * Math.sin(angle);
    const progressPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY}`;

    return new ImageResponse(
      (
        <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: isLight ? "#ffffff" : "#050505", backgroundImage: containerBg, fontFamily: '"Inter"', color: textColor }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "500px", background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, display: "flex" }} />
          <div style={{ display: "flex", flexDirection: "column", width: "1000px", height: "500px", backgroundColor: cardBg, borderRadius: "32px", border: `1px solid ${borderColor}`, boxShadow: isLight ? "0 25px 50px -12px rgba(0, 0, 0, 0.1)" : "0 20px 50px -10px rgba(0, 0, 0, 0.5)", padding: "40px 60px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {finalTokenImage ? (
                  <img src={finalTokenImage} width="64" height="64" style={{ borderRadius: "16px", objectFit: "cover", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }} />
                ) : (
                  <div style={{ display: "flex", width: "64px", height: "64px", borderRadius: "16px", background: isLight ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%)", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`, alignItems: "center", justifyContent: "center", color: primaryColor, fontSize: "24px", fontWeight: "bold" }}>{tokenSymbol[0]}</div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "32px", fontWeight: "bold", color: textColor, lineHeight: "1.1" }}>${tokenSymbol}</span>
                  <span style={{ fontSize: "18px", color: subTextColor }}>{tokenName}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                 <div style={{ display: "flex", width: "48px", height: "48px", alignItems: "center", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 2L44 13V37L24 48L4 37V13L24 2Z" stroke={isLight ? "#334155" : "#e2e8f0"} strokeWidth="2" fill="none" />
                      <path d="M24 10L36 17V31L24 38L12 31V17L24 10Z" fill={isLight ? "rgba(51, 65, 85, 0.1)" : "rgba(226, 232, 240, 0.1)"} stroke={isLight ? "#334155" : "#e2e8f0"} strokeWidth="1.5" />
                      <path d="M24 14C24 14 30 18 30 24C30 29 26 32 24 34C22 32 18 29 18 24C18 18 24 14 24 14Z" fill={isLight ? "#334155" : "#e2e8f0"} />
                      <path d="M21 24L23.5 26.5L28 21" stroke={isLight ? "#ffffff" : "#0a0a0f"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: "26px", fontWeight: "800", color: textColor, letterSpacing: "0.5px", lineHeight: "1" }}>RugSol</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: subTextColor, letterSpacing: "3px", textTransform: "uppercase", marginTop: "4px" }}>SCANNER</span>
                 </div>
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "-10px" }}>
               <div style={{ position: "relative", width: "300px", height: "150px", display: "flex", justifyContent: "center" }}>
                  <svg width="200" height="100" viewBox="0 0 200 100" style={{ overflow: "visible" }}>
                    <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"} strokeWidth={strokeWidth} strokeLinecap="round" />
                    {score > 0 && <path d={progressPath} fill="none" stroke={primaryColor} strokeWidth={strokeWidth} strokeLinecap="round" />}
                  </svg>
                   <div style={{ display: "flex", position: "absolute", bottom: "-25px", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "72px", fontWeight: "900", color: textColor, lineHeight: "1", textShadow: `0 0 20px ${primaryColor}40` }}>{score}</span>
                        <div style={{ display: "flex", backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40`, padding: "4px 16px", borderRadius: "12px", fontSize: "20px", fontWeight: "bold", marginTop: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{gradeLabel}</div>
                   </div>
               </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "40px", marginBottom: "30px" }}>
                {[
                  { icon: "💧", text: liqText },
                  { icon: "👥", text: holderText },
                  { icon: mintText === 'Revoked' || mintText === 'Locked' ? '🔒' : '🔓', text: mintText }
                ].map((item, i) => (
                   <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", borderRadius: "12px", background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>
                       <span style={{ fontSize: "18px" }}>{item.icon}</span>
                       <span style={{ fontSize: "18px", fontWeight: "500", color: subTextColor }}>{item.text}</span>
                   </div>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`, paddingTop: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px", color: primaryColor, fontWeight: "600", letterSpacing: "0.5px" }}>{`VERDICT: ${gradeLabel}`.toUpperCase()}</span>
                    <span style={{ fontSize: "12px", color: subTextColor, fontFamily: "monospace", opacity: 0.8 }}>{address}</span>
                </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: [{ name: "Inter", data: interRegular, weight: 400 }, { name: "Inter", data: interBold, weight: 700 }] }
    );
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}