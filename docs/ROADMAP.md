# Roadmap

Each phase ends at an acceptance gate. The next phase starts only after the gate passes and the owner says to continue. Full detail is in the PRD documents, which are kept private and out of the repo.

| Phase | Goal                                           | Status      |
| ----- | ---------------------------------------------- | ----------- |
| 0     | Foundation: stack, docs, document model, shell | Done        |
| 1     | Component playground: first usable release     | Not started |
| 2     | Composition and layout                         | Not started |
| 3     | Reusable components and variants               | Not started |
| 4     | Interactions and runtime state                 | Not started |
| 5     | Advanced design tokens                         | Not started |
| 6     | Advanced responsive design                     | Not started |
| 7     | Advanced canvas and workspace                  | Not started |
| 8     | History and editing quality                    | Not started |
| 9     | Code and asset export                          | Not started |
| 10    | Component library expansion                    | Not started |
| 11    | Public release hardening                       | Not started |
| 12    | AI intelligence layer (12.1 to 12.8)           | Not started |

## Phase 0 gate

The app starts locally, passes typecheck and lint, the unit tests pass, and the production build succeeds. No product features.

## Phase 1 sub-milestones

Each ends with a screenshot or preview for the owner, and the principles-and-laws audit for UI work.

1. **Thin slice:** create project, add a component, select it, edit a property, stage updates, save locally, reload and restore. First 5 components.
2. **All 15 components and their states.**
3. **Token editor:** colour, type, spacing, radius, elevation; contrast shown; DTCG JSON and CSS variable export.
4. **Viewports:** desktop, tablet, mobile with real reflow.
5. **Projects:** list, rename, delete, import and export backups, honest save status.
6. **Finish:** PNG export if reliable, optional first-use guide, full end-to-end journey test.

**Phase 1 gate:** a new user can create a project, add and edit at least 12 components, preview states, edit tokens, switch viewports, reload without losing work, and export a backup.

## Parallel work

- Visual identity directions: decide before Phase 1 sub-milestone 1 builds the editor chrome.
- Interviews: any time; findings may change Phase 1 scope.

## Open decisions

- Whether a thin AI slice (12.2 critique or 12.4 tokens) ships right after Phase 1 instead of after Phase 11.
- Which AI provider path comes first.
