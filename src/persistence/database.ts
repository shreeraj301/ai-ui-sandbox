import Dexie, { type Table } from 'dexie';
import { createProject, parseProject } from '../document/project';
import type { Project } from '../document/schema';

type StoredProject = { id: string; name: string; updatedAt: string; data: unknown };
type MetaRecord = { key: string; value: string };

class SandboxDatabase extends Dexie {
  projects!: Table<StoredProject, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('ai-ui-sandbox');
    this.version(1).stores({ projects: 'id, updatedAt', meta: 'key' });
  }
}

export const db = new SandboxDatabase();

const LAST_OPENED = 'lastOpenedProjectId';

export async function saveProject(project: Project): Promise<void> {
  await db.transaction('rw', db.projects, db.meta, async () => {
    await db.projects.put({
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt,
      data: project,
    });
    await db.meta.put({ key: LAST_OPENED, value: project.id });
  });
}

/** Stored data is validated like an import: a corrupt record is reported, not rendered. */
export async function loadProject(
  id: string,
): Promise<{ ok: true; project: Project } | { ok: false; error: string }> {
  const record = await db.projects.get(id);
  if (!record) return { ok: false, error: 'Project not found' };
  return parseProject(record.data);
}

export type OpenResult = { project: Project; note?: string };

/** Open the last project, or start a new one when there is none or it is unreadable. */
export async function openLastOrCreate(): Promise<OpenResult> {
  const last = await db.meta.get(LAST_OPENED);
  if (last) {
    const loaded = await loadProject(last.value);
    if (loaded.ok) return { project: loaded.project };
    const fresh = createProject();
    await saveProject(fresh);
    return {
      project: fresh,
      note: `Your last project could not be opened (${loaded.error}). It is still stored in this browser. A new playground was started.`,
    };
  }
  const fresh = createProject();
  await saveProject(fresh);
  return { project: fresh };
}

/** A short, honest reason for a failed save. */
export function describeSaveError(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  const inner = (error as { inner?: { name?: string } } | null)?.inner?.name ?? '';
  if (name === 'QuotaExceededError' || inner === 'QuotaExceededError') {
    return 'Browser storage is full';
  }
  return 'Browser storage is not available';
}
