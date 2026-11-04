# Editor design: Drawing Set

Chosen by the owner on 2026-11-04: Direction A, dark first. The three options and the reasoning are on the [decision page](https://claude.ai/artifact/3pPzhcBeMotH5ndW9pecaF).

The editor reads like a construction drawing set. Every drawing device must carry real information. If one stops doing that, remove it.

Tokens live in `src/styles/editor-tokens.css`. Components use tokens only, never raw colours.

## Scope

These rules style the editor chrome: toolbar, panels, inspector, selection overlays, dialogs. They never style the user's components on the stage. A user's design system must render exactly as the user defined it.

## Themes

| Token         | Blueprint (default) | Bond paper (light) | Use                                      |
| ------------- | ------------------- | ------------------ | ---------------------------------------- |
| `--ed-stage`  | `#0E2747`           | `#EDEFEC`          | Stage background behind frames           |
| `--ed-panel`  | `#11305A`           | `#F7F8F5`          | Toolbar, library, inspector              |
| `--ed-raised` | `#173A68`           | `#E7EAE5`          | Hover, active segment, selected row      |
| `--ed-field`  | `#0E2747`           | `#FFFFFF`          | Inputs                                   |
| `--ed-line`   | `#2E5486`           | `#C9CEC8`          | Panel edges, field borders               |
| `--ed-grid`   | `#1A3B66`           | `#DCE0DA`          | Stage drafting grid                      |
| `--ed-ink`    | `#E9F0FA`           | `#1B2024`          | Text                                     |
| `--ed-muted`  | `#A9BCD6`           | `#5B636A`          | Secondary text                           |
| `--ed-action` | `#E9F0FA`           | `#1B2024`          | The one primary button                   |
| `--ed-markup` | `#F2C14E`           | `#1F4E9C`          | Selection, dimensions, active tab, focus |
| `--ed-ok`     | `#7FD1A0`           | `#2F7D4F`          | Saved indicator                          |

Measured contrast (WCAG): ink on panel 11.5:1 (dark) and 15.4:1 (light); muted on panel 6.8:1 and 5.7:1; markup on panel 7.8:1 and 7.5:1.

## Type

- One family: Archivo, self-hosted from `@fontsource-variable/archivo`. No requests to font servers.
- The width axis carries hierarchy: 112% for section labels, 118% for titles, 100% for values and controls.
- Sizes: 11px labels, 13px body and controls, 20px inspector title. Numbers use tabular figures.
- Section labels are capitals with 0.07em tracking, in the drafting convention. Values, inputs and messages stay in sentence case.

## Drawing devices (each must show real data)

| Device                                  | Shows                                                | Rule                                                          |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Dimension lines on selection            | The selected element's rendered width and height     | Values come from the DOM measurement, rounded to whole pixels |
| Title block (bottom right of the stage) | Project, page, zoom, viewport, revision, save status | Replaces a status bar. Revision is the saved change count     |
| Drafting grid on the stage              | Scale reference, 40px steps at 100% zoom             | Scales with zoom. Never drawn inside the user's frames        |
| Single markup colour                    | What is selected or focused                          | Nothing else in the chrome uses it                            |

## Must

- Use `--ed-markup` only for selection, dimensions, the active tab and focus.
- Keep one primary button per view, in `--ed-action`.
- Keep radius at 2px for chrome controls.
- Separate panels with `--ed-line` or a tone step, never with shadows. Only floating menus and dialogs get a shadow.

## Never

- A second accent colour in the chrome.
- Gradients, glows or glass effects.
- Drafting devices with invented values (fake dimensions, decorative title block fields).
- Chrome tokens leaking into the user's components on the stage.

## Open item

Dark first was chosen with a known risk: a saturated blueprint ground may tire the eyes over long sessions. Test it in a real session of about 2 hours during Phase 1. If it does, darken and desaturate `--ed-stage` and `--ed-panel` before considering a different ground.
