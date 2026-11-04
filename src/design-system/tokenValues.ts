import { z } from 'zod';

/**
 * Shapes of DTCG 2025.10 token values for the types this app edits. The
 * document layer uses these to reject a malformed value before it is stored.
 * Range limits that come from the editor (a spacing step from 0 to 96px, say)
 * live in `catalogue.ts`, not here.
 */

const unit = z.number().min(0).max(1);
const HEX6 = /^#[0-9a-f]{6}$/;

export const colorValueSchema = z
  .object({
    colorSpace: z.literal('srgb'),
    components: z.tuple([unit, unit, unit]),
    alpha: unit.optional(),
    hex: z.string().regex(HEX6).optional(),
  })
  .strict()
  .refine(
    (color) =>
      color.hex === undefined ||
      hexToChannels(color.hex).every(
        (channel, index) => Math.abs(channel - Math.round(color.components[index]! * 255)) <= 1,
      ),
    { message: 'hex does not match components' },
  );

export const dimensionValueSchema = z
  .object({ value: z.number().finite(), unit: z.enum(['px', 'rem']) })
  .strict();

export const shadowValueSchema = z
  .object({
    color: colorValueSchema,
    offsetX: dimensionValueSchema,
    offsetY: dimensionValueSchema,
    blur: dimensionValueSchema,
    spread: dimensionValueSchema,
    inset: z.boolean().optional(),
  })
  .strict();

const valueSchemas: Record<string, z.ZodType> = {
  color: colorValueSchema,
  dimension: dimensionValueSchema,
  fontFamily: z.union([z.string().min(1).max(200), z.array(z.string().min(1).max(80)).min(1)]),
  fontWeight: z.number().int().min(1).max(1000),
  number: z.number().finite(),
  shadow: shadowValueSchema,
};

/** Check a value against its token type. Returns an error message, or null when valid. */
export function checkTokenValue(type: string | undefined, value: unknown): string | null {
  const schema = type ? valueSchemas[type] : undefined;
  if (!schema) return `tokens of type "${type ?? 'none'}" cannot be edited`;
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? 'invalid value');
}

export type ColorValue = z.infer<typeof colorValueSchema>;
export type DimensionValue = z.infer<typeof dimensionValueSchema>;
export type ShadowValue = z.infer<typeof shadowValueSchema>;

/** "#B5175A" or "#b17" to three 0 to 255 channels. Assumes a valid hex. */
export function hexToChannels(hex: string): [number, number, number] {
  const digits = hex.replace('#', '');
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((d) => d + d)
          .join('')
      : digits;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Read "#b5175a", "B5175A" or "#b17". Returns a lowercase #rrggbb, or null if it is not a colour. */
export function normalizeHex(input: string): string | null {
  const digits = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(digits)) return null;
  const [r, g, b] = hexToChannels(digits);
  return channelsToHex([r, g, b]);
}

export function channelsToHex(channels: [number, number, number]): string {
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** A DTCG colour value from a hex string, with an optional alpha from 0 to 1. */
export function colorValue(hex: string, alpha?: number): ColorValue {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error(`Not a hex colour: ${hex}`);
  const channels = hexToChannels(normalized);
  return {
    colorSpace: 'srgb',
    components: channels.map((c) => Math.round((c / 255) * 1000) / 1000) as [
      number,
      number,
      number,
    ],
    ...(alpha === undefined || alpha === 1 ? {} : { alpha }),
    hex: normalized,
  };
}

/** Hex for a stored colour value: its hex if present, otherwise from its components. */
export function colorToHex(value: unknown): string | null {
  const parsed = colorValueSchema.safeParse(value);
  if (!parsed.success) return null;
  if (parsed.data.hex) return parsed.data.hex;
  return channelsToHex(
    parsed.data.components.map((c) => Math.round(c * 255)) as [number, number, number],
  );
}

export const px = (value: number): DimensionValue => ({ value, unit: 'px' });
