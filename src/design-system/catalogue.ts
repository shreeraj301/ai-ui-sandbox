import type { Token, TokenGroup } from '../document/schema';
import { colorValueSchema, dimensionValueSchema, shadowValueSchema } from './tokenValues';

/**
 * The tokens the editor lets people change, in the order the Tokens tab shows
 * them. Each one is read by at least one component on the stage, so every
 * edit is visible. Adding, renaming and removing tokens comes in Phase 5;
 * until then the component styles depend on these exact names.
 */

export type TokenKind = 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number' | 'shadow';
export type TokenGroupId = 'Colour' | 'Type' | 'Spacing' | 'Radius' | 'Elevation';

export type TokenSpec = {
  /** Dotted DTCG path, e.g. "color.brand". */
  path: string;
  group: TokenGroupId;
  label: string;
  kind: TokenKind;
  /** Where the token shows up, read from the component styles. */
  usedBy: string;
  min?: number;
  max?: number;
  step?: number;
};

export const TOKEN_GROUPS: TokenGroupId[] = ['Colour', 'Type', 'Spacing', 'Radius', 'Elevation'];

const colour = (name: string, label: string, usedBy: string): TokenSpec => ({
  path: `color.${name}`,
  group: 'Colour',
  label,
  kind: 'color',
  usedBy,
});

const dimension = (
  path: string,
  group: TokenGroupId,
  label: string,
  usedBy: string,
  min: number,
  max: number,
): TokenSpec => ({ path, group, label, kind: 'dimension', usedBy, min, max, step: 1 });

const shadow = (name: string, label: string): TokenSpec => ({
  path: `shadow.${name}`,
  group: 'Elevation',
  label,
  kind: 'shadow',
  usedBy: `Cards with elevation set to ${label}`,
});

export const TOKEN_SPECS: readonly TokenSpec[] = [
  colour(
    'brand',
    'Brand',
    'Primary buttons, ghost button text, checked checkbox and switch, progress bar, focus rings',
  ),
  colour('brand-strong', 'Brand strong', 'Primary button on hover'),
  colour('brand-subtle', 'Brand subtle', 'Brand badge and avatar background'),
  colour('brand-subtle-text', 'Brand subtle text', 'Text on the brand badge and avatar'),
  colour('on-brand', 'On brand', 'Text and icons on primary buttons, checkmarks, switch knob'),
  colour('text', 'Text', 'Headings, body text, labels and input values'),
  colour('text-muted', 'Text muted', 'Captions, hints, placeholders and card body'),
  colour('surface', 'Surface', 'Cards, inputs and secondary buttons'),
  colour('canvas', 'Canvas', 'Page background'),
  colour('border', 'Border', 'Edges of inputs, cards, checkboxes and dividers'),
  colour('success', 'Success', 'Success badge, alert and field message'),
  colour('success-subtle', 'Success subtle', 'Success badge and alert background'),
  colour('danger', 'Danger', 'Danger badge, alert and field error'),
  colour('danger-subtle', 'Danger subtle', 'Danger badge and alert background'),
  colour('warning', 'Warning', 'Warning alert text and icon'),
  colour('warning-subtle', 'Warning subtle', 'Warning alert background'),
  colour('info', 'Info', 'Info alert text and icon'),
  colour('info-subtle', 'Info subtle', 'Info alert background'),
  colour(
    'neutral-subtle',
    'Neutral subtle',
    'Neutral badge, disabled fields, switch and progress tracks, secondary button hover',
  ),
  {
    path: 'font.family',
    group: 'Type',
    label: 'Font family',
    kind: 'fontFamily',
    usedBy: 'Every component',
  },
  dimension(
    'font.size.caption',
    'Type',
    'Caption size',
    'Badges, captions, hints, small buttons',
    10,
    64,
  ),
  dimension('font.size.body', 'Type', 'Body size', 'Body text, buttons and inputs', 10, 64),
  dimension('font.size.heading', 'Type', 'Heading size', 'Heading text', 10, 64),
  {
    path: 'font.weight.strong',
    group: 'Type',
    label: 'Strong weight',
    kind: 'fontWeight',
    usedBy: 'Buttons, labels and badges',
    min: 100,
    max: 900,
    step: 50,
  },
  {
    path: 'font.weight.heading',
    group: 'Type',
    label: 'Heading weight',
    kind: 'fontWeight',
    usedBy: 'Headings, card and alert titles, avatars',
    min: 100,
    max: 900,
    step: 50,
  },
  {
    path: 'font.line-height.body',
    group: 'Type',
    label: 'Body line height',
    kind: 'number',
    usedBy: 'Body text, card body and textareas',
    min: 1,
    max: 2.5,
    step: 0.05,
  },
  {
    path: 'font.line-height.heading',
    group: 'Type',
    label: 'Heading line height',
    kind: 'number',
    usedBy: 'Heading text',
    min: 1,
    max: 2.5,
    step: 0.05,
  },
  dimension('space.2', 'Spacing', 'Space 2', 'Gaps in buttons and labels, small dividers', 0, 96),
  dimension('space.3', 'Spacing', 'Space 3', 'Input padding, gaps in alerts and choices', 0, 96),
  dimension('space.4', 'Spacing', 'Space 4', 'Dividers, small card padding, alert padding', 0, 96),
  dimension('space.5', 'Spacing', 'Space 5', 'Button side padding', 0, 96),
  dimension('space.6', 'Spacing', 'Space 6', 'Card padding, large button padding', 0, 96),
  dimension('space.8', 'Spacing', 'Space 8', 'Large card padding, large dividers', 0, 96),
  dimension('radius.sm', 'Radius', 'Small', 'Checkboxes and the alert close button', 0, 64),
  dimension(
    'radius.md',
    'Radius',
    'Medium',
    'Buttons, inputs, alerts, images, square avatars',
    0,
    64,
  ),
  dimension('radius.lg', 'Radius', 'Large', 'Cards', 0, 64),
  dimension(
    'radius.full',
    'Radius',
    'Full',
    'Badges, switches, round avatars, progress bars',
    0,
    999,
  ),
  shadow('sm', 'Small'),
  shadow('md', 'Medium'),
  shadow('lg', 'Large'),
];

