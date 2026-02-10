/**
 * Telegram Bot Local Development Script
 * 
 * Run this to test the bot locally with long polling:
 * npm run bot
 * 
 * Make sure to:
 * 1. Set TELEGRAM_BOT_TOKEN in .env.local
 * 2. Run the Next.js dev server (npm run dev) first
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createBot } from "../lib/telegram/bot";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set in .env.local");
  process.exit(1);
}

// Create and start the bot
const bot = createBot(TELEGRAM_BOT_TOKEN, SITE_URL);

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err);
});

console.log("🤖 Starting RugSol Bot in polling mode...");
console.log(`📡 Using API at: ${SITE_URL}`);
console.log("Press Ctrl+C to stop\n");

bot.start();
