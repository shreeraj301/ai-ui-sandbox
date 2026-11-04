# AI UI Sandbox

A browser workspace for exploring interface components, their states and the design tokens behind them. No account, no server: projects stay in your browser.

**Status:** Phase 0 (foundation). There is no editor yet. See [docs/PROGRESS.md](docs/PROGRESS.md) for what works today and [docs/ROADMAP.md](docs/ROADMAP.md) for what comes next.

## What it will do

1. Add a component to a stage.
2. Edit its content and appearance.
3. Preview states such as hover, focus, disabled, loading and error.
4. Edit design tokens and watch every linked component update.
5. Check the result at desktop, tablet and mobile widths.
6. Save locally and export a backup.

Later phases add layout, reusable variants, interactions, code export and an optional AI layer that proposes changes for you to review. The AI never edits your project without your approval.

## Run it

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev          # local dev server
npm run check        # typecheck, lint, format check, unit tests, production build
npm run test:e2e     # browser smoke test (first time: npx playwright install chromium)
```

| Script                    | What it does                   |
| ------------------------- | ------------------------------ |
| `dev`                     | Start the Vite dev server      |
| `build`                   | Typecheck and build to `dist/` |
| `preview`                 | Serve the production build     |
| `typecheck`               | TypeScript project check       |
| `lint`                    | ESLint                         |
| `format` / `format:check` | Prettier write / check         |
| `test`                    | Vitest unit tests              |
| `test:e2e`                | Playwright browser tests       |

## Where things live

```text
src/app/        App shell
src/document/   Project document: schema, operations, validation, parsing
src/styles/     Base styles
tests/unit/     Vitest tests
tests/e2e/      Playwright tests
docs/           Product, architecture and progress docs
```

## Limits to know

- Projects will be stored in this browser's IndexedDB (from Phase 1). Clearing site data deletes them, and a different browser or domain will not see them. Export a backup to keep or move work.
- AI features are planned (Phase 12) and optional. Nothing is sent anywhere without a clear notice and your action.
