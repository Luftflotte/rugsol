# Rug

Next.js 14 проект с App Router, TypeScript, Tailwind CSS и shadcn/ui для работы с Solana.

## Технологии

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- @solana/web3.js
- @solana/spl-token

## Структура проекта

```
app/            # Next.js App Router pages
components/     # React компоненты
lib/
  solana/       # Solana utilities
  scoring/      # Scoring logic
  external/     # External API integrations
  utils.ts      # Общие утилиты (cn)
```

## Переменные окружения

Создайте `.env.local` и заполните:

```
HELIUS_API_KEY=your_helius_api_key
BIRDEYE_API_KEY=your_birdeye_api_key
```

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).
