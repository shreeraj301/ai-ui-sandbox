# Progress

Last updated: 2026-11-04

## Current state

Phase 1, sub-milestone 3 (token editor) is built on branch `phase-1-playground` and in review with the owner. Sub-milestones 1 and 2 are pushed on the same branch.

What works now:

- The left panel has two tabs: Components (the library) and Tokens.
- The Tokens tab lists 40 editable tokens in five groups: Colour, Type, Spacing, Radius, Elevation. Each row shows a small drawing of the value in the user's own system, the name and the value.
- Picking a token opens it in the right panel: what uses it, the value controls, its contrast pairs (colours only) and Reset to starter value.
- Controls: colour picker plus hex field (full values apply as typed, 3-digit shorthand on leaving), number fields with ranges and messages, a font stack dropdown, and shadow fields (offsets, blur, spread, colour, opacity).
- Contrast: 16 pairs checked against WCAG 2.2 AA, summarised at the top of the Tokens tab with links to the failing ones. The starter border fails at 1.65:1 against white (needs 3:1); this is shown, not hidden.
- New tokens: strong and heading weight, body and heading line height, three shadows. Card has an Elevation option that uses them.
- Export: tokens.json (DTCG 2025.10) and tokens.css (variables on :root, without the editor's `--u-` prefix), each by copy or download. Reset all tokens is one undoable step.
- Every token edit goes through the new `updateToken` operation, so it is validated, undoable, coalesced for quick edits and autosaved. Older saved projects migrate to schema version 2.

## Verified

Sub-milestone 3, cloud workspace (Linux, Node 22.23): `npm run check` passes with 77 unit tests in 9 files. All 6 Playwright tests pass in Chromium using a local config pointed at the cloud browser, including a new token journey: change brand by hex, refuse an out-of-range radius, fix the border contrast, download tokens.css and read it, reload, reset all and undo. Screens checked at 1440 × 900, 1280 × 800 and 390 × 844 with no page errors.

## Audit (principles-and-laws-audit)

Sub-milestone 3, fixed before review:

- Shadow previews in the token list were invisible: white on white (visual hierarchy, severity 2). They now sit on the user's canvas colour at a larger size.
- Line-height previews were the same glyph for every value, so the drawing carried no information (drawing-set rule, severity 1). They are now three lines spaced by the ratio.
- Switching sidebar tabs kept the scroll position, opening Components mid-list (consistency and standards, severity 2). Each tab now opens at its top.
- The Card elevation hint did not say where to edit the shadows (recognition over recall, severity 1). It now points to Tokens, under Elevation.
- A half-typed hex such as "#b51" would have applied as a different colour (error prevention, severity 2). Shorthand now applies only when the field is left.

Earlier sub-milestones: state cells hiding inputs, sideways stage scroll, pinned panel headings, loading hint, undo and redo, scroll to new selection, two-tone focus ring, invalid fields revert on leave.

## Known gaps

- `npm run test:e2e` needs a browser matching Playwright 1.64.1. The cloud workspace runs it with a throwaway config that points at its own Chromium; the owner's machine runs it as is.
- The starter border colour fails its own contrast check (1.65:1). Changing the starter look is the owner's call.
- Token rows are 34px tall and the copy and download buttons 32px: above the WCAG 2.2 minimum of 24px, below the 44px comfort target. Fine for a pointer-first desktop editor; revisit with viewports.
- The Claude desktop app's command runner sets `NODE_ENV=production`, which makes `npm ci` skip dev dependencies. Use `npm ci --include=dev` there. The owner's own terminal is not affected.
- The blueprint dark theme still needs a 2 hour working session test (docs/DESIGN.md).

## Next

1. Owner reviews sub-milestone 3. On approval, push it to `phase-1-playground`.
2. Sub-milestone 4: viewports (desktop, tablet, mobile) with real reflow, and zoom.
