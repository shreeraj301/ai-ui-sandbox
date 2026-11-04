import type { TokenGroup } from '../document/schema';
import { getToken } from './catalogue';
import { colorToHex, hexToChannels } from './tokenValues';

/**
 * WCAG 2.2 contrast for the colour pairs the components actually draw.
 * Text needs 4.5:1 (success criterion 1.4.3). Edges that identify a control
 * need 3:1 against what is next to them (1.4.11).
 */

export type ContrastPair = {
  foreground: string;
  background: string;
  /** Where people see this pair. */
  label: string;
  minimum: 4.5 | 3;
};

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { foreground: 'color.text', background: 'color.canvas', label: 'Text on the page', minimum: 4.5 },
  {
    foreground: 'color.text',
    background: 'color.surface',
    label: 'Text in cards and inputs',
    minimum: 4.5,
  },
  {
    foreground: 'color.text-muted',
    background: 'color.canvas',
    label: 'Captions and hints',
    minimum: 4.5,
  },
  {
    foreground: 'color.text-muted',
    background: 'color.surface',
    label: 'Card body and placeholders',
    minimum: 4.5,
  },
  {
    foreground: 'color.on-brand',
    background: 'color.brand',
    label: 'Primary button label',
    minimum: 4.5,
  },
  {
    foreground: 'color.on-brand',
    background: 'color.brand-strong',
    label: 'Primary button label on hover',
    minimum: 4.5,
  },
  {
    foreground: 'color.brand',
    background: 'color.canvas',
    label: 'Ghost button label',
    minimum: 4.5,
  },
  {
    foreground: 'color.brand-subtle-text',
    background: 'color.brand-subtle',
    label: 'Brand badge and avatar',
    minimum: 4.5,
  },
  {
    foreground: 'color.text',
    background: 'color.neutral-subtle',
    label: 'Neutral badge',
    minimum: 4.5,
  },
  {
    foreground: 'color.success',
    background: 'color.success-subtle',
    label: 'Success badge and alert',
    minimum: 4.5,
  },
  {
    foreground: 'color.danger',
    background: 'color.danger-subtle',
    label: 'Danger badge and alert',
    minimum: 4.5,
  },
  {
    foreground: 'color.warning',
    background: 'color.warning-subtle',
    label: 'Warning alert',
    minimum: 4.5,
  },
  { foreground: 'color.info', background: 'color.info-subtle', label: 'Info alert', minimum: 4.5 },
  {
    foreground: 'color.success',
    background: 'color.canvas',
    label: 'Field success message',
    minimum: 4.5,
  },
  {
    foreground: 'color.danger',
    background: 'color.canvas',
    label: 'Field error message',
    minimum: 4.5,
  },
  {
    foreground: 'color.border',
    background: 'color.surface',
    label: 'Input and checkbox edges',
    minimum: 3,
  },
];

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToChannels(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

/** Two decimals, rounded down so a pair that fails never displays as passing. */
export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

export type ContrastResult = ContrastPair & {
  foregroundHex: string;
  backgroundHex: string;
  ratio: number;
  passes: boolean;
};

/** Check every pair. Pairs whose colours are missing or unreadable are left out. */
export function checkContrast(tokens: TokenGroup): ContrastResult[] {
  const results: ContrastResult[] = [];
  for (const pair of CONTRAST_PAIRS) {
    const foregroundHex = colorToHex(getToken(tokens, pair.foreground)?.$value);
    const backgroundHex = colorToHex(getToken(tokens, pair.background)?.$value);
    if (!foregroundHex || !backgroundHex) continue;
    const ratio = contrastRatio(foregroundHex, backgroundHex);
    results.push({ ...pair, foregroundHex, backgroundHex, ratio, passes: ratio >= pair.minimum });
  }
  return results;
}
