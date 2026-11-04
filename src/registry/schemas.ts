import { z } from 'zod';

const text = (min: number, max: number) =>
  z
    .string()
    .min(min, min === 1 ? 'Enter at least 1 character.' : `Use at least ${min} characters.`)
    .max(max, `Use ${max} characters or fewer.`);

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
    variant: z.enum(['primary', 'secondary', 'ghost']),
    size: z.enum(['sm', 'md', 'lg']),
    fullWidth: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const badgeSchema = z
  .object({
    label: text(1, 30),
    tone: z.enum(['neutral', 'brand', 'success', 'danger']),
  })
  .strict();

export const textInputSchema = z
  .object({
    label: text(1, 60),
    placeholder: text(0, 80),
    value: text(0, 200),
    helperText: text(0, 140),
    errorText: text(0, 140),
    required: z.boolean(),
    disabled: z.boolean(),
  })
  .strict();

export const cardSchema = z
  .object({
    title: text(1, 80),
    body: text(0, 400),
    padding: z.enum(['sm', 'md', 'lg']),
  })
  .strict();
