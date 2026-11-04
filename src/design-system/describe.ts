import { fontStackFor, type TokenSpec } from './catalogue';
import { tokenToCss } from './resolve';
import { colorToHex, shadowValueSchema } from './tokenValues';
import type { Token } from '../document/schema';

/** A short, readable form of a token value for lists and hints. */
export function describeValue(spec: TokenSpec, token: Token): string {
  const value = token.$value;
  switch (spec.kind) {
    case 'color':
      return colorToHex(value) ?? 'unreadable';
    case 'fontFamily':
      return fontStackFor(value)?.label ?? 'Custom stack';
    case 'shadow': {
      const parsed = shadowValueSchema.safeParse(value);
      if (!parsed.success) return 'unreadable';
      const s = parsed.data;
      return `${s.offsetY.value}px down, ${s.blur.value}px blur`;
    }
    default:
      return tokenToCss(token) ?? 'unreadable';
  }
}
