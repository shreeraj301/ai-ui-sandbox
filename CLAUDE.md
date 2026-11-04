# Working on AI UI Sandbox

Read first: `docs/PROGRESS.md` (current state), `docs/ARCHITECTURE.md` (document model), `docs/ROADMAP.md` (phase gates). The full requirements are in `PRD/`, which is kept local and git-ignored.

## Rules

- Build only the current phase. Stop at its acceptance gate and report. Do not start the next phase without the owner's explicit OK.
- Plan first and check in with the owner before building, writing long-form or changing files. Show a screenshot, preview or diff before anything is pushed, published or deployed.
- Every project change goes through `applyOperations` in `src/document/operations.ts`. No component, store or future AI code mutates the document directly.
- Imported files, stored records and AI output are untrusted. Run them through `parseProject` or `applyOperations`, which validate the schema and the structure.
- Never use `eval`, `new Function` or unsafe HTML injection. ESLint blocks the first two.
- No placeholder or decorative controls. If a control is on screen, it works.
- Never invent research, metrics, quotes or test results. Record only what was observed.
- Do not push to GitHub or deploy without the owner's explicit permission.

## Writing style

- No em dashes, anywhere: docs, UI copy, comments, commit messages. Use commas, colons or full stops.
- Plain words. Avoid "delve", "seamless", "robust", "leverage" and promotional tone.

## Checks before reporting work as done

1. `npm run check` passes.
2. `npm run test:e2e` passes for user-facing changes.
3. UI work: look at it in a real browser at desktop and mobile widths, then run the principles-and-laws audit (see `docs/SKILLS.md`).
4. Update `docs/PROGRESS.md` with what was verified, not what was intended.

## Stack notes

- TypeScript is pinned to 6.0.x because typescript-eslint does not support 7 yet. Revisit when it does.
- Tokens follow the W3C DTCG 2025.10 format (`$value`, `$type`, `$description`).
- Line endings are LF (`.gitattributes`), including on Windows.
