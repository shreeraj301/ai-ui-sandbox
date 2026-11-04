import { describe, expect, it } from 'vitest';
import { applyOperations, type Operation } from '../../src/document/operations';
import { createProject } from '../../src/document/project';
import type { Project } from '../../src/document/schema';

const fixedDate = new Date('2026-11-04T00:00:00.000Z');

function setup() {
  const project = createProject('Test', fixedDate);
  const pageId = project.activePageId;
  return { project, pageId };
}

function apply(project: Project, operations: Operation[]): Project {
  const result = applyOperations(project, operations);
  if (!result.ok) throw new Error(result.error);
  return result.project;
}

const node = (id: string, type = 'button') => ({ id, type, name: id, props: {} });

describe('applyOperations', () => {
  it('adds root nodes in order and at a given index', () => {
    const { project, pageId } = setup();
    const next = apply(project, [
      { type: 'addNode', pageId, node: node('a'), parentId: null },
      { type: 'addNode', pageId, node: node('b'), parentId: null },
      { type: 'addNode', pageId, node: node('c'), parentId: null, index: 1 },
    ]);
    expect(next.pages[0]?.rootNodeIds).toEqual(['a', 'c', 'b']);
    expect(next.pages[0]?.nodes.c?.parentId).toBeNull();
  });

  it('adds a child to a parent and records both sides of the link', () => {
    const { project, pageId } = setup();
    const next = apply(project, [
      { type: 'addNode', pageId, node: node('card', 'card'), parentId: null },
      { type: 'addNode', pageId, node: node('btn'), parentId: 'card' },
    ]);
    const page = next.pages[0];
    expect(page?.nodes.card?.childrenIds).toEqual(['btn']);
    expect(page?.nodes.btn?.parentId).toBe('card');
    expect(page?.rootNodeIds).toEqual(['card']);
  });

  it('removes a node together with all its descendants', () => {
    const { project, pageId } = setup();
    const next = apply(project, [
      { type: 'addNode', pageId, node: node('card', 'card'), parentId: null },
      { type: 'addNode', pageId, node: node('inner', 'card'), parentId: 'card' },
      { type: 'addNode', pageId, node: node('btn'), parentId: 'inner' },
      { type: 'addNode', pageId, node: node('other'), parentId: null },
      { type: 'removeNode', pageId, nodeId: 'card' },
    ]);
    expect(Object.keys(next.pages[0]?.nodes ?? {})).toEqual(['other']);
    expect(next.pages[0]?.rootNodeIds).toEqual(['other']);
  });

  it('reorders siblings and moves nodes between parents', () => {
    const { project, pageId } = setup();
    const next = apply(project, [
      { type: 'addNode', pageId, node: node('a'), parentId: null },
      { type: 'addNode', pageId, node: node('b'), parentId: null },
      { type: 'addNode', pageId, node: node('card', 'card'), parentId: null },
      { type: 'moveNode', pageId, nodeId: 'b', parentId: null, index: 0 },
      { type: 'moveNode', pageId, nodeId: 'a', parentId: 'card', index: 0 },
    ]);
    expect(next.pages[0]?.rootNodeIds).toEqual(['b', 'card']);
    expect(next.pages[0]?.nodes.card?.childrenIds).toEqual(['a']);
    expect(next.pages[0]?.nodes.a?.parentId).toBe('card');
  });

  it('refuses to move a node inside its own descendant', () => {
    const { project, pageId } = setup();
    const withTree = apply(project, [
      { type: 'addNode', pageId, node: node('outer', 'card'), parentId: null },
      { type: 'addNode', pageId, node: node('inner', 'card'), parentId: 'outer' },
    ]);
    const result = applyOperations(withTree, [
      { type: 'moveNode', pageId, nodeId: 'outer', parentId: 'inner', index: 0 },
    ]);
    expect(result.ok).toBe(false);
  });

  it('merges props and renames nodes', () => {
    const { project, pageId } = setup();
    const next = apply(project, [
      {
        type: 'addNode',
        pageId,
        node: { ...node('a'), props: { label: 'Go', size: 'md' } },
        parentId: null,
      },
      { type: 'updateNodeProps', pageId, nodeId: 'a', props: { label: 'Continue' } },
      { type: 'renameNode', pageId, nodeId: 'a', name: '  Primary action  ' },
    ]);
    expect(next.pages[0]?.nodes.a?.props).toEqual({ label: 'Continue', size: 'md' });
    expect(next.pages[0]?.nodes.a?.name).toBe('Primary action');
  });

  it('is all or nothing: a failing operation leaves the project unchanged', () => {
    const { project, pageId } = setup();
    const before = structuredClone(project);
    const result = applyOperations(project, [
      { type: 'addNode', pageId, node: node('a'), parentId: null },
      { type: 'removeNode', pageId, nodeId: 'missing' },
    ]);
    expect(result).toEqual({ ok: false, error: expect.stringContaining('operation 1') });
    expect(project).toEqual(before);
  });

  it('rejects duplicate ids, unknown pages and unknown parents', () => {
    const { project, pageId } = setup();
    const withA = apply(project, [{ type: 'addNode', pageId, node: node('a'), parentId: null }]);
    expect(
      applyOperations(withA, [{ type: 'addNode', pageId, node: node('a'), parentId: null }]).ok,
    ).toBe(false);
    expect(
      applyOperations(withA, [{ type: 'addNode', pageId: 'nope', node: node('b'), parentId: null }])
        .ok,
    ).toBe(false);
    expect(
      applyOperations(withA, [{ type: 'addNode', pageId, node: node('b'), parentId: 'ghost' }]).ok,
    ).toBe(false);
  });

  it('rejects results that break the schema, such as an empty name', () => {
    const { project, pageId } = setup();
    const result = applyOperations(project, [
      {
        type: 'addNode',
        pageId,
        node: { id: 'a', type: 'button', name: '', props: {} },
        parentId: null,
      },
    ]);
    expect(result.ok).toBe(false);
  });
});
