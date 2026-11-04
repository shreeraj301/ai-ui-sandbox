# Product brief

## Problem hypothesis (not yet validated)

Product designers and design engineers need a quick, low-friction place to explore a component's appearance, states and design tokens together. Today that exploration is split across design files, component docs, code playgrounds and browser prototypes.

This is a hypothesis. It has not been tested with real people. See [RESEARCH_PLAN.md](RESEARCH_PLAN.md).

## Audience (initial assumption)

1. Product designers exploring components and states. **First priority.**
2. Design engineers experimenting with component properties and CSS tokens. **First priority.**
3. Frontend developers who want a small visual playground. Later.

## Position

Research round 1 ([full doc](https://claude.ai/artifact/SRfJY1EHTHJW7K1CcBvk5b), 3 Nov 2026) found no tool that combines all of these:

- Opens in a browser with no account and no codebase.
- Centres on one component, its states and your tokens, not whole pages or apps.
- Uses AI that proposes changes for you to review and apply, rather than writing them directly.

Component workshops (Storybook, Ladle, Histoire) need a codebase. Token tools (Tokens Studio, tweakcn, Realtime Colors) don't show your own components' states. AI builders (v0, Figma Make, Subframe, Onlook) aim at whole apps and write changes directly.

## Core journey (Phase 1)

1. Open the app and start a new playground.
2. Add a component from the library.
3. Select it and edit content and appearance.
4. Preview its states.
5. Edit design tokens and see linked components update.
6. Switch between desktop, tablet and mobile.
7. Reload: the project is still there.
8. Export a backup.

## Non-goals

- A Figma clone or a full website builder.
- Accounts, cloud storage, sync or collaboration.
- Fixed visual theme presets (glassmorphism, neumorphism, cyberpunk).
- AI that edits a project without preview and approval.
