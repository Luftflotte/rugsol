# TODO: PricingTiers + RateLimitModal

## components/PricingTiers.tsx

- [ ] Удалить тир Visitor
- [ ] Тир Authorized (бесплатный):
  - name: "Authorized" → "Free"
  - subtext: "Just connect your wallet" → "Free account"
  - price: $0/mo — оставить
  - Фичи: 1 scan/min, risk score & grade, top 10 holders, checklist, shareable cards
  - Убрать фичи: watchlist & alerts, 30-day scan history (уходят в Pro)
  - button.text: "Unlock now" → "Sign In — It's Free"
  - Иконка кнопки: <Wallet> → <LogIn>
  - Класс кнопки: noir-connect — оставить
  - Style: hero (центральная выделенная карточка)
- [ ] Новый тир Pro ($5/mo):
  - subtext: "For serious traders"
  - Фичи: 5 scans/min, всё из Free + dev wallet history (полный), watchlist & alerts, 30-day history, priority scan
  - button.text: "Get Pro" — Coming Soon (disabled)
  - Иконка кнопки: <Sparkles> или <Zap>
  - Badge: "Most Popular"
  - Style: technical
- [ ] Тир API ($9/mo) — без изменений
- [ ] Обновить заголовок секции: убрать упоминание кошелька и "Try it once for free"

## components/RateLimitModal.tsx

- [ ] Заголовок: "Free Scans Exhausted" → "Sign In to Continue"
- [ ] Subtitle: "Choose a tier below to continue scanning." → "Create a free account to keep scanning. No credit card required."
- [ ] Trust badges: "No payment required" → "No credit card" · остальные оставить
- [ ] <PricingTiers compact /> — скрыть тир API в compact-режиме (не нужен в модали)
- [ ] Иконка в шапке модали: <Shield> → <LogIn> или <User>

## Копирайт — убрать упоминания кошелька везде

- [ ] DevHistory — кнопка "Sign In to Reveal" — уже нейтральная, оставить
- [ ] Иконку <Wallet> на всех кнопках входа заменить на <LogIn> или <UserCircle>

## Привязка к noir.js

- [ ] Все кнопки входа имеют класс noir-connect — проверить после правок
- [ ] Pro кнопка "Get Pro" — уточнить нужен ли отдельный класс под покупку
- [ ] <Script src="/noir.js" strategy="afterInteractive"> в layout.tsx — уже стоит, не трогать
