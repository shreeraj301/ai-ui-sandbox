import type { ComponentType } from 'react';
import type { z } from 'zod';

export type Category = 'Foundations' | 'Forms' | 'Content';

/** One editable property as the inspector shows it. */
export type Field =
  | { key: string; label: string; group: string; kind: 'text'; multiline?: boolean }
  | {
      key: string;
      label: string;
      group: string;
      kind: 'choice';
      options: { value: string; label: string }[];
    }
  | { key: string; label: string; group: string; kind: 'toggle' };

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
  /** Renders the component with the user's design tokens (CSS variables --u-*). */
  Render: ComponentType<{ props: Record<string, unknown> }>;
};
