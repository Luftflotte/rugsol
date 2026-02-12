# CLAUDE.md

## Critical Rules

- **NEVER hallucinate or invent code, files, APIs, functions, or variables that don't exist in this codebase.** Always read the actual file before referencing or modifying it. If unsure whether something exists — check first with Glob/Grep/Read. Do not assume file contents, function signatures, or component props. When in doubt, explore — don't guess.
- Do not create files unless absolutely necessary. Prefer editing existing files.
- Do not add features, refactor, or "improve" code beyond what was explicitly requested.
- Preserve existing patterns and conventions. Match the style of surrounding code.

## Project Overview

**rug** — Solana token security analyzer. Users enter a token address → get a risk score (0-100), letter grade (A-F), and detailed security breakdown. Supports DEX tokens and Pump.fun bonding curve tokens.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · @solana/web3.js · Framer Motion

## Directory Structure

```
app/
  page.tsx                     # Home (search + recent scans)
  layout.tsx                   # Root layout
  globals.css                  # Global styles & CSS variables
  scan/[address]/page.tsx      # Scan result page (client component)
  api/
    scan/route.ts              # POST — main security analysis
    recent/route.ts            # GET — recent scans
    stats/route.ts             # GET — global statistics
    og/route.tsx               # GET — OG image generation
    telegram/route.ts          # POST — Telegram webhook
  about/page.tsx               # Static pages: about, alerts, api-docs,
  alerts/page.tsx              #   blog, disclaimer, docs, privacy,
  api-docs/page.tsx            #   scoring, security, terms
  blog/page.tsx
  disclaimer/page.tsx
  docs/page.tsx
  privacy/page.tsx
  scoring/page.tsx
  security/page.tsx
  terms/page.tsx

components/
  Navbar.tsx, Logo.tsx, Footer.tsx          # Layout
  ThemeProvider.tsx, ThemeToggle.tsx        # Theme (dark/light)
  SearchInput.tsx                          # Token address input
  RecentScans.tsx, Stats.tsx               # Home page widgets
  ScoreDisplay.tsx                         # Score circle + grade
  Checklist.tsx                            # Security check groups
  TokenHeader.tsx                          # Token metadata header
  RiskList.tsx                             # Risk factors list
  HolderChart.tsx                          # Top holders chart
  BondingCurveProgress.tsx                 # Pump.fun progress
  ActivityTimeline.tsx                     # Tx timeline
  DevHistory.tsx                           # Dev wallet history
  InfoTooltip.tsx                          # Tooltips
  RateLimitModal.tsx                       # Rate limit modal
  SidebarLinks.tsx                         # Sidebar nav
  PricingTiers.tsx                         # Pricing display
  ui/button.tsx, card.tsx, input.tsx       # shadcn/ui base

lib/
  utils.ts                                # cn() class merger
  scoring/
    engine.ts                             # Scoring engine (main logic)
    constants.ts                          # Grade thresholds
    whitelist.ts                          # Known good tokens
  solana/
    connection.ts                         # Helius RPC connection
    authority.ts                          # Mint/freeze authority checks
    holders.ts                            # Holder analysis & clustering
    pumpfun.ts                            # Pump.fun bonding curve
    tokenAge.ts                           # Token creation time
  external/
    price.ts                              # Birdeye — price data
    metadata.ts                           # Jupiter — token metadata
    liquidity.ts                          # DexScreener — LP pools
    jupiter-swap.ts                       # Jupiter — honeypot detection
    jupiter-tokens.ts                     # Jupiter — token type
  storage/
    recent-scans.ts                       # Recent scans cache
  telegram/
    bot.ts                                # Bot command handlers
    templates.ts                          # Message templates

scripts/
  run-bot.ts                              # Telegram bot runner
  setup-telegram.ts                       # Webhook setup

public/
  noir.js                                 # Wallet connection script
  logo-dark.png, logo-light.png           # Theme logos
```

## Scoring Engine

`lib/scoring/engine.ts` runs parallel security checks and calculates a score:

1. **Authority** — mint/freeze authority status
2. **Holders** — top 10 concentration, dev wallet, snipers, linked wallets
3. **Liquidity** — pool size (DEX) or bonding curve progress (Pump.fun)
4. **Honeypot** — sell simulation via Jupiter (fail = honeypot)
5. **Metadata** — mutability, social links
6. **Token age** — newer = riskier
7. **Price/market** — current price, 24h change, market cap

**Score:** starts at 100, penalties deducted per risk. Critical fails (honeypot, active mint authority) → automatic F.

**Grades:** A ≥80 · B 60-79 · C 40-59 · D 20-39 · E 1-19 · F 0/critical

**Pump vs DEX:** auto-detected. Pump mode uses bonding curve instead of LP checks.

## Key Patterns

- Security checks use `safeCheck()` wrapper — errors don't crash the scanner
- Pages are `"use client"` for interactivity, logic lives in `lib/`
- All RPC through `connection.ts` (single Helius endpoint)
- CSS variables for theming: `--bg-primary`, `--text-primary`, `--silver-accent`
- Custom classes: `glass-card`, `gradient-text`, `silver-accent`
- Path alias: `@/*` → project root

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint
npm run bot          # Telegram bot
npm run bot:setup    # Setup Telegram webhook
```

## Environment (.env.local)

```
HELIUS_API_KEY=
BIRDEYE_API_KEY=
TELEGRAM_BOT_TOKEN=      # optional
TELEGRAM_BOT_SECRET=     # optional
```

## External APIs

Helius (Solana RPC) · Birdeye (price) · Jupiter (metadata, honeypot sim) · DexScreener (liquidity) · Metaplex (on-chain metadata)
