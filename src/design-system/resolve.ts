import type { Token, TokenGroup } from '../document/schema';

const HEX = /^#[0-9a-f]{3,8}$/i;

function isToken(value: unknown): value is Token {
  return typeof value === 'object' && value !== null && '$value' in value;
}

function colorToCss(value: unknown): string | null {
  if (typeof value === 'string') return HEX.test(value) ? value : null;
  if (typeof value === 'object' && value !== null) {
    const color = value as { hex?: unknown; components?: unknown; alpha?: unknown };
    const alpha = typeof color.alpha === 'number' ? Math.min(1, Math.max(0, color.alpha)) : 1;
    if (alpha === 1 && typeof color.hex === 'string' && HEX.test(color.hex)) return color.hex;
    if (Array.isArray(color.components) && color.components.length === 3) {
      const channels = color.components.map((c) => Math.round(Number(c) * 255));
      if (!channels.every((c) => Number.isFinite(c) && c >= 0 && c <= 255)) return null;
      const [r, g, b] = channels;
      return `rgb(${r} ${g} ${b} / ${alpha})`;
    }
  }
  return null;
}

function dimensionToCss(value: unknown): string | null {
  if (typeof value === 'object' && value !== null) {
    const dim = value as { value?: unknown; unit?: unknown };
    if (Number.isFinite(dim.value) && (dim.unit === 'px' || dim.unit === 'rem')) {
      return `${dim.value}${dim.unit}`;
    }
  }
  return null;
}

function shadowToCss(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return null;
  const shadow = value as Record<string, unknown>;
  const parts = [
    dimensionToCss(shadow.offsetX),
    dimensionToCss(shadow.offsetY),
    dimensionToCss(shadow.blur),
    dimensionToCss(shadow.spread),
    colorToCss(shadow.color),
  ];
  if (parts.some((part) => part === null)) return null;
  return `${shadow.inset === true ? 'inset ' : ''}${parts.join(' ')}`;
}

/** Turn one DTCG token value into a CSS value, or null if this app can't use it yet. */
export function tokenToCss(token: Token): string | null {
  const value = token.$value as unknown;
  switch (token.$type) {
    case 'color':
      return colorToCss(value);
    case 'dimension':
      return dimensionToCss(value);
    case 'shadow':
      return shadowToCss(value);
    case 'fontFamily': {
      const names = Array.isArray(value) ? value : [value];
      if (!names.every((n) => typeof n === 'string')) return null;
      return names
        .map((n) => (/^[\w-]+$/.test(n as string) ? n : `"${String(n).replace(/["\\;{}]/g, '')}"`))
        .join(', ');
    }
    case 'number':
    case 'fontWeight':
      return typeof value === 'number' && Number.isFinite(value) ? String(value) : null;
    default:
      return null;
  }
}

/**
 * Flatten a token tree into CSS custom properties on the user's frame:
 * color.brand becomes --u-color-brand. Exports pass the prefix "--" for clean
 * names. Only names made of letters, digits and hyphens are emitted, so
 * imported token names cannot inject CSS.
 */
export function tokensToCssVariables(tokens: TokenGroup, prefix = '--u-'): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (group: TokenGroup, path: string[]) => {
    for (const [key, child] of Object.entries(group)) {
      if (key.startsWith('$')) continue;
      const next = [...path, key];
      if (isToken(child)) {
        const css = tokenToCss(child);
        const name = `${prefix}${next.join('-')}`;
        if (css !== null && /^--[a-zA-Z0-9-]+$/.test(name)) out[name] = css;
      } else {
        walk(child, next);
      }
    }
  };
  walk(tokens, []);
  return out;
}
