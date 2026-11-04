# Architecture

## Boundaries

- **Client only.** A static React app served from Vercel. No backend, no secrets.
- **Local persistence.** IndexedDB from Phase 1. Nothing leaves the browser during normal use.
- **One source of truth.** The project document. The stage, layer tree, inspector, persistence and export all read from it.
- **One way to change it.** Typed operations, applied as transactions.

## Data flow

```text
user action ──┐
              ├──> Operation[] ──> applyOperations ──> new Project ──> stage, inspector, autosave
AI proposal ──┘    (plain data)    (validate, all or nothing)
                                                       └── on failure: old Project, error message

imported file / stored record ──> parseProject ──> Project or error
```

Manual edits and future AI proposals produce the same `Operation` objects. That gives both the same validation, the same undo and the same audit trail. Phase 12 adds an AI layer that can only emit these operations.

## The document (`src/document/schema.ts`)

| Type           | Holds                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `Project`      | id, name, `schemaVersion`, timestamps, pages, active page, design systems, active design system |
| `Page`         | id, name, ordered `rootNodeIds`, `nodes` keyed by id                                            |
| `DocumentNode` | id, component `type`, name, `parentId`, ordered `childrenIds`, `props`                          |
| `DesignSystem` | id, name, `tokens` in W3C DTCG 2025.10 format                                                   |

Nodes are stored flat (keyed by id) with explicit parent and child links. This keeps lookups and moves cheap, and makes the layer tree a direct reading of the data.

Later phases add layout and style properties, component definitions, interactions and assets. Each change bumps `CURRENT_SCHEMA_VERSION` and adds a migration step.

## Operations (`src/document/operations.ts`)

| Operation         | Effect                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| `addNode`         | Insert a node under a parent (or at the root) at an index              |
| `removeNode`      | Delete a node and all its descendants                                  |
| `moveNode`        | Move or reorder; refuses to move a node inside itself                  |
| `updateNodeProps` | Merge new props into a node                                            |
| `renameNode`      | Rename; refuses empty names                                            |
| `updateToken`     | Replace an existing token's `$value`; the value must match its `$type` |

`applyOperations(project, operations)` works on a copy. After applying every operation it checks the result against the schema and the structural rules. If anything fails, the caller gets the original project back plus an error. The input is never mutated.

## Validation (`src/document/validate.ts`, `project.ts`)

- **Schema** (zod): shapes, id and name lengths, DTCG token shape.
- **Structure:** every child reference exists, each node has exactly one parent link that agrees both ways, every node is reachable from the page roots, no cycles, active ids point at real items.
- **Versioning:** `parseProject` rejects documents newer than the app and runs migrations for older ones. Version 2 (sub-milestone 3) fills in the new starter weight, line-height and shadow tokens and gives existing cards `elevation: 'none'`, keeping any values the person already has.

## Built in Phase 1

| Area               | Where                 | Notes                                                                                                                                                                                                                                                              |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component registry | `src/registry/`       | 15 components. Each has a strict zod prop schema, defaults, inspector fields and a renderer. `checkOperations` rejects unknown types, invalid props and token edits outside the catalogue before `applyOperations` runs                                            |
| Editor store       | `src/editor/store.ts` | Zustand: project, component or token selection, save status, undo and redo history, state preview                                                                                                                                                                  |
| User tokens        | `src/design-system/`  | Starter DTCG tokens, resolved to `--u-*` CSS variables on the frame. Unsafe names and values are dropped. `catalogue.ts` lists the 40 editable tokens with ranges and where each is used; `contrast.ts` checks 16 WCAG pairs; `export.ts` writes DTCG JSON and CSS |
| Persistence        | `src/persistence/`    | Dexie on IndexedDB. Stored projects are validated with `parseProject` on load. Autosave writes 400 ms after the last change and on tab hide                                                                                                                        |
| Stage              | `src/stage/`          | One desktop frame at 100%, measured selection with dimension lines, title block                                                                                                                                                                                    |

## Not built yet

| Area                                      | Phase |
| ----------------------------------------- | ----- |
| Viewports and zoom                        | 1     |
| Project list, import and export           | 1     |
| Full history (grouped drags, checkpoints) | 8     |
| AI provider layer                         | 12    |
