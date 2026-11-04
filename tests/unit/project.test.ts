import { describe, expect, it } from 'vitest';
import { applyOperations } from '../../src/document/operations';
import { createProject, parseProject } from '../../src/document/project';
import { CURRENT_SCHEMA_VERSION } from '../../src/document/schema';

describe('createProject', () => {
  it('creates a valid project with one page and one design system', () => {
    const project = createProject('My playground');
    expect(project.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(project.pages).toHaveLength(1);
    expect(project.activePageId).toBe(project.pages[0]?.id);
    expect(project.activeDesignSystemId).toBe(project.designSystems[0]?.id);
    expect(parseProject(project).ok).toBe(true);
  });

  it('gives every project fresh ids', () => {
    expect(createProject().id).not.toBe(createProject().id);
  });
});

describe('parseProject', () => {
  it('round-trips a project through JSON', () => {
    const project = createProject();
    const result = applyOperations(project, [
      {
        type: 'addNode',
        pageId: project.activePageId,
        node: { id: 'btn', type: 'button', name: 'Button', props: { label: 'Save' } },
        parentId: null,
      },
    ]);
    if (!result.ok) throw new Error(result.error);
    const restored = parseProject(JSON.parse(JSON.stringify(result.project)));
    expect(restored).toEqual({ ok: true, project: result.project });
  });

  it('accepts DTCG-style tokens in a design system', () => {
    const project = createProject();
    project.designSystems[0]!.tokens = {
      color: { brand: { $type: 'color', $value: '#1f6feb', $description: 'Primary actions' } },
    };
    expect(parseProject(project).ok).toBe(true);
  });

  it('rejects non-objects, missing versions and future versions', () => {
    expect(parseProject(null).ok).toBe(false);
    expect(parseProject('{}').ok).toBe(false);
    expect(parseProject({ ...createProject(), schemaVersion: undefined }).ok).toBe(false);
    const future = parseProject({ ...createProject(), schemaVersion: CURRENT_SCHEMA_VERSION + 1 });
    expect(future).toEqual({ ok: false, error: expect.stringContaining('newer') });
  });

  it('rejects broken structure: dangling child, orphan node, wrong active page', () => {
    const base = createProject();
    const page = base.pages[0]!;

    const dangling = structuredClone(base);
    dangling.pages[0]!.rootNodeIds = ['ghost'];
    expect(parseProject(dangling).ok).toBe(false);

    const orphan = structuredClone(base);
    orphan.pages[0]!.nodes.lost = {
      id: 'lost',
      type: 'button',
      name: 'Lost',
      parentId: null,
      childrenIds: [],
      props: {},
    };
    expect(parseProject(orphan).ok).toBe(false);

    const wrongActive = { ...structuredClone(base), activePageId: `${page.id}-x` };
    expect(parseProject(wrongActive).ok).toBe(false);
  });

  it('rejects a parent/child cycle', () => {
    const project = createProject();
    const page = project.pages[0]!;
    page.rootNodeIds = [];
    page.nodes = {
      a: { id: 'a', type: 'card', name: 'A', parentId: 'b', childrenIds: ['b'], props: {} },
      b: { id: 'b', type: 'card', name: 'B', parentId: 'a', childrenIds: ['a'], props: {} },
    };
    expect(parseProject(project).ok).toBe(false);
  });
});
