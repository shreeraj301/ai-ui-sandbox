import type { ComponentType } from 'react';
import type { z } from 'zod';

export type Category = 'Foundations' | 'Forms' | 'Content';

/** Interaction and feedback states a component can be previewed in. */
export const STATE_IDS = [
  'default',
  'hover',
  'focus',
  'pressed',
  'disabled',
  'loading',
  'error',
  'success',
] as const;
export type StateId = (typeof STATE_IDS)[number];

export const STATE_LABELS: Record<StateId, string> = {
  default: 'Default',
  hover: 'Hover',
  focus: 'Focus',
  pressed: 'Pressed',
  disabled: 'Disabled',
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
};

type FieldBase = { key: string; label: string; group: string; hint?: string };

/** One editable property as the inspector shows it. */
export type Field =
  | (FieldBase & { kind: 'text'; multiline?: boolean })
  | (FieldBase & { kind: 'number'; min: number; max: number; step?: number; unit?: string })
  | (FieldBase & { kind: 'choice'; options: { value: string; label: string }[] })
  | (FieldBase & { kind: 'select'; options: { value: string; label: string }[] })
  | (FieldBase & { kind: 'toggle' });

export type RenderProps = { props: Record<string, unknown>; state?: StateId };

/**
 * Everything the editor knows about a component type. The schema is the
 * single rule for what props are allowed: the inspector, imports and (later)
 * AI proposals are all checked against it.
 */
export type ComponentDefinition = {
  type: string;
  name: string;
  description: string;
  category: Category;
  schema: z.ZodType<Record<string, unknown>>;
  defaults: Record<string, unknown>;
  fields: Field[];
  /** States worth previewing for this component. Always starts with 'default'. */
  states: StateId[];
  /** Whether the component fills the page width with these props. */
  stretch?: (props: Record<string, unknown>) => boolean;
  /** Renders the component with the user's design tokens (CSS variables --u-*). */
  Render: ComponentType<RenderProps>;
};
