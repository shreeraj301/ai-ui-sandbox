import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProject } from '../../src/document/project';
import { useEditor } from '../../src/editor/store';
import { startAutosave } from '../../src/persistence/autosave';
import { db, loadProject, openLastOrCreate, saveProject } from '../../src/persistence/database';

beforeEach(async () => {
  await db.projects.clear();
  await db.meta.clear();
});

describe('local database', () => {
  it('saves a project and reopens it as the last project', async () => {
    const project = createProject('Saved one');
    await saveProject(project);
    const opened = await openLastOrCreate();
    expect(opened.project).toEqual(project);
    expect(opened.note).toBeUndefined();
  });

  it('creates and stores a new project on first visit', async () => {
    const opened = await openLastOrCreate();
    expect((await loadProject(opened.project.id)).ok).toBe(true);
  });

  it('reports a corrupt stored project instead of rendering it', async () => {
    const project = createProject('Broken');
    await saveProject(project);
    await db.projects.update(project.id, { data: { ...project, pages: 'nope' } });
    const opened = await openLastOrCreate();
    expect(opened.project.id).not.toBe(project.id);
    expect(opened.note).toContain('could not be opened');
  });
});

describe('autosave', () => {
  let stop: () => void;
  afterEach(() => {
    stop?.();
    vi.useRealTimers();
  });

  it('shows Saving, then Saved only after the write succeeds', async () => {
    vi.useFakeTimers();
    const writes: string[] = [];
    let release!: () => void;
    const save = vi.fn(async () => {
      writes.push('start');
      await new Promise<void>((resolve) => (release = resolve));
    });
    useEditor.getState().load(createProject());
    useEditor.getState().setSave({ state: 'saved' });
    stop = startAutosave(save, 400);

    useEditor.getState().addComponent('button');
    expect(useEditor.getState().save).toEqual({ state: 'saving' });
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(1);
    expect(useEditor.getState().save).toEqual({ state: 'saving' });
    release();
    await vi.runAllTimersAsync();
    expect(useEditor.getState().save).toEqual({ state: 'saved' });
  });

  it('debounces quick edits into one write', async () => {
    vi.useFakeTimers();
    const save = vi.fn(async () => {});
    useEditor.getState().load(createProject());
    stop = startAutosave(save, 400);
    useEditor.getState().addComponent('button');
    const id = useEditor.getState().selectedId!;
    useEditor.getState().updateProps(id, { label: 'A' });
    useEditor.getState().updateProps(id, { label: 'AB' });
    await vi.advanceTimersByTimeAsync(400);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('reports a failed write', async () => {
    vi.useFakeTimers();
    const quota = new Error('full');
    quota.name = 'QuotaExceededError';
    useEditor.getState().load(createProject());
    stop = startAutosave(async () => Promise.reject(quota), 400);
    useEditor.getState().addComponent('badge');
    await vi.advanceTimersByTimeAsync(400);
    expect(useEditor.getState().save).toEqual({
      state: 'error',
      message: 'Browser storage is full',
    });
  });
});
