import { create } from 'zustand';
import { applyOperations, type Operation } from '../document/operations';
import { createId } from '../document/project';
import type { Page, Project } from '../document/schema';
import { checkOperations, getDefinition } from '../registry/registry';
import type { StateId } from '../registry/types';

export type SaveStatus =
  | { state: 'idle' }
  | { state: 'saving' }
  | { state: 'saved' }
  | { state: 'error'; message: string }
  | { state: 'unavailable'; message: string };

export type ChangeResult = { ok: true } | { ok: false; error: string; key?: string };

const HISTORY_LIMIT = 100;
/** Edits to the same field within this window undo as one step (typing a label). */
const COALESCE_MS = 1500;

type EditorState = {
  project: Project | null;
  selectedId: string | null;
  save: SaveStatus;
  /** Earlier versions of the project, newest last. */
  past: Project[];
  /** Versions undone, available to redo, newest last. */
  future: Project[];
  lastChange: { key: string; at: number } | null;
  /** A state forced on one component for preview. Editor-only: never saved or undone. */
  preview: { nodeId: string; state: StateId } | null;
  setPreview: (preview: { nodeId: string; state: StateId } | null) => void;
  /** Replace the open project (after loading). Clears the selection and history. */
  load: (project: Project) => void;
  /**
   * Apply operations as one transaction. Registry rules first, then document
   * rules. Changes sharing a coalesceKey in quick succession undo together.
   */
  apply: (operations: Operation[], coalesceKey?: string) => ChangeResult;
  undo: () => void;
  redo: () => void;
  select: (nodeId: string | null) => void;
  setSave: (status: SaveStatus) => void;
  addComponent: (type: string) => ChangeResult;
  updateProps: (nodeId: string, props: Record<string, unknown>) => ChangeResult;
  removeNode: (nodeId: string) => ChangeResult;
};

function stamp(): string {
  return new Date().toISOString();
}

function keepSelection(project: Project, selectedId: string | null): string | null {
  return selectedId && activePage(project).nodes[selectedId] ? selectedId : null;
}

export function activePage(project: Project): Page {
  const page = project.pages.find((candidate) => candidate.id === project.activePageId);
  if (!page) throw new Error('Active page missing');
  return page;
}

export const useEditor = create<EditorState>()((set, get) => ({
  project: null,
  selectedId: null,
  save: { state: 'idle' },
  past: [],
  future: [],
  lastChange: null,
  preview: null,

  load: (project) =>
    set({ project, selectedId: null, past: [], future: [], lastChange: null, preview: null }),

  setPreview: (preview) => set({ preview }),

  apply: (operations, coalesceKey) => {
    const { project, past, lastChange } = get();
    if (!project) return { ok: false, error: 'No project is open' };
    const registryCheck = checkOperations(project, operations);
    if (!registryCheck.ok) return registryCheck;
    const result = applyOperations(project, operations);
    if (!result.ok) return { ok: false, error: result.error };
    const now = Date.now();
    const coalesce =
      coalesceKey !== undefined &&
      lastChange?.key === coalesceKey &&
      now - lastChange.at < COALESCE_MS &&
      past.length > 0;
    set({
      project: { ...result.project, revision: project.revision + 1, updatedAt: stamp() },
      past: coalesce ? past : [...past, project].slice(-HISTORY_LIMIT),
      future: [],
      lastChange: coalesceKey ? { key: coalesceKey, at: now } : null,
    });
    return { ok: true };
  },

  undo: () => {
    const { project, past, future, selectedId } = get();
    const previous = past.at(-1);
    if (!project || !previous) return;
    const restored = { ...previous, revision: project.revision + 1, updatedAt: stamp() };
    set({
      project: restored,
      past: past.slice(0, -1),
      future: [...future, project],
      lastChange: null,
      selectedId: keepSelection(restored, selectedId),
      preview: keepSelection(restored, selectedId) ? get().preview : null,
    });
  },

  redo: () => {
    const { project, past, future, selectedId } = get();
    const next = future.at(-1);
    if (!project || !next) return;
    const restored = { ...next, revision: project.revision + 1, updatedAt: stamp() };
    set({
      project: restored,
      past: [...past, project],
      future: future.slice(0, -1),
      lastChange: null,
      selectedId: keepSelection(restored, selectedId),
      preview: keepSelection(restored, selectedId) ? get().preview : null,
    });
  },

  select: (nodeId) =>
    set((state) => ({
      selectedId: nodeId,
      preview: state.preview && state.preview.nodeId === nodeId ? state.preview : null,
    })),

  setSave: (save) => set({ save }),

  addComponent: (type) => {
    const { project, apply } = get();
    const definition = getDefinition(type);
    if (!project || !definition) return { ok: false, error: `Unknown component type "${type}"` };
    const page = activePage(project);
    const count = Object.values(page.nodes).filter((node) => node.type === type).length;
    const id = createId();
    const result = apply([
      {
        type: 'addNode',
        pageId: page.id,
        parentId: null,
        node: {
          id,
          type,
          name: count === 0 ? definition.name : `${definition.name} ${count + 1}`,
          props: structuredClone(definition.defaults),
        },
      },
    ]);
    if (result.ok) set({ selectedId: id, preview: null });
    return result;
  },

  updateProps: (nodeId, props) => {
    const { project, apply } = get();
    if (!project) return { ok: false, error: 'No project is open' };
    return apply(
      [{ type: 'updateNodeProps', pageId: project.activePageId, nodeId, props }],
      `props:${nodeId}:${Object.keys(props).sort().join(',')}`,
    );
  },

  removeNode: (nodeId) => {
    const { project, apply, selectedId } = get();
    if (!project) return { ok: false, error: 'No project is open' };
    const result = apply([{ type: 'removeNode', pageId: project.activePageId, nodeId }]);
    if (result.ok && selectedId === nodeId) set({ selectedId: null, preview: null });
    return result;
  },
}));
