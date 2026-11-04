# Progress

Last updated: 2026-11-04

## Current state

Phase 1, sub-milestone 1 (the thin slice) is built on branch `phase-1-playground` and in review with the owner. Phase 0 and the editor identity are on `main`.

What works now:

- Add Text, Button, Badge, Text input or Card from the library; it lands on the page selected.
- Select by click or keyboard (Tab, then Enter); Escape clears the selection.
- Edit props in the inspector. Invalid values show a message and never reach the document.
- Dimension lines show the selected component's measured size; the title block shows project, page, scale, viewport, revision and save status.
- Remove from page, undo and redo (toolbar or Ctrl+Z / Ctrl+Shift+Z).
- Autosave to IndexedDB; reload reopens the last project. "Saved locally" appears only after a successful write.
- Below 900px the editor explains that editing needs a wider screen.

## Verified

Sub-milestone 1, in the cloud workspace (Linux, Node 22.23):

- `npm run check`: typecheck, lint, format check, 38 unit tests in 7 files, production build: pass.
- Screens checked in Chromium at 1440 × 900 and 390 × 844: no page errors, no horizontal page scroll on the phone.
- The app makes no requests outside its own origin (font is bundled).

On the owner's Windows machine (Node 24, Playwright 1.64.1 Chromium):

- `npm run check`: all pass, 38 unit tests.
- `npm run test:e2e`: 3 passed, including add, edit, reject an empty label, reload and restore, keyboard selection, remove, undo and redo.

## Audit (principles-and-laws-audit, sub-milestone 1)

Fixed before review:

- No way back from removing a component (NN/g heuristic 3, severity 3): added undo and redo.
- New components could land out of view (feedback loops, severity 2): the stage scrolls to the new selection.
- Keyboard focus ring was yellow on the user's light canvas, about 1.7:1 (WCAG 1.4.11, severity 2): now a two-tone ring with a dark outer edge.
- Leaving a field with an invalid value kept the bad text (heuristic 9, severity 1): it now reverts to the last valid value.
- Frame label repeated the title block (minimalist design, severity 1): reduced to "Desktop".
- Inspector repeated the component type as its name (severity 1): the type shows only when the name differs.

Open, by design for later sub-milestones: no rename for the project or components, no reordering, one viewport.

## Known gaps

- `npm run test:e2e` does not run in the cloud workspace, which lacks a browser matching Playwright 1.64.1. It runs on the owner's machine.
- The Claude desktop app's command runner sets `NODE_ENV=production`, which makes `npm ci` skip dev dependencies. Use `npm ci --include=dev` there. The owner's own terminal is not affected.
- The blueprint dark theme still needs a 2 hour working session test (docs/DESIGN.md).

## Next

1. Owner reviews sub-milestone 1. On approval, push branch `phase-1-playground`.
2. Sub-milestone 2: the remaining 10 components and the States tab.
