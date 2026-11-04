import { z } from 'zod';

/**
 * The project document: the single source of truth for the stage, layers,
 * inspector, persistence and export. Every change goes through `operations.ts`.
 *
 * Bump CURRENT_SCHEMA_VERSION when the shape changes, and add a migration in
 * `project.ts` that upgrades the previous version.
 */
export const CURRENT_SCHEMA_VERSION = 1;

const id = z.string().min(1).max(64);
const name = z.string().min(1).max(120);
const isoDate = z.iso.datetime();

/**
 * A design token in the W3C DTCG 2025.10 format: `$value` plus an optional
 * `$type` and `$description`. Values stay `unknown` here; Phase 1 adds typed
 * validation per token type when the token editor exists.
 */
export const tokenSchema = z.object({
  $value: z.unknown(),
  $type: z.string().optional(),
  $description: z.string().optional(),
});

export type Token = z.infer<typeof tokenSchema>;

/** A token group: nested names mapping to tokens or further groups. */
export type TokenGroup = { [key: string]: Token | TokenGroup };

export const tokenGroupSchema: z.ZodType<TokenGroup> = z.lazy(() =>
  z.record(z.string(), z.union([tokenSchema, tokenGroupSchema])),
);

export const designSystemSchema = z.object({
  id,
  name,
  tokens: tokenGroupSchema,
});

export const nodeSchema = z.object({
  id,
  /** Component type key. Phase 1 checks it against the component registry. */
  type: z.string().min(1).max(64),
  name,
  parentId: id.nullable(),
  childrenIds: z.array(id),
  props: z.record(z.string(), z.unknown()),
});

export const pageSchema = z.object({
  id,
  name,
  rootNodeIds: z.array(id),
  nodes: z.record(id, nodeSchema),
});

export const projectSchema = z.object({
  id,
  name,
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  createdAt: isoDate,
  updatedAt: isoDate,
  pages: z.array(pageSchema).min(1),
  activePageId: id,
  designSystems: z.array(designSystemSchema).min(1),
  activeDesignSystemId: id,
});

export type DesignSystem = z.infer<typeof designSystemSchema>;
export type DocumentNode = z.infer<typeof nodeSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Project = z.infer<typeof projectSchema>;
