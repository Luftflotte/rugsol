# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**rug** is a Solana token security analysis tool that detects rug pulls and analyzes token risk. Users enter a token address and receive an instant security assessment with a score (0-100) and letter grade (A-F).

**Key Features:**
- Real-time on-chain analysis (authorities, holders, liquidity, age)
- Honeypot detection via transaction simulation
- Rug pull risk scoring
- Support for both DEX tokens and Pump.fun bonding curve tokens
- Social sharing with generated report cards
- Telegram bot for alerts (via scripts)

## Architecture

### High-Level Flow

```
User enters token address → /api/scan endpoint → Scoring engine
  ↓
  Multiple parallel security checks:
  - Authority checks (mint/freeze)
  - Holder distribution analysis
  - Liquidity analysis (DEX pools or Pump.fun curve)
  - Honeypot detection (sell simulation via Jupiter)
  - Token metadata & age
  - Advanced: dev wallet, sniper detection, linked wallets
  ↓
Scoring formula calculates 0-100 score → Letter grade (A-F)
  ↓
Result displayed on scan/[address] page with interactive components
```

### Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API routes, Solana RPC (Helius), external APIs (Birdeye, Jupiter, DexScreener)
- **Blockchain:** @solana/web3.js, @solana/spl-token
- **Utilities:** clsx, class-variance-authority, lucide-react icons

### Directory Structure

```
app/                        # Next.js App Router
  scan/[address]/          # Scan result page (client component)
    page.tsx             # Displays token analysis & interactive components
    layout.tsx
  api/                     # API routes
    scan                   # POST endpoint that performs security analysis
    og                     # Open Graph image generation for sharing
  page.tsx                 # Home page (search & recent scans)
  layout.tsx               # Root layout
  globals.css              # Global styles

components/                # React UI components
  Checklist.tsx           # Security check groups display
  ScoreDisplay.tsx        # Score circle & grade badge
  HolderChart.tsx         # Top 10 holders visualization
  BondingCurveProgress.tsx # Pump.fun progress bar
  RiskList.tsx            # Penalties/risk factors list
  ActivityTimeline.tsx    # Transaction timeline
  TokenHeader.tsx         # Token metadata display
  InfoTooltip.tsx         # Helper tooltips
  (and more UI components)

lib/
  scoring/
    engine.ts             # Main scoring logic - aggregates checks & calculates score
    constants.ts          # Grade thresholds & scoring config
    whitelist.ts          # Known good tokens
  solana/
    connection.ts         # RPC connection & token context
    authority.ts          # Mint/freeze authority checks
    holders.ts            # Top holder analysis
    pumpfun.ts            # Pump.fun bonding curve state
    tokenAge.ts           # Token creation time
  external/
    price.ts              # Token price (Birdeye)
    metadata.ts           # Token metadata (Jupiter)
    liquidity.ts          # LP pool size (DexScreener)
    jupiter-swap.ts       # Honeypot detection (sell simulation)
    jupiter-tokens.ts     # Token type detection
  utils.ts                # Utility functions (cn class merger)

scripts/                    # CLI scripts
  run-bot.ts              # Telegram bot (uses grammy)
  setup-telegram.ts       # Webhook setup
```

## Scanning Logic

### Security Checks (Modular Design)

The scoring engine (`lib/scoring/engine.ts`) runs 8+ independent checks and combines results:

1. **Authority Checks** (`lib/solana/authority.ts`)
   - Mint Authority: Can tokens be printed? (revoke = safe)
   - Freeze Authority: Can wallets be frozen? (revoke = safe)

2. **Holder Analysis** (`lib/solana/holders.ts`)
   - Top 10 concentration
   - Largest holder percentage
   - Wallet type identification

3. **Liquidity** (`lib/external/liquidity.ts`)
   - Pool size (DEX) or bonding curve progress (Pump.fun)
   - LP locked/burned status
   - Different logic for Pump vs DEX mode

