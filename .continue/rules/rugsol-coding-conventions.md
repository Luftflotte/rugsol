---
alwaysApply: true
---

## Coding Conventions for RugSol

### TypeScript
- Strict TypeScript usage across the entire codebase
- Define explicit interfaces for all data structures (e.g., `CheckResult<T>`, `PenaltyDetail`, `ScanResult`)
- Use `CheckResult<T>` pattern with `status: "success" | "error" | "unknown"` for all check results

### Fault Tolerance
- Always wrap external API calls and blockchain queries in `safeCheck()` to prevent cascading failures
- Individual check failures should never crash the entire scan
- Use `Promise.all()` for parallel execution of independent checks

### API Routes
- Return standardized JSON: `{ success: boolean, data: any, error?: string }`
- API routes live in `app/api/` using Next.js App Router conventions

### Styling
- Use Tailwind CSS 4 with CSS variables for theming (e.g., `var(--silver-accent)`, `text-text-primary`)
- Use shadcn/ui components from `components/ui/`
- Glass-card styling with `glass-card` and `premium-bg` CSS classes
- Support dark/light themes via ThemeProvider

### Scoring Logic
- Score starts at 100, penalties are subtracted
- Critical penalties (`isCritical: true`) force grade F regardless of score
- Whitelist tokens have `minScore` floor and `skipChecks` for specific categories
- Pump.fun mode has different penalty weights than DEX mode
- When penalties overlap (e.g., top10 holders vs single whale), take MAX not SUM

### Imports
- Use `@/` path alias for imports (e.g., `@/components/Navbar`, `@/lib/scoring/engine`)