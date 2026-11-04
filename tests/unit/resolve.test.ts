import { describe, expect, it } from 'vitest';
import { defaultTokens } from '../../src/design-system/defaultTokens';
import { tokensToCssVariables } from '../../src/design-system/resolve';

describe('token resolver', () => {
  it('turns the starter tokens into --u- CSS variables', () => {
    const vars = tokensToCssVariables(defaultTokens);
    expect(vars['--u-color-brand']).toBe('#b5175a');
    expect(vars['--u-radius-md']).toBe('10px');
    expect(vars['--u-space-4']).toBe('16px');
    expect(vars['--u-font-family']).toContain('system-ui');
    expect(vars['--u-font-family']).toContain('"Segoe UI"');
  });

  it('drops unsafe names and values instead of passing them to CSS', () => {
    const vars = tokensToCssVariables({
      'bad name;': { $type: 'color', $value: '#fff' },
      color: {
        evil: { $type: 'color', $value: 'red; background: url(x)' },
        good: { $type: 'color', $value: '#123456' },
      },
      size: { $type: 'dimension', $value: { value: 'calc(1px)', unit: 'px' } },
    });
    expect(vars).toEqual({ '--u-color-good': '#123456' });
  });
});
