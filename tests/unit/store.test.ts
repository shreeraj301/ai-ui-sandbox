import { beforeEach, describe, expect, it } from 'vitest';
import { createProject } from '../../src/document/project';
import { activePage, useEditor } from '../../src/editor/store';

beforeEach(() => {
  useEditor.setState({ project: null, selectedId: null, save: { state: 'idle' } });
  useEditor.getState().load(createProject('Store test'));
});

describe('editor store', () => {
  it('adds a component with its defaults, selects it and bumps the revision', () => {
    const result = useEditor.getState().addComponent('button');
    const { project, selectedId } = useEditor.getState();
    expect(result).toEqual({ ok: true });
    const page = activePage(project!);
    expect(page.rootNodeIds).toHaveLength(1);
    const node = page.nodes[selectedId!]!;
    expect(node.type).toBe('button');
    expect(node.props.label).toBe('Start trial');
    expect(project!.revision).toBe(1);
  });

  it('numbers repeated components', () => {
    useEditor.getState().addComponent('badge');
    useEditor.getState().addComponent('badge');
    const page = activePage(useEditor.getState().project!);
    expect(page.rootNodeIds.map((id) => page.nodes[id]!.name)).toEqual(['Badge', 'Badge 2']);
  });

  it('updates props and refuses invalid values without touching the document', () => {
    useEditor.getState().addComponent('button');
    const id = useEditor.getState().selectedId!;
    expect(useEditor.getState().updateProps(id, { label: 'Continue' })).toEqual({ ok: true });
    const before = useEditor.getState().project;
    const refused = useEditor.getState().updateProps(id, { label: '' });
    expect(refused.ok).toBe(false);
    expect(useEditor.getState().project).toBe(before);
    expect(activePage(before!).nodes[id]!.props.label).toBe('Continue');
  });

  it('removes a component and clears the selection', () => {
    useEditor.getState().addComponent('card');
    const id = useEditor.getState().selectedId!;
    useEditor.getState().removeNode(id);
    expect(useEditor.getState().selectedId).toBeNull();
    expect(activePage(useEditor.getState().project!).rootNodeIds).toEqual([]);
  });

  it('refuses unknown component types', () => {
    expect(useEditor.getState().addComponent('carousel').ok).toBe(false);
  });
});

describe('undo and redo', () => {
  it('undoes and redoes whole transactions', () => {
    const { addComponent } = useEditor.getState();
    addComponent('button');
    addComponent('badge');
    expect(activePage(useEditor.getState().project!).rootNodeIds).toHaveLength(2);
    useEditor.getState().undo();
    expect(activePage(useEditor.getState().project!).rootNodeIds).toHaveLength(1);
    useEditor.getState().redo();
    expect(activePage(useEditor.getState().project!).rootNodeIds).toHaveLength(2);
  });

  it('groups quick edits to the same field into one undo step', () => {
    useEditor.getState().addComponent('button');
    const id = useEditor.getState().selectedId!;
    for (const label of ['C', 'Co', 'Con', 'Cont']) {
      useEditor.getState().updateProps(id, { label });
    }
    useEditor.getState().undo();
    expect(activePage(useEditor.getState().project!).nodes[id]!.props.label).toBe('Start trial');
  });

  it('a new change clears redo, and undo never loses the revision count', () => {
    useEditor.getState().addComponent('button');
    const afterAdd = useEditor.getState().project!.revision;
    useEditor.getState().undo();
    expect(useEditor.getState().project!.revision).toBe(afterAdd + 1);
    useEditor.getState().addComponent('card');
    expect(useEditor.getState().future).toEqual([]);
  });

  it('drops the selection when undo removes the selected component', () => {
    useEditor.getState().addComponent('card');
    useEditor.getState().undo();
    expect(useEditor.getState().selectedId).toBeNull();
  });
});

describe('state preview', () => {
  it('holds a state for the selected component and clears on selection change', () => {
    useEditor.getState().addComponent('button');
    const id = useEditor.getState().selectedId!;
    useEditor.getState().setPreview({ nodeId: id, state: 'hover' });
    useEditor.getState().select(id);
    expect(useEditor.getState().preview).toEqual({ nodeId: id, state: 'hover' });
    useEditor.getState().select(null);
    expect(useEditor.getState().preview).toBeNull();
  });

  it('is never part of the project or its history', () => {
    useEditor.getState().addComponent('button');
    const id = useEditor.getState().selectedId!;
    const before = useEditor.getState().project;
    useEditor.getState().setPreview({ nodeId: id, state: 'pressed' });
    expect(useEditor.getState().project).toBe(before);
    expect(useEditor.getState().past).toHaveLength(1);
  });
});
