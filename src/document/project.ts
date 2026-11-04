import { defaultTokens } from '../design-system/defaultTokens';
import { CURRENT_SCHEMA_VERSION, projectSchema, type Project, type TokenGroup } from './schema';
import { findStructuralProblems } from './validate';

export function createId(): string {
  return crypto.randomUUID();
}

/** A new project with one empty page and the starter design system. */
export function createProject(name = 'Untitled playground', now = new Date()): Project {
  const pageId = createId();
  const designSystemId = createId();
  const timestamp = now.toISOString();
  return {
    id: createId(),
    name,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 0,
    pages: [{ id: pageId, name: 'Page 1', rootNodeIds: [], nodes: {} }],
    activePageId: pageId,
    designSystems: [
      { id: designSystemId, name: 'Starter system', tokens: structuredClone(defaultTokens) },
    ],
    activeDesignSystemId: designSystemId,
  };
}

export type ParseResult = { ok: true; project: Project } | { ok: false; error: string };

/**
 * Turn untrusted data (an imported file, a stored record) into a valid
 * project, or explain why it is not one. Runs migrations first, then the
 * schema, then the structural checks.
 */
export function parseProject(input: unknown): ParseResult {
  const migrated = migrate(input);
  if (!migrated.ok) return migrated;

  const parsed = projectSchema.safeParse(migrated.value);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join('.') || 'project';
    return { ok: false, error: `${where}: ${first?.message ?? 'invalid'}` };
  }

  const problems = findStructuralProblems(parsed.data);
  if (problems.length > 0) return { ok: false, error: problems.join('; ') };
  return { ok: true, project: parsed.data };
}

/**
 * Upgrade older documents to CURRENT_SCHEMA_VERSION, one version at a time.
 * Each step works on untrusted data, so it checks shapes before touching them;
 * the schema and structure checks run afterwards on the result.
 */
function migrate(input: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'project: expected an object' };
  }
  const version = (input as { schemaVersion?: unknown }).schemaVersion;
  if (typeof version !== 'number') return { ok: false, error: 'schemaVersion: missing' };
  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `schemaVersion ${version} is newer than this app supports (${CURRENT_SCHEMA_VERSION})`,
    };
  }
  let value = input as Record<string, unknown>;
  if (version < 2) value = upgradeToV2(value);
  return { ok: true, value };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Version 2 adds the starter weight, line-height and shadow tokens, and the
 * card's elevation prop. Missing starter tokens are filled in; values the
 * person already has are kept.
 */
function upgradeToV2(input: Record<string, unknown>): Record<string, unknown> {
  const value = structuredClone(input);
  if (Array.isArray(value.designSystems)) {
    for (const system of value.designSystems) {
      if (isRecord(system) && isRecord(system.tokens)) fillMissing(system.tokens, defaultTokens);
    }
  }
  if (Array.isArray(value.pages)) {
    for (const page of value.pages) {
      if (!isRecord(page) || !isRecord(page.nodes)) continue;
      for (const node of Object.values(page.nodes)) {
        if (isRecord(node) && node.type === 'card' && isRecord(node.props)) {
          node.props.elevation ??= 'none';
        }
      }
    }
  }
  value.schemaVersion = 2;
  return value;
}

function fillMissing(target: Record<string, unknown>, defaults: TokenGroup) {
  for (const [key, fallback] of Object.entries(defaults)) {
    const current = target[key];
    if (current === undefined) {
      target[key] = structuredClone(fallback);
    } else if (isRecord(current) && !('$value' in current) && !('$value' in fallback)) {
      fillMissing(current, fallback as TokenGroup);
    }
  }
}
