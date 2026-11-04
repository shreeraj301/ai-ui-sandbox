import { defaultTokens } from '../design-system/defaultTokens';
import { CURRENT_SCHEMA_VERSION, projectSchema, type Project } from './schema';
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
 * Upgrade older documents to CURRENT_SCHEMA_VERSION. Version 1 is the first,
 * so there is nothing to upgrade yet; add one step per future version here.
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
  return { ok: true, value: input };
}
