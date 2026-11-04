# Progress

Last updated: 2026-11-04

## Current state

Phase 1, sub-milestone 2 is built on branch `phase-1-playground` and in review with the owner. Sub-milestone 1 is pushed on the same branch.

What works now:

- All 15 Phase 1 components: Text, Button, Icon button, Badge, Divider, Text input, Textarea, Select, Checkbox, Switch, Card, Avatar, Image, Alert, Progress. Each has a strict prop schema, defaults, inspector controls and a library preview.
- Inspector tabs: Properties and States. Field types: text, multi-line text, number with range, segmented choice, dropdown and switch, with hints where a field needs explaining.
- States tab: every meaningful state side by side in the user's design system; picking one holds it on the stage with a "Showing hover" label. Previews are never saved.
- Button gains leading and trailing icons and a loading prop; text input gains success text.
- Image takes an https address only, with empty, loading and failed states.
- From sub-milestone 1: add, select, edit with validation, measured dimension lines, title block, remove, undo and redo, autosave and reload.

## Verified

Sub-milestone 2, cloud workspace (Linux, Node 22.23): `npm run check` passes with 62 unit tests in 8 files, including every component rendered in every state it declares. Screens checked in Chromium at 1440 × 900 with no page errors.

On the owner's Windows machine (Node 24, Playwright 1.64.1 Chromium): `npm run check` passes with 62 unit tests, and `npm run test:e2e` passes all 5 browser tests, including adding and editing each new component and previewing states.

## Audit (principles-and-laws-audit)

Sub-milestone 2, fixed before review:

- State cells hid the user's own text inputs: an editor style for the cell's radio button also matched inputs inside the component (layout bug, severity 3). Scoped the style to the cell's own control.
- Adding a wide component scrolled the stage sideways and cut off the left margin (feedback loops, severity 2). The stage now scrolls vertically only.
- Panel headings scrolled out of view in long lists (recognition over recall, severity 1). They now stay pinned.
- Two ways to show loading on a button could confuse (consistency, severity 1). The Loading field now explains it is saved, and points to the States tab for previews.

Sub-milestone 1: undo and redo added, scroll to new selection, two-tone focus ring, invalid fields revert on leave, duplicate labels removed.

## Known gaps

- `npm run test:e2e` does not run in the cloud workspace, which lacks a browser matching Playwright 1.64.1. It runs on the owner's machine.
- The Claude desktop app's command runner sets `NODE_ENV=production`, which makes `npm ci` skip dev dependencies. Use `npm ci --include=dev` there. The owner's own terminal is not affected.
- The blueprint dark theme still needs a 2 hour working session test (docs/DESIGN.md).

## Next

1. Owner reviews sub-milestone 2. On approval, push it to `phase-1-playground`.
2. Sub-milestone 3: the token editor, with contrast checks and DTCG and CSS variable export.
