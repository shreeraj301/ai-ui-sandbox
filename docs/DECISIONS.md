# Decisions

Newest first.

## 2026-11-04: Token editor edits a fixed catalogue

The token editor changes values only, for the 40 tokens the components read (`src/design-system/catalogue.ts`). Adding, renaming and deleting tokens waits for Phase 5, because component styles depend on the exact names. Two starter tokens no component reads, `color.neutral` and `space.1`, stay in the file and the exports but are not listed in the editor.

## 2026-11-04: Font family from system stacks only

The font picker offers six stacks of fonts already on people's devices (adapted from modernfontstacks.com). Loading a web font would mean a request to a font server, which breaks the no-third-party-requests promise. A free text field was rejected because it only renders where that font is installed.

## 2026-11-04: Contrast warns, never blocks

Sixteen colour pairs the components really draw are checked against WCAG 2.2: 4.5:1 for text, 3:1 for control edges. A failing pair is flagged with an icon and text, not a second accent colour, and the edit still applies. Ratios round down for display so a failing pair never reads as passing.

## 2026-11-04: Image takes an https address for now

Owner's choice. Only `https://` addresses pass the schema, images load with `referrerPolicy="no-referrer"`, and a failed load shows a clear state. Uploading files into the project comes with import and export in sub-milestone 5.

## 2026-11-04: Lucide icons, from a fixed list of 16

Button and icon button pick from a fixed set, so the prop schema can reject any other name and the bundle stays small.

## 2026-11-04: State previews are editor state, not document state

The States tab forces a state with a `data-state` attribute that the component CSS treats like the real pseudo-class. The preview lives in the editor store only: it is never saved, never undone and clears when the selection changes. States that matter to the design (a loading button, an error message) are real props.

## 2026-11-04: Zustand for editor state, Dexie for IndexedDB

Zustand holds the open project, selection, save status and undo history in one small store; every project change still goes through `applyOperations`. Dexie wraps IndexedDB with transactions and schema versions. Both are small, maintained and pinned.

## 2026-11-04: Undo and redo in sub-milestone 1

The principles-and-laws audit rated an unrecoverable delete as a major problem (NN/g heuristic 3, severity 3). Because projects are immutable snapshots, history is a list of earlier projects (up to 100). Quick edits to the same field undo as one step.

## 2026-11-04: Stage at 100% until viewports arrive

Fitting the 1440px frame into a laptop stage shrank components to about 50%, too small to judge. The stage shows the frame at 100% and scrolls sideways. Zoom returns with viewport switching in sub-milestone 4.

## 2026-11-04: Editor identity is Direction A, Drawing Set, dark first

The owner chose A from three live directions ([decision page](https://claude.ai/artifact/3pPzhcBeMotH5ndW9pecaF)), with the blueprint dark theme as the default. Reasons: it is the only direction that could not pass for another editor, its drawing devices carry real information, and it reflects the owner's architecture training. Full rules in [DESIGN.md](DESIGN.md). Known risk: the saturated dark ground needs a long-session test in Phase 1.

## 2026-11-04: Self-host the editor font

Archivo is installed from `@fontsource-variable/archivo` and bundled, instead of loading from Google Fonts. The app makes no third-party requests during normal use, which matches the privacy promise.

## 2026-11-04: No design-drift lock

The `design-drift` plugin locks a project to one of its bundled brand systems. Our identity is custom, so it does not apply. `docs/DESIGN.md` and the tokens file act as the lock instead, and UI reviews check against them.

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
