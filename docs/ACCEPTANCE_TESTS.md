# Acceptance tests

## Phase 0

### Automated

| Check   | Command                | Covers                                                                                                                                                                                                                  |
| ------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types   | `npm run typecheck`    | Strict TypeScript across app, tests and configs                                                                                                                                                                         |
| Lint    | `npm run lint`         | ESLint, React hooks rules, bans `eval` and `new Function`                                                                                                                                                               |
| Format  | `npm run format:check` | Prettier                                                                                                                                                                                                                |
| Unit    | `npm test`             | App shell renders; operations add, remove with descendants, move, reorder, refuse cycles, merge props, rename, all-or-nothing; parsing round-trips JSON, rejects bad versions and broken structure, accepts DTCG tokens |
| Build   | `npm run build`        | Production bundle                                                                                                                                                                                                       |
| Browser | `npm run test:e2e`     | App loads, heading visible, no page errors                                                                                                                                                                              |

### Manual

1. `npm run dev`, open the URL: the shell shows "AI UI Sandbox" and a status line.
2. Toggle the OS between light and dark: the shell follows.

## Quality gates for UI work (from Phase 1)

Run at the end of every UI sub-milestone, before asking to push:

1. Look at the real app at 1440px and 390px wide.
2. Keyboard pass: every control reachable, focus always visible.
3. `principles-and-laws-audit` on the changed screens; fix critical and high findings.
4. `jury` on a running build at phase gates (it measures LCP, CLS, axe and keyboard focus).

## Phase 1 core journey (to automate in Phase 1)

1. Open the app. 2. Create a project. 3. Add a button and a card. 4. Select the button. 5. Change its label and variant. 6. Change a design token. 7. Switch to mobile. 8. Reload. 9. Reopen the project. 10. Check the changes remain. 11. Export a backup.
