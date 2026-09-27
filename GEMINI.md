# RugSol Project Overview

RugSol is a comprehensive Solana token analysis tool designed to detect potential rug pulls and assess token safety. It consists of a Next.js web application and a Telegram bot.

## Project Architecture

### Main Technologies
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Blockchain**: @solana/web3.js, @solana/spl-token
- **Telegram Bot**: grammy
- **Data Integrations**:
  - **Helius**: Primary RPC provider.
  - **Jupiter**: Used for token verification (verified list) and sell simulation (honeypot check).
  - **Birdeye**: Used for fetching price and liquidity data.
  - **Pump.fun**: Specialized analysis for bonding curve tokens.

### Core Modules
- **`lib/scoring/engine.ts`**: The "brain" of the project. It executes multiple parallel checks and calculates a safety score (0-100) and grade (A-F).
- **`lib/solana/`**: Contains blockchain-specific logic:
  - `authority.ts`: Checks if mint/freeze authorities are revoked.
  - `holders.ts`: Analyases token distribution and top holders.
  - `pumpfun.ts`: Decodes Pump.fun bonding curve state.
- **`app/api/scan/`**: REST API endpoint for token analysis with built-in caching and rate limiting.
- **`scripts/run-bot.ts`**: The entry point for the Telegram bot.

## Development Guide

### Prerequisites
- Node.js (v20+ recommended)
- Helius API Key
- Birdeye API Key
- Telegram Bot Token (for bot development)

### Environment Variables (`.env.local`)
```env
HELIUS_API_KEY=your_helius_api_key
BIRDEYE_API_KEY=your_birdeye_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Key Commands
- **Install dependencies**: `npm install`
- **Run web app (dev)**: `npm run dev`
- **Build for production**: `npm run build`
- **Run Telegram bot**: `npm run bot` (uses `tsx scripts/run-bot.ts`)
- **Setup bot commands**: `npm run bot:setup`

## Scoring Logic
The safety score is calculated by starting at 100 points and applying penalties:
- **Mint Authority**: -25 if not revoked.
- **Freeze Authority**: -15 if not revoked.
- **Holders**: Up to -20 for high concentration (>50% in top 10).
- **Liquidity**: -20 if <$10k; -15 if not burned/locked.
- **Honeypot**: -50 if sell simulation fails.
- **Age**: -15 if <24h old.

Whitelisted tokens (e.g., USDC, SOL, or Jupiter-verified tokens) receive reduced penalties or have a minimum floor score.

## Coding Conventions
- **Type Safety**: Strict TypeScript usage is expected across the codebase.
- **Fault Tolerance**: Use `safeCheck` wrapper in the scoring engine to prevent one failing API from crashing the entire scan.
- **Styling**: Tailwind CSS 4 with shadcn/ui components.
- **API Responses**: Standardized JSON format `{ success: boolean, data: any, error?: string }`.
