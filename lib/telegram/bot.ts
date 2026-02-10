import { Bot, Context, InlineKeyboard } from "grammy";
import {
  formatStartMessage,
  formatHelpMessage,
  formatScanResult,
  formatError,
  formatInvalidAddress,
  formatInlineResult,
} from "./templates";
import { scanToken, ScanResult } from "@/lib/scoring/engine";
import { addRecentScan } from "@/lib/storage/recent-scans";

// Token address regex (Solana base58)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function createBot(token: string, siteUrl: string) {
  const bot = new Bot(token);

  // Helper to create keyboard
  function createKeyboard(tokenAddress: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.url("📊 Full Report", `${siteUrl}/scan/${tokenAddress}`).row();
    
    keyboard
      .url("Birdeye", `https://birdeye.so/token/${tokenAddress}?chain=solana`)
      .url("DexScreener", `https://dexscreener.com/solana/${tokenAddress}`);
    
    return keyboard;
  }

  // Unified scan handler for commands and messages
  async function handleScanRequest(ctx: Context, address: string) {
    if (!SOLANA_ADDRESS_REGEX.test(address)) {
      await ctx.reply(formatInvalidAddress(), { parse_mode: "HTML" });
      return;
    }

    const loadingMsg = await ctx.reply("🔍 Scanning token...");

    try {
      const result = await scanToken(address);

      // Log to recent scans (local to bot process)
      const metadata = result.checks.metadata.data;
      addRecentScan({
        address: result.tokenAddress,
        name: metadata?.name || result.whitelistInfo?.name || "Unknown",
        symbol: metadata?.symbol || result.whitelistInfo?.symbol || "???",
        image: metadata?.image || undefined,
        score: result.score,
        grade: result.grade,
        gradeColor: result.gradeColor,
        scannedAt: result.scannedAt.toISOString(),
        createdAt: metadata?.createdAt || undefined,
      });

      await ctx.api.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        formatScanResult(result, siteUrl),
        {
          parse_mode: "HTML",
          reply_markup: createKeyboard(address),
          link_preview_options: { is_disabled: true },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await ctx.api.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        formatError(errorMessage),
        { parse_mode: "HTML" }
      );
    }
  }

  // /start command
  bot.command("start", async (ctx: Context) => {
    await ctx.reply(formatStartMessage(), { parse_mode: "HTML" });
  });

  // /help command
  bot.command("help", async (ctx: Context) => {
    await ctx.reply(formatHelpMessage(), { parse_mode: "HTML" });
  });

  // /check command
  bot.command("check", async (ctx: Context) => {
    const text = ctx.message?.text || "";
    const args = text.split(/\s+/).slice(1);

    if (args.length === 0) {
      await ctx.reply(formatInvalidAddress(), { parse_mode: "HTML" });
      return;
    }

    await handleScanRequest(ctx, args[0]);
  });

  // Handle plain token addresses
  bot.on("message:text", async (ctx: Context) => {
    const text = ctx.message?.text?.trim() || "";
    if (text.startsWith("/")) return;

    if (SOLANA_ADDRESS_REGEX.test(text)) {
      await handleScanRequest(ctx, text);
    }
  });

  // Inline mode
  bot.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery?.query?.trim() || "";

    if (!query || !SOLANA_ADDRESS_REGEX.test(query)) {
      await ctx.answerInlineQuery([
        {
          type: "article",
          id: "help",
          title: "Enter a Solana token address",
          description: "Type a valid token CA to scan",
          input_message_content: {
            message_text: "Use @YourBotName [token_address] to scan a token",
            parse_mode: "HTML",
          },
        },
      ]);
      return;
    }

    try {
      const result = await scanToken(query);
      const { title, description } = formatInlineResult(result);

      await ctx.answerInlineQuery([
        {
          type: "article",
          id: query,
          title,
          description,
          input_message_content: {
            message_text: formatScanResult(result, siteUrl),
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true },
          },
          reply_markup: createKeyboard(query),
        },
      ]);
    } catch (error) {
      await ctx.answerInlineQuery([
        {
          type: "article",
          id: "error",
          title: "❌ Error scanning token",
          description: error instanceof Error ? error.message : "Unknown error",
          input_message_content: {
            message_text: formatError(
              error instanceof Error ? error.message : "Unknown error"
            ),
            parse_mode: "HTML",
          },
        },
      ]);
    }
  });

  return bot;
}
