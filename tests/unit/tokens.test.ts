import { beforeEach, describe, expect, it } from 'vitest';
import { checkTokenChange, getToken, TOKEN_SPECS } from '../../src/design-system/catalogue';
import { checkContrast, contrastRatio, formatRatio } from '../../src/design-system/contrast';
import { defaultTokens } from '../../src/design-system/defaultTokens';
import { tokensToCssFile, tokensToJson } from '../../src/design-system/export';
import { tokensToCssVariables } from '../../src/design-system/resolve';
import { colorValue, normalizeHex, px } from '../../src/design-system/tokenValues';
import { applyOperations } from '../../src/document/operations';
import { createProject, parseProject } from '../../src/document/project';
import { activeDesignSystem, activePage, useEditor } from '../../src/editor/store';

const brandOf = (tokens = activeDesignSystem(useEditor.getState().project!).tokens) =>
  getToken(tokens, 'color.brand')?.$value;

describe('token catalogue', () => {
  it('lists only tokens that exist in the starter system and are read by the components', () => {
    for (const spec of TOKEN_SPECS) expect(getToken(defaultTokens, spec.path)).toBeDefined();
    const vars = tokensToCssVariables(defaultTokens);
    for (const spec of TOKEN_SPECS) {
      expect(vars[`--u-${spec.path.replace(/\./g, '-')}`]).toBeDefined();
    }
  });

  it('refuses tokens outside the catalogue and values outside their range', () => {
    expect(checkTokenChange('color.neutral', colorValue('#000000'))).toMatch(/can't be edited/);
    expect(checkTokenChange('space.4', px(200))).toBe('Enter a value from 0px to 96px.');
    expect(checkTokenChange('space.4', { value: 1, unit: 'rem' })).toBe('Enter a size in pixels.');
    expect(checkTokenChange('font.weight.strong', 950)).toBe('Enter a value from 100 to 900.');
    expect(checkTokenChange('font.family', ['Comic Sans MS'])).toMatch(/listed font stacks/);
    expect(checkTokenChange('color.brand', '#ff0000')).toMatch(/hex colour/);
    expect(checkTokenChange('space.4', px(24))).toBeNull();
  });
});

describe('hex input', () => {
  it('reads six and three digit colours with or without the hash', () => {
    expect(normalizeHex('B5175A')).toBe('#b5175a');
    expect(normalizeHex('#b17')).toBe('#bb1177');
    expect(normalizeHex('#b5175')).toBeNull();
    expect(normalizeHex('red')).toBeNull();
  });
});

describe('contrast', () => {
  it('matches the WCAG formula at the extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('rounds down for display so a failing pair never reads as passing', () => {
    expect(formatRatio(4.4999)).toBe('4.49:1');
    expect(formatRatio(21)).toBe('21.00:1');
  });

  it('flags the starter border, which is too faint for an input edge', () => {
    const failing = checkContrast(defaultTokens).filter((pair) => !pair.passes);
    expect(failing.map((pair) => pair.label)).toEqual(['Input and checkbox edges']);
  });
});

