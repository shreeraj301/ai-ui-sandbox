import { z } from 'zod';
import { ICON_NAMES } from './icons';

const text = (min: number, max: number) =>
  z
    .string()
    .min(min, min === 1 ? 'Enter at least 1 character.' : `Use at least ${min} characters.`)
    .max(max, `Use ${max} characters or fewer.`);

const whole = (min: number, max: number) =>
  z
    .number({ error: 'Enter a number.' })
    .int('Use a whole number.')
    .min(min, `Use ${min} or more.`)
    .max(max, `Use ${max} or less.`);

const icon = z.enum(ICON_NAMES);
const iconOrNone = z.enum(['none', ...ICON_NAMES]);
const size = z.enum(['sm', 'md', 'lg']);
const variant = z.enum(['primary', 'secondary', 'ghost']);

/** Only secure web addresses, so a page never mixes in insecure content. */
const imageUrl = z
  .string()
  .max(2000, 'Use 2000 characters or fewer.')
  .refine(
    (value) => value === '' || (/^https:\/\//i.test(value) && URL.canParse(value)),
    'Use a full address starting with https://',
  );

/** One option per line: 1 to 20 options of up to 40 characters each. */
const optionLines = z
  .string()
  .max(1000, 'Use 1000 characters or fewer.')
  .refine((value) => {
    const lines = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length >= 1 && lines.length <= 20 && lines.every((line) => line.length <= 40);
  }, 'List 1 to 20 options, one per line, up to 40 characters each.');

export const textSchema = z
  .object({
    text: text(1, 500),
    variant: z.enum(['heading', 'body', 'caption']),
    align: z.enum(['start', 'center', 'end']),
  })
  .strict();

export const buttonSchema = z
  .object({
    label: text(1, 60),
    variant,
    size,
    leadingIcon: iconOrNone,
    trailingIcon: iconOrNone,
    fullWidth: z.boolean(),
    loading: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const iconButtonSchema = z
  .object({
    icon,
    label: text(1, 40),
    variant,
    size,
    disabled: z.boolean(),
  })
  .strict();

export const badgeSchema = z
  .object({
    label: text(1, 30),
    tone: z.enum(['neutral', 'brand', 'success', 'danger']),
  })
  .strict();

export const dividerSchema = z
  .object({
    label: text(0, 40),
    spacing: size,
  })
  .strict();

export const textInputSchema = z
  .object({
    label: text(1, 60),
    placeholder: text(0, 80),
    value: text(0, 200),
    helperText: text(0, 140),
    errorText: text(0, 140),
    successText: text(0, 140),
    required: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const textareaSchema = z
  .object({
    label: text(1, 60),
    placeholder: text(0, 120),
    value: text(0, 2000),
    rows: whole(2, 12),
    helperText: text(0, 140),
    errorText: text(0, 140),
    required: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const selectSchema = z
  .object({
    label: text(1, 60),
    placeholder: text(0, 60),
    options: optionLines,
    helperText: text(0, 140),
    errorText: text(0, 140),
    disabled: z.boolean(),
  })
  .strict();

export const checkboxSchema = z
  .object({
    label: text(1, 80),
    description: text(0, 160),
    checked: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const switchSchema = z
  .object({
    label: text(1, 80),
    description: text(0, 160),
    checked: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const cardSchema = z
  .object({
    title: text(1, 80),
    body: text(0, 400),
    padding: size,
  })
  .strict();

export const avatarSchema = z
  .object({
    name: text(1, 60),
    size,
    shape: z.enum(['circle', 'square']),
  })
  .strict();

export const imageSchema = z
  .object({
    src: imageUrl,
    alt: text(0, 160),
    ratio: z.enum(['16:9', '4:3', '1:1', '3:4']),
    fit: z.enum(['cover', 'contain']),
    width: whole(80, 1200),
  })
  .strict();

export const alertSchema = z
  .object({
    severity: z.enum(['info', 'success', 'warning', 'danger']),
    title: text(1, 80),
    description: text(0, 240),
    showIcon: z.boolean(),
    dismissible: z.boolean(),
  })
  .strict();

export const progressSchema = z
  .object({
    label: text(0, 60),
    value: whole(0, 100),
    showValue: z.boolean(),
  })
  .strict();

/** Split an options string into its trimmed, non-empty lines. */
export function splitOptions(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
