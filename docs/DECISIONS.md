# Decisions

Newest first.

## 2026-11-04: Pin TypeScript to 6.0.x

TypeScript 7.0.2 is the latest release, but typescript-eslint 8.72.1 supports TypeScript below 6.1. Pinning 6.0.3 keeps type-aware linting working. Revisit when typescript-eslint supports 7.

## 2026-11-04: Exact dependency versions

`package.json` pins exact versions so builds on the owner's Windows machine, in CI and on Vercel resolve the same packages. Upgrades are deliberate.

## 2026-11-04: Known dev-only audit warnings

`npm audit` reports moderate issues in `minimatch`, pulled in by dev tooling. Production dependencies report none (`npm audit --omit=dev`). Not fixed with `--force` because that would introduce breaking upgrades to the tooling.

## 2026-11-04: All changes go through typed operations

Every project change is an `Operation` applied by `applyOperations` as an all-or-nothing transaction, validated against the schema and structural rules afterwards. Reasons: one place to validate, undo becomes a list of transactions, and the Phase 12 AI layer can be restricted to emitting the same operations instead of touching state directly.

## 2026-11-04: Flat node storage with explicit links

Nodes live in a map keyed by id, with `parentId` and ordered `childrenIds`. Moves and lookups are cheap, and the validator can check both sides of each link.

## 2026-11-04: zod for runtime validation

Imported files, stored records and AI output must be checked at runtime, not just typed. zod 4 gives schemas and TypeScript types from one definition.

## 2026-11-04: W3C DTCG 2025.10 token format

The first stable design tokens spec was published 28 Oct 2025. Using it means exported tokens open in Style Dictionary, Tokens Studio, Terrazzo and Penpot.

## 2026-11-04: Vite + React + TypeScript, client only

Matches the PRD's preferred stack. No server keeps the product free to host and keeps projects private by default.

## 2026-11-03: Name is AI UI Sandbox

Settled by the owner. Repo: `ai-ui-sandbox`.