4. **Honeypot Detection** (`lib/external/jupiter-swap.ts`)
   - Simulates a sell transaction
   - If tx fails → honeypot detected (user can't sell)

5. **Token Metadata** (`lib/external/metadata.ts`)
   - Immutability status
   - Social links (Twitter, Telegram, website)
   - Token name/symbol/image

6. **Token Age** (`lib/solana/tokenAge.ts`)
   - Time since creation
   - Recent = higher risk

7. **Advanced Analysis** (`lib/solana/holders.ts` + `engine.ts`)
   - Dev wallet tracking & sell-out detection
   - Sniper identification (bought in same block as deployment)
   - Jito bundle detection (coordinated buys)
   - Linked wallet clusters (wallets funded from same source)

8. **Price & Market Data** (`lib/external/price.ts`)
   - Current price, 24h change, market cap

### Scoring Formula

- **Base:** Start at 100 points
- **Penalties:** Each risk category deducts points:
  - Honeypot: -50
  - No mint authority: -25
  - No freeze authority: -15
  - High holder concentration: -50 (top 80%) down to -10 (top 30%)
  - Low liquidity: -30 (< $1k) down to 0 (> $50k)
  - And more...
- **Critical Failures:** If honeypot or mint authority active → automatic F grade
- **Grades:**
  - A: ≥ 80 points
  - B: 60-79 points
  - C: 40-59 points
  - D: 20-39 points
  - E: 1-19 points
  - F: 0 or critical fail

### Pump.fun vs DEX Modes

The scanner detects which platform a token uses and adjusts checks:

- **Pump Mode:** Bonding curve progress replaces LP checks, LP lock check shows N/A, metadata always mutable
- **DEX Mode:** Full liquidity & authority analysis, mutable metadata flagged as risk

## Key Data Flows

### Scanning a Token (POST /api/scan)

1. User sends token address
2. Fetch token context (metadata, supply, decimals)
3. Detect if Pump.fun or DEX (via program ID)
4. Run 8+ security checks in parallel
5. Calculate penalties & score
6. Return comprehensive `ScanResult` object

### Displaying Results (GET /scan/[address])

1. Client loads page with token address
2. useEffect triggers fetch to /api/scan
3. Skeleton loading state shown
4. Transform `ScanResult` → check groups → UI components
5. Interactive elements: hover tooltips, share buttons, links

### Caching

Results may be cached (indicated by `cached` flag in response). Check `SidebarLinks.tsx` for cache timestamp display.

## Development Commands

```bash
npm run dev         # Start dev server (http://localhost:3000)
npm run build       # Production build
npm run start       # Run production build locally
npm run lint        # Run ESLint
npm run bot         # Run Telegram bot (requires .env.local)
npm run bot:setup   # Set up Telegram webhook
npm run bot:delete-webhook  # Remove webhook
```

## Environment Variables

Create `.env.local`:

```
HELIUS_API_KEY=<your-helius-rpc-key>
BIRDEYE_API_KEY=<your-birdeye-api-key>
# Optional for Telegram bot:
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
TELEGRAM_BOT_SECRET=<your-bot-secret>
```

## Important Patterns & Conventions

### Error Handling

- Security checks use `safeCheck()` wrapper to catch errors gracefully
- Returns `CheckResult<T>` with status ("success" | "error" | "unknown")
- Failed checks don't crash the scanner; results are marked as unknown/error

### Component Structure

- Pages are "use client" (client components) for interactivity
- Complex data transformations happen in utility functions (e.g., `transformToCheckGroups`)
- UI components are presentational, logic in lib/

### API Safety

- All RPC calls go through `connection.ts` (single Helius endpoint)
- External APIs wrapped in utility functions with error handling
- Token address validated before processing

### Styling

- CSS variables for theme: `--silver-accent`, `--bg-primary`, `--text-primary`, etc.
- Utility classes: `glass-card`, `gradient-text`, `silver-accent`
- Responsive design with Tailwind breakpoints (sm, md, lg)

## Common Tasks

### Adding a New Security Check

1. Create check function in appropriate `lib/` module
2. Add interface for return type
3. Call via `safeCheck()` in `engine.ts`
4. Add penalty logic in penalty calculation section
5. Update UI component to display result

### Modifying Scoring Formula

Edit `lib/scoring/engine.ts`:
- Adjust penalty points for each check
- Modify grade thresholds in `constants.ts`
- Run tests to ensure grades align with expectations

### Updating UI for New Data

1. Add new data to `ScanResult` interface
2. Pass to component via props
3. Use `InfoTooltip` for explanatory context
4. Add check group in `transformToCheckGroups()`

## External API Dependencies

- **Helius:** Solana RPC for token data
- **Birdeye:** Token price & market data
- **Jupiter:** Token metadata, sell simulation
- **DexScreener:** Liquidity pool info
- **Metaplex:** Token metadata on-chain

## Git Workflow

- Main branch is `main`
- Recent commits focused on UI improvements and component refactoring
- Changes include new `InfoTooltip` component and improved visuals
