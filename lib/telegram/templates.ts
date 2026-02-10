import { ScanResult } from "@/lib/scoring/engine";

// Emoji mapping for grades
const gradeEmoji: Record<string, string> = {
  A: "🟢",
  B: "🟢",
  C: "🟡",
  D: "🟠",
  F: "🔴",
};

const statusEmoji = {
  pass: "✅",
  warning: "⚠️",
  fail: "❌",
  unknown: "❓",
};

export function formatStartMessage(): string {
  return `🔍 <b>RugSol Bot</b>

Мгновенная проверка токенов Solana на мошенничество (rug pull).

<b>Команды:</b>
/check [адрес] - Проверить токен
/help - Показать справку

Просто вставь адрес токена (CA), и я его проанализирую!

Работает на основе ончейн-анализа 🛡️`;
}

export function formatHelpMessage(): string {
  return `📖 <b>Как пользоваться RugSol Bot</b>

<b>Проверить токен:</b>
/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

<b>Что мы проверяем:</b>
• Mint Authority - Может ли создатель печатать новые токены?
• Freeze Authority - Может ли создатель заморозить ваши токены?
• Holder Distribution - Насколько распределено владение?
• Liquidity - Сожжена ли или заблокирована ликвидность?
• Token Age - Сколько времени существует токен?
• Honeypot - Можно ли продать токен?

<b>Оценки:</b>
🟢 A/B (70-100) - Безопасно / Низкий риск
🟡 C (50-69) - Осторожно
🟠 D (30-49) - Высокий риск  
🔴 F (0-29) - Опасно

Берегите свои средства! 🛡️`;
}

export function formatScanResult(result: ScanResult, siteUrl: string): string {
  const emoji = gradeEmoji[result.grade] || "❓";
  
  // Get token name/symbol from metadata
  const metadata = result.checks.metadata.data;
  let tokenName = metadata?.name || result.whitelistInfo?.name || "Unknown Token";
  let tokenSymbol = metadata?.symbol || result.whitelistInfo?.symbol || "???";

  // Handle native SOL symbol consistency
  if (result.tokenAddress === "So11111111111111111111111111111111111111111" || 
      result.tokenAddress === "So11111111111111111111111111111111111111112") {
    tokenSymbol = "SOL";
  }

  // Whitelisted token badge
  const isVerified = result.isWhitelisted || result.whitelistInfo?.type.includes("jupiter");
  const whitelistBadge = isVerified 
    ? `\n✅ <b>Verified ${result.whitelistInfo?.type.replace("jupiter-verified ", "") || "token"}</b>` 
    : "";

  // Build checks summary
  const checksLines: string[] = [];

  // Mint Authority
  if (result.checks.mintAuthority.data) {
    const isExpected = result.whitelistInfo?.type.includes("stablecoin") || result.whitelistInfo?.type.includes("defi");
    const status = (result.checks.mintAuthority.data.status === "pass" || (isVerified && isExpected)) ? "pass" : "fail";
    const note = result.isWhitelisted && result.checks.mintAuthority.data.status === "fail" ? " (expected)" : "";
    checksLines.push(
      `${statusEmoji[status]} Mint Authority: ${result.checks.mintAuthority.data.value}${note}`
    );
  }

  // Freeze Authority
  if (result.checks.freezeAuthority.data) {
    const isExpected = result.whitelistInfo?.type.includes("stablecoin");
    const status = (result.checks.freezeAuthority.data.status === "pass" || (isVerified && isExpected)) ? "pass" : "fail";
    const note = result.isWhitelisted && result.checks.freezeAuthority.data.status === "fail" ? " (expected)" : "";
    checksLines.push(
      `${statusEmoji[status]} Freeze Authority: ${result.checks.freezeAuthority.data.value}${note}`
    );
  }

  // Holders
  if (result.checks.holders.data) {
    const h = result.checks.holders.data;
    const status = h.topTenPercent > 50 ? "fail" : h.topTenPercent > 30 ? "warning" : "pass";
    checksLines.push(
      `${statusEmoji[status]} Top 10 Holders: ${h.topTenPercent.toFixed(1)}%`
    );
  }

  // Liquidity
  if (result.checks.liquidity.data) {
    const lp = result.checks.liquidity.data;
    const pumpCurve = metadata?.pumpFunCurve;
    const isActivePumpCurve = pumpCurve?.exists && !pumpCurve?.complete;
    
    let lpStatus: keyof typeof statusEmoji = "warning";
    let lpText = "";

    if (isActivePumpCurve) {
      lpStatus = "pass";
      lpText = `Bonding Curve (${pumpCurve.curveProgressPercent}% 🔥)`;
    } else {
      lpStatus = lp.lpBurned ? "pass" : lp.lpSizeUsd > 1000000 ? "pass" : lp.lpSizeUsd < 10000 ? "fail" : "warning";
      lpText = lp.lpBurned ? "Burned 🔥" : `$${lp.lpSizeUsd.toLocaleString("en-US")}`;
    }
    
    checksLines.push(`${statusEmoji[lpStatus]} Liquidity: ${lpText}`);
  }

  // Token Age
  if (result.checks.tokenAge.data) {
    const age = result.checks.tokenAge.data;
    const ageStatus = age.ageInDays >= 7 ? "pass" : age.ageInHours < 24 ? "fail" : "warning";
    const ageText = age.ageInDays > 0 ? `${age.ageInDays} days` : `${age.ageInHours} hours`;
    checksLines.push(`${statusEmoji[ageStatus]} Age: ${ageText}`);
  }

  // Honeypot
  if (result.checks.honeypot.data) {
    const hp = result.checks.honeypot.data;
    const status = hp.isHoneypot ? "fail" : "pass";
    const text = hp.isHoneypot ? "Detected! 🚨" : "Passed ✅";
    checksLines.push(`${statusEmoji[status]} Honeypot Check: ${text}`);
  }

  const checksText = checksLines.length > 0 
    ? checksLines.join("\n") 
    : "Unable to fetch all checks";

  const resultUrl = `${siteUrl}/scan/${result.tokenAddress}`;
  const priceText = result.price ? `\n\n💰 <b>Price:</b> $${result.price.priceUsd.toLocaleString("en-US", { maximumFractionDigits: 8 })}\n📈 <b>MC:</b> $${(result.price.marketCap / 1000000).toFixed(2)}M` : "";

  return `${emoji} <b>${tokenName}</b> ($${tokenSymbol})${whitelistBadge}${priceText}

<b>Score: ${result.score}/100</b> - Grade ${result.grade}
<i>${result.gradeLabel}</i>

<b>Checks:</b>
${checksText}

<code>${result.tokenAddress}</code>
<a href="${resultUrl}">View full report →</a>`;
}

export function formatError(error: string): string {
  return `❌ <b>Ошибка</b>

${error}

Пожалуйста, проверьте адрес токена и попробуйте снова.`;
}

export function formatInvalidAddress(): string {
  return `⚠️ <b>Неверный адрес</b>

Пожалуйста, укажите корректный адрес токена Solana.

Пример:
<code>/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>`;
}

// For inline query results
export function formatInlineResult(result: ScanResult): {
  title: string;
  description: string;
} {
  const emoji = gradeEmoji[result.grade] || "❓";
  const metadata = result.checks.metadata.data;
  const tokenName = metadata?.name || result.whitelistInfo?.name || "Unknown";
  const tokenSymbol = metadata?.symbol || result.whitelistInfo?.symbol || "???";

  return {
    title: `${emoji} ${tokenName} ($${tokenSymbol}) - Score: ${result.score}`,
    description: `Grade ${result.grade} • ${result.gradeLabel}`,
  };
}