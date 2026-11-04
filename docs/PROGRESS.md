# Progress

Last updated: 2026-11-04

## Current state

Phase 0 is complete. The owner approved it and it was pushed to `main` on 2026-11-04. Phase 1 has not started.

## Verified

Verified in the cloud workspace (Linux, Node 22.23):

- `npm run typecheck`, `npm run lint`: pass.
- `npm test`: 3 files, 17 tests pass.
- `npm run build`: passes.
- Built shell rendered in Chromium at 1280px, light and dark, with no page errors.

Verified on the owner's Windows machine (Node 24, Chromium via Playwright 1.64.1):

- `npm run check`: typecheck, lint, format check, 17 unit tests and the production build all pass.
- `npm run test:e2e`: 1 passed.

## Since Phase 0

- Editor identity chosen: Direction A, Drawing Set, dark first. Tokens in `src/styles/editor-tokens.css`, rules in `docs/DESIGN.md`, Archivo self-hosted. The shell now uses them.

## Known gaps

- `npm run test:e2e` does not run in the cloud workspace, which lacks a browser matching Playwright 1.64.1. It runs on the owner's machine.
- The Claude desktop app's command runner sets `NODE_ENV=production`, which makes `npm ci` skip dev dependencies. Use `npm ci --include=dev` there. The owner's own terminal is not affected.

## Next

1. Phase 1, sub-milestone 1: the thin slice, after the owner's OK on the plan.
