# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint via Next.js
npm test             # Run all tests (Jest + jsdom)
npm run test:watch   # Watch mode
npm run test:coverage  # With coverage report

# Run a single test file
npx jest components/AmountInput.test.tsx
npx jest --testNamePattern="converts currency"
```

No environment variables are required — the app uses a free public API (frankfurter.app) with no API keys.

## Architecture

The app is a Next.js 14 (App Router) currency converter with two custom hooks that own all logic:

- **`hooks/useExchangeRates.ts`** — fetches rates from `/api/rates` on mount, exposes `{ exchangeRates, loading, error }`.
- **`hooks/useConverter.ts`** — takes `exchangeRates` as input, manages all conversion state, URL sync (via `useRouter`/`useSearchParams`), and localStorage history. Returns the full form state and handlers consumed by `app/page.tsx`.

`app/page.tsx` is the single page — it calls both hooks and passes values down to presentational components in `components/`.

**API route** (`app/api/rates/route.ts`) proxies frankfurter.app and falls back to hardcoded `MOCK_RATES` if the upstream fails. Response is cached server-side for 1 hour via `Cache-Control` and `export const revalidate = 3600`.

**Data flow:** rates are always USD-based. Conversion formula: `(amount / fromRate) * toRate` where rates are relative to USD=1.

**Persistence:** `utils/storage.ts` reads/writes conversion history to `localStorage` under key `currency_converter_history`, capped at 10 entries.

**Path alias:** `@/` maps to the repo root (configured in `tsconfig.json` and `jest.config.js`).

## Testing

Tests use Jest + jsdom + `@testing-library/react`. MSW (`msw`) is available for API mocking. `jest-axe` is available for accessibility assertions.

Test files live alongside source files (e.g., `components/AmountInput.test.tsx`, `hooks/useConverter.test.ts`).

## This Repository's Purpose

This is a training platform for AI-assisted development challenges. The `docs/` folder contains challenge guides (beginner → advanced). Each challenge has a corresponding solution branch. The `main` branch holds the completed reference implementation.
