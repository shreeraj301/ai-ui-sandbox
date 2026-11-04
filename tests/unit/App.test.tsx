import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

describe('App', () => {
  it('opens a playground with the library, stage and inspector', async () => {
    render(<App />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'AI UI Sandbox' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Stage' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Properties' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
