import { NextRequest, NextResponse } from "next/server";
import { createBot } from "@/lib/telegram/bot";
import { webhookCallback } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rugsol.vercel.app";

// Create bot instance
let bot: ReturnType<typeof createBot> | null = null;

function getBot() {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }
  if (!bot) {
    bot = createBot(token, siteUrl);
  }
  return bot;
}

// Webhook handler for Telegram updates
export async function POST(req: NextRequest) {
  try {
    const botInstance = getBot();
    const handler = webhookCallback(botInstance, "std/http");
    return await handler(req);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    bot: token ? "configured" : "not configured" 
  });
}