const specByPath = new Map(TOKEN_SPECS.map((spec) => [spec.path, spec]));

export function getTokenSpec(path: string): TokenSpec | undefined {
  return specByPath.get(path);
}

/** Ranges for the parts of a shadow, in px (opacity in percent). */
export const SHADOW_LIMITS = {
  offsetX: { min: -40, max: 40 },
  offsetY: { min: -40, max: 40 },
  blur: { min: 0, max: 80 },
  spread: { min: -40, max: 40 },
} as const;

/**
 * Font stacks made only of fonts already on people's devices, so the app never
 * requests a web font. Stacks adapted from modernfontstacks.com.
 */
export const FONT_STACKS: readonly { id: string; label: string; value: string[] }[] = [
  {
    id: 'system',
    label: 'System sans',
    value: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  },
  {
    id: 'humanist',
    label: 'Humanist sans',
    value: [
      'Seravek',
      'Gill Sans Nova',
      'Ubuntu',
      'Calibri',
      'DejaVu Sans',
      'source-sans-pro',
      'sans-serif',
    ],
  },
  {
    id: 'geometric',
    label: 'Geometric humanist',
    value: ['Avenir', 'Montserrat', 'Corbel', 'URW Gothic', 'source-sans-pro', 'sans-serif'],
  },
  {
    id: 'transitional',
    label: 'Transitional serif',
    value: ['Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', 'serif'],
  },
  {
    id: 'old-style',
    label: 'Old style serif',
    value: ['Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', 'P052', 'serif'],
  },
  {
    id: 'mono',
    label: 'Monospace',
    value: [
      'ui-monospace',
      'Cascadia Code',
      'Source Code Pro',
      'Menlo',
      'Consolas',
      'DejaVu Sans Mono',
      'monospace',
    ],
  },
];

export function fontStackFor(value: unknown): (typeof FONT_STACKS)[number] | undefined {
  const names = Array.isArray(value) ? value : [value];
  return FONT_STACKS.find(
    (stack) =>
      stack.value.length === names.length && stack.value.every((name, i) => name === names[i]),
  );
}

/** The token at a dotted path, or undefined if the path is missing or names a group. */
export function getToken(tokens: TokenGroup, path: string): Token | undefined {
  let node: unknown = tokens;
  for (const key of path.split('.')) {
    if (typeof node !== 'object' || node === null || !Object.hasOwn(node, key)) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return typeof node === 'object' && node !== null && '$value' in node
    ? (node as Token)
    : undefined;
}

const inRange = (value: number, min = -Infinity, max = Infinity) => value >= min && value <= max;
const rangeMessage = (min?: number, max?: number, unit = '') =>
  `Enter a value from ${min}${unit} to ${max}${unit}.`;

/**
 * Editor rules for a token change, on top of the type checks in the document
 * layer: the token must be in the catalogue and the value inside its range.
 * Returns a message people can act on, or null when the change is allowed.
 */
export function checkTokenChange(path: string, value: unknown): string | null {
  const spec = getTokenSpec(path);
  if (!spec) return `The token "${path}" can't be edited yet.`;
  switch (spec.kind) {
    case 'color':
      return colorValueSchema.safeParse(value).success
        ? null
        : 'Enter a hex colour such as #b5175a.';
    case 'dimension': {
      const parsed = dimensionValueSchema.safeParse(value);
      if (!parsed.success || parsed.data.unit !== 'px') return 'Enter a size in pixels.';
      return inRange(parsed.data.value, spec.min, spec.max)
        ? null
        : rangeMessage(spec.min, spec.max, 'px');
    }
    case 'fontWeight':
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'Enter a number.';
      return inRange(value, spec.min, spec.max) ? null : rangeMessage(spec.min, spec.max);
    case 'fontFamily':
      return fontStackFor(value) ? null : 'Pick one of the listed font stacks.';
    case 'shadow': {
      const parsed = shadowValueSchema.safeParse(value);
      if (!parsed.success) return 'Enter a complete shadow.';
      for (const [part, limits] of Object.entries(SHADOW_LIMITS)) {
        const dim = parsed.data[part as keyof typeof SHADOW_LIMITS];
        if (dim.unit !== 'px') return 'Enter shadow sizes in pixels.';
        if (!inRange(dim.value, limits.min, limits.max)) {
          return rangeMessage(limits.min, limits.max, 'px');
        }
      }
      return null;
    }
  }
}
