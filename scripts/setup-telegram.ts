/**
 * Telegram Bot Setup Script
 * 
 * This script sets up the Telegram webhook for your bot.
 * Run it after deploying to Vercel:
 * 
 * npx ts-node --esm scripts/setup-telegram.ts
 * 
 * Or with environment variables:
 * TELEGRAM_BOT_TOKEN=your_token SITE_URL=https://your-site.vercel.app npx ts-node --esm scripts/setup-telegram.ts
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;

async function setupWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set");
    console.log("\nUsage:");
    console.log("  TELEGRAM_BOT_TOKEN=your_token SITE_URL=https://your-site.vercel.app npx tsx scripts/setup-telegram.ts");
    process.exit(1);
  }

  if (!SITE_URL) {
    console.error("❌ SITE_URL is not set");
    process.exit(1);
  }

  const webhookUrl = `${SITE_URL}/api/telegram`;
  
  console.log("🤖 Setting up Telegram bot...");
  console.log(`   Webhook URL: ${webhookUrl}`);

  try {
    // Set webhook
    const setResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "inline_query"],
          drop_pending_updates: true,
        }),
      }
    );

    const setResult = await setResponse.json();

    if (setResult.ok) {
      console.log("✅ Webhook set successfully!");
    } else {
      console.error("❌ Failed to set webhook:", setResult);
      process.exit(1);
    }

    // Set commands
    console.log("📜 Setting bot commands...");
    const commandsResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: [
            { command: "start", description: "Запустить бота" },
            { command: "check", description: "Проверить токен (укажите CA)" },
            { command: "help", description: "Показать справку" },
          ],
        }),
      }
    );
    const commandsResult = await commandsResponse.json();
    if (commandsResult.ok) {
      console.log("✅ Commands set successfully!");
    }

    // Get webhook info
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const infoResult = await infoResponse.json();

    console.log("\n📊 Webhook Info:");
    console.log(`   URL: ${infoResult.result.url}`);
    console.log(`   Pending updates: ${infoResult.result.pending_update_count}`);
    
    if (infoResult.result.last_error_message) {
      console.log(`   ⚠️ Last error: ${infoResult.result.last_error_message}`);
    }

    // Get bot info
    const meResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );
    const meResult = await meResponse.json();

    if (meResult.ok) {
      console.log(`\n🤖 Bot Info:`);
      console.log(`   Username: @${meResult.result.username}`);
      console.log(`   Name: ${meResult.result.first_name}`);
      console.log(`   ID: ${meResult.result.id}`);
    }

    console.log("\n✨ Setup complete! Try messaging your bot on Telegram.");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Delete webhook (for local development)
async function deleteWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set");
    process.exit(1);
  }

  console.log("🗑️ Deleting webhook...");

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drop_pending_updates: true }),
    }
  );

  const result = await response.json();

  if (result.ok) {
    console.log("✅ Webhook deleted. You can now use long polling for local development.");
  } else {
    console.error("❌ Failed:", result);
  }
}

// Check if --delete flag is passed
const args = process.argv.slice(2);
if (args.includes("--delete")) {
  deleteWebhook();
} else {
  setupWebhook();
}
