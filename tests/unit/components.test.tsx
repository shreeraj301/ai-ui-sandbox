import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { checkProps, componentList, getDefinition } from '../../src/registry/registry';

describe('every component renders in every state it declares', () => {
  for (const definition of componentList) {
    it(`${definition.name}`, () => {
      expect(definition.states[0]).toBe('default');
      for (const state of definition.states) {
        const { Render } = definition;
        const { unmount, container } = render(<Render props={definition.defaults} state={state} />);
        expect(container.firstElementChild).not.toBeNull();
        unmount();
      }
    });
  }
});

describe('component rules', () => {
  const defaults = (type: string) => getDefinition(type)!.defaults;

  it('image accepts only empty or https addresses', () => {
    const base = defaults('image');
    expect(checkProps('image', { ...base, src: 'https://example.com/a.jpg' }).ok).toBe(true);
    expect(checkProps('image', { ...base, src: '' }).ok).toBe(true);
    expect(checkProps('image', { ...base, src: 'http://example.com/a.jpg' }).ok).toBe(false);
    expect(checkProps('image', { ...base, src: 'javascript:alert(1)' }).ok).toBe(false);
    expect(checkProps('image', { ...base, width: 40 }).ok).toBe(false);
  });

  it('select needs 1 to 20 options of up to 40 characters', () => {
    const base = defaults('select');
    expect(checkProps('select', { ...base, options: 'One\nTwo' }).ok).toBe(true);
    expect(checkProps('select', { ...base, options: '   \n  ' }).ok).toBe(false);
    expect(checkProps('select', { ...base, options: 'x'.repeat(41) }).ok).toBe(false);
    const many = Array.from({ length: 21 }, (_, i) => `Option ${i}`).join('\n');
    expect(checkProps('select', { ...base, options: many }).ok).toBe(false);
  });

  it('number props must be whole numbers within range', () => {
    const base = defaults('progress');
    expect(checkProps('progress', { ...base, value: 100 }).ok).toBe(true);
    expect(checkProps('progress', { ...base, value: 101 }).ok).toBe(false);
    expect(checkProps('progress', { ...base, value: 12.5 }).ok).toBe(false);
    expect(checkProps('progress', { ...base, value: Number.NaN }).ok).toBe(false);
  });

  it('icons must come from the built-in set', () => {
    const base = defaults('icon-button');
    expect(checkProps('icon-button', { ...base, icon: 'heart' }).ok).toBe(true);
    expect(checkProps('icon-button', { ...base, icon: 'skull' }).ok).toBe(false);
  });

  it('icon button exposes its label to screen readers', () => {
    const { Render } = getDefinition('icon-button')!;
    render(<Render props={defaults('icon-button')} />);
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('loading button is busy and disabled', () => {
    const { Render } = getDefinition('button')!;
    render(<Render props={defaults('button')} state="loading" />);
    const button = screen.getByRole('button', { name: 'Start trial' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('avatar shows initials from first and last name', () => {
    const { Render } = getDefinition('avatar')!;
    render(<Render props={{ ...defaults('avatar'), name: 'Asha K Rao' }} />);
    expect(screen.getByRole('img', { name: 'Asha K Rao' })).toHaveTextContent('AR');
  });
});