describe('updateToken operation', () => {
  it('changes a token value without touching the original project', () => {
    const project = createProject();
    const system = project.designSystems[0]!;
    const result = applyOperations(project, [
      {
        type: 'updateToken',
        designSystemId: system.id,
        path: 'color.brand',
        value: colorValue('#0055aa'),
      },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(brandOf(result.project.designSystems[0]!.tokens)).toMatchObject({ hex: '#0055aa' });
    expect(brandOf(system.tokens)).toMatchObject({ hex: '#b5175a' });
  });

  it('refuses values of the wrong type, missing tokens and groups', () => {
    const project = createProject();
    const id = project.designSystems[0]!.id;
    const op = (path: string, value: unknown) =>
      applyOperations(project, [{ type: 'updateToken', designSystemId: id, path, value }]);
    expect(op('color.brand', px(4)).ok).toBe(false);
    expect(op('color.nope', colorValue('#000000')).ok).toBe(false);
    expect(op('color', colorValue('#000000')).ok).toBe(false);
    expect(op('space.4', { value: Infinity, unit: 'px' }).ok).toBe(false);
    const mismatched = { ...colorValue('#000000'), hex: '#ffffff' };
    expect(op('color.brand', mismatched).ok).toBe(false);
  });
});

describe('token editing in the store', () => {
  beforeEach(() => useEditor.getState().load(createProject('Token test')));

  it('selecting a token clears the component selection, and the other way round', () => {
    useEditor.getState().addComponent('button');
    useEditor.getState().selectToken('color.brand');
    expect(useEditor.getState().selectedId).toBeNull();
    const id = activePage(useEditor.getState().project!).rootNodeIds[0]!;
    useEditor.getState().select(id);
    expect(useEditor.getState().selectedToken).toBeNull();
  });

  it('merges quick edits to one token into one undo step', () => {
    const { updateToken } = useEditor.getState();
    expect(updateToken('color.brand', colorValue('#111111'))).toEqual({ ok: true });
    expect(updateToken('color.brand', colorValue('#222222'))).toEqual({ ok: true });
    expect(brandOf()).toMatchObject({ hex: '#222222' });
    useEditor.getState().undo();
    expect(brandOf()).toMatchObject({ hex: '#b5175a' });
  });

  it('refuses an out-of-range value and leaves the project alone', () => {
    const before = useEditor.getState().project;
    expect(useEditor.getState().updateToken('radius.md', px(-4)).ok).toBe(false);
    expect(useEditor.getState().project).toBe(before);
  });

  it('resets every changed token as one undoable step', () => {
    const { updateToken } = useEditor.getState();
    updateToken('color.brand', colorValue('#111111'));
    updateToken('space.4', px(30));
    const revision = useEditor.getState().project!.revision;
    expect(useEditor.getState().resetTokens()).toEqual({ ok: true });
    expect(brandOf()).toMatchObject({ hex: '#b5175a' });
    expect(useEditor.getState().project!.revision).toBe(revision + 1);
    useEditor.getState().undo();
    expect(brandOf()).toMatchObject({ hex: '#111111' });
  });
});

describe('export', () => {
  const system = createProject().designSystems[0]!;

  it('writes the DTCG tree as JSON that reads back to the same tokens', () => {
    expect(JSON.parse(tokensToJson(system))).toEqual(system.tokens);
  });

  it('writes CSS variables without the editor prefix, shadows included', () => {
    const css = tokensToCssFile(system);
    expect(css).toContain('--color-brand: #b5175a;');
    expect(css).toContain('--font-weight-strong: 600;');
    expect(css).toContain('--shadow-sm: 0px 1px 2px 0px rgb(28 26 29 / 0.08);');
    expect(css).not.toContain('--u-');
    expect(css.startsWith('/* Starter system:')).toBe(true);
  });
});

describe('migration to version 2', () => {
  it('adds the new starter tokens and card elevation, and keeps edited values', () => {
    const current = createProject();
    const system = current.designSystems[0]!;
    const oldTokens = structuredClone(system.tokens) as Record<string, Record<string, unknown>>;
    delete oldTokens.shadow;
    delete oldTokens.font!.weight;
    (oldTokens.color!.brand as { $value: unknown }).$value = colorValue('#0055aa');
    const page = current.pages[0]!;
    const v1 = {
      ...current,
      schemaVersion: 1,
      designSystems: [{ ...system, tokens: oldTokens }],
      pages: [
        {
          ...page,
          rootNodeIds: ['card'],
          nodes: {
            card: {
              id: 'card',
              type: 'card',
              name: 'Card',
              parentId: null,
              childrenIds: [],
              props: { title: 'Plan', body: '', padding: 'md' },
            },
          },
        },
      ],
    };
    const result = parseProject(v1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const tokens = result.project.designSystems[0]!.tokens;
    expect(result.project.schemaVersion).toBe(2);
    expect(getToken(tokens, 'shadow.md')).toBeDefined();
    expect(getToken(tokens, 'font.weight.heading')?.$value).toBe(650);
    expect(brandOf(tokens)).toMatchObject({ hex: '#0055aa' });
    expect(result.project.pages[0]!.nodes.card!.props.elevation).toBe('none');
  });
});
