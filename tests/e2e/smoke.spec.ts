import { expect, test } from '@playwright/test';

test('the app loads and shows the product name', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'AI UI Sandbox' })).toBeVisible();
  expect(errors).toEqual([]);
});
