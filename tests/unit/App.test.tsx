import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

describe('App shell', () => {
  it('renders the product name as the page heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'AI UI Sandbox' })).toBeInTheDocument();
  });
});
