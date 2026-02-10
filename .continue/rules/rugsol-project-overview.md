---
alwaysApply: true
---

## RugSol — Solana Token Safety Scanner

### Project Summary
RugSol is a Solana token rug-pull detection tool with a Next.js 16 web app and a Telegram bot. It analyzes tokens on-chain and assigns a safety score (0–100) with grades A–F.

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Blockchain**: @solana/web3.js, @solana/spl-token
- **Bot**: grammy (Telegram)
- **APIs**: Helius (RPC), Jupiter (token verification + honeypot), Birdeye (price), DexScreener (liquidity), Pump.fun (bonding curve)

### Project Structure
- `app/` — Next.js pages & API routes (App Router)
- `app/api/scan/` — Main scan REST endpoint
- `app/api/og/` — OG image generation
- `app/scan/[address]/` — Token scan result page
- `components/` — React UI components (shadcn/ui based)
- `lib/scoring/engine.ts` — Core scoring engine (the "brain")
- `lib/scoring/constants.ts` — Grade definitions
- `lib/scoring/whitelist.ts` — Whitelisted tokens
- `lib/solana/` — Blockchain logic (authority, holders, pumpfun, tokenAge)
- `lib/solana/connection.ts` — Solana RPC connection + token context
- `lib/external/` — External API integrations (Jupiter, Birdeye, DexScreener, metadata, price)
- `scripts/` — Telegram bot runner and setup

### Key Patterns
- `safeCheck()` wrapper for fault-tolerant async checks (prevents one failing API from crashing a scan)
- Two scan modes: `"pump"` (Pump.fun bonding curve) and `"dex"` (graduated/standard DEX tokens)
- Mode detection uses: Mint Authority PDA check → Bonding Curve state → DexScreener → Address pattern fallback
- Scoring starts at 100 and applies penalties; critical penalties (honeypot, mint authority) can force grade F
- Whitelist system: hardcoded + Jupiter-verified tokens get reduced penalties and floor scores
- API responses follow `{ success: boolean, data: any, error?: string }` format

### Environment Variables (.env.local)
- `HELIUS_API_KEY` — Solana RPC
- `BIRDEYE_API_KEY` — Price/liquidity data
- `TELEGRAM_BOT_TOKEN` — Telegram bot
- `NEXT_PUBLIC_SITE_URL` — Site URL for OG images

### Commands
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run bot` — Run Telegram bot (tsx scripts/run-bot.ts)
- `npm run bot:setup` — Setup Telegram bot commands