# Research plan

Planned research and completed research are kept apart. Nothing under "Planned" has happened yet.

## Completed

| Date       | Activity                                                                           | Output                                                                |
| ---------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 2026-11-03 | Desk research: competitive landscape and AI interaction patterns (no participants) | [Research round 1](https://claude.ai/artifact/SRfJY1EHTHJW7K1CcBvk5b) |

No interviews or usability tests have been run yet.

## Planned

### Assumptions to test

1. Designers and design engineers explore component states often enough to want a dedicated tool.
2. Switching between design files, docs and code playgrounds is a real interruption, not a minor one.
3. People understand that projects live only in their browser, and know to export backups.
4. The token model (edit a token, linked components update) is understandable without explanation.
5. Designers would trust an AI proposal more if they review it before it applies.

### Screener

- Role: product designer, design engineer or frontend developer.
- Has worked on or with a component library or design system in the last 6 months.
- Uses at least one of: Figma, Storybook, a code playground, browser dev tools.

### Interview guide (20 to 30 minutes)

1. Tell me about the last time you designed or changed a component. What did you open first?
2. How do you check a component's states, such as hover, focus, disabled and error?
3. Where do design tokens live in your work today? Who changes them, and how?
4. What breaks or slows you down when moving between design and code?
5. Have you used AI tools for UI work? What did you trust, and what did you check?
6. If a tool proposed a change to your tokens, what would you need to see before accepting it?

### Usability tasks (Phase 1 build)

1. Add a button to a new project and change its label, size and variant.
2. Change a colour token and say which components changed.
3. Preview the button's disabled and hover states.
4. Switch to mobile and explain what changed.
5. Reload the page and reopen the project.
6. Export the project and say where the file is.

### Observation fields

Task, completed (yes, with help, no), time, errors or wrong selections, hesitations, quotes said aloud, expectations not met.

### After each task

- What did you expect to happen?
- What was confusing, if anything?
- Where do you think your project is saved?

### Synthesis template

| Finding | Evidence (participant, task) | How many of N | Severity | Product change |
| ------- | ---------------------------- | ------------- | -------- | -------------- |

Record the sample size and conditions. A handful of sessions shows patterns, not statistics.
