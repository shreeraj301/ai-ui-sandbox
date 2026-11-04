import { describe, expect, it } from 'vitest';
import { createProject } from '../../src/document/project';
import { checkOperations, checkProps, componentList } from '../../src/registry/registry';

describe('component registry', () => {
  it('has the 15 Phase 1 components, whose defaults pass their own schema', () => {
    expect(componentList.map((definition) => definition.type)).toEqual([
      'text',
      'button',
      'icon-button',
      'badge',
      'divider',
      'text-input',
      'textarea',
      'select',
      'checkbox',
      'switch',
      'card',
      'avatar',
      'image',
      'alert',
      'progress',
    ]);
    for (const definition of componentList) {
      expect(checkProps(definition.type, definition.defaults)).toEqual({ ok: true });
    }
  });

  it('every inspector field maps to a prop in the defaults', () => {
    for (const definition of componentList) {
      for (const field of definition.fields) {
        expect(definition.defaults).toHaveProperty(field.key);
      }
    }
  });

  it('rejects unknown types, unknown props and out-of-range values', () => {
    expect(checkProps('carousel', {}).ok).toBe(false);
    const button = componentList.find((definition) => definition.type === 'button')!;
    expect(checkProps('button', { ...button.defaults, onClick: 'alert(1)' }).ok).toBe(false);
    expect(checkProps('button', { ...button.defaults, variant: 'neon' }).ok).toBe(false);
    const empty = checkProps('button', { ...button.defaults, label: '' });
    expect(empty).toEqual({ ok: false, error: 'Enter at least 1 character.', key: 'label' });
    expect(checkProps('button', { ...button.defaults, label: 'x'.repeat(61) }).ok).toBe(false);
  });

  it('checks the merged props of an update against the schema', () => {
    const project = createProject();
    const pageId = project.activePageId;
    const button = componentList.find((definition) => definition.type === 'button')!;
    project.pages[0]!.rootNodeIds = ['b'];
    project.pages[0]!.nodes.b = {
      id: 'b',
      type: 'button',
      name: 'Button',
      parentId: null,
      childrenIds: [],
      props: { ...button.defaults },
    };
    expect(
      checkOperations(project, [
        { type: 'updateNodeProps', pageId, nodeId: 'b', props: { size: 'lg' } },
      ]),
    ).toEqual({ ok: true });
    expect(
      checkOperations(project, [
        { type: 'updateNodeProps', pageId, nodeId: 'b', props: { size: 'xl' } },
      ]).ok,
    ).toBe(false);
  });
});
