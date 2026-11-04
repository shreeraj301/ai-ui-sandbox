import { expect, test } from '@playwright/test';

test('add a button, edit it, reload and find it unchanged', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Components' })).toBeVisible();
  await expect(page.getByText('This page is empty.', { exact: false })).toBeVisible();

  // Add a button from the library: it lands on the stage, selected.
  await page.getByRole('button', { name: /^Button .*add to the page/ }).click();
  const node = page.getByRole('button', { name: 'Button: Button' });
  await expect(node).toHaveAttribute('aria-pressed', 'true');

  // The dimension lines show the measured size of the real component.
  await expect(page.getByTestId('dim-height')).toHaveText('40');
  const width = Number(await page.getByTestId('dim-width').textContent());
  expect(width).toBeGreaterThan(60);

  // Edit the label and variant in the inspector.
  await page.getByLabel('Label', { exact: true }).fill('Continue to checkout');
  await page.getByRole('radio', { name: 'Secondary' }).check();
  await expect(node.locator('.uc-button')).toHaveText('Continue to checkout');
  await expect(node.locator('.uc-button')).toHaveAttribute('data-variant', 'secondary');

  // An empty label is refused and never reaches the document.
  await page.getByLabel('Label', { exact: true }).fill('');
  await expect(page.getByRole('alert')).toHaveText('Enter at least 1 character.');
  await expect(node.locator('.uc-button')).toHaveText('Continue to checkout');
  await page.getByLabel('Label', { exact: true }).fill('Continue to checkout');

  // Saved only after the write succeeds; then reload restores everything.
  await expect(page.getByTestId('save-status')).toHaveText('Saved locally');
  const revision = await page.getByTestId('revision').textContent();
  await page.reload();
  const restored = page.getByRole('button', { name: 'Button: Button' });
  await expect(restored.locator('.uc-button')).toHaveText('Continue to checkout');
  await expect(restored.locator('.uc-button')).toHaveAttribute('data-variant', 'secondary');
  await expect(page.getByTestId('revision')).toHaveText(revision ?? '');

  expect(errors).toEqual([]);
});

test('select with the keyboard, remove, undo and redo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Card .*add to the page/ }).click();
  await page.getByRole('button', { name: /^Badge .*add to the page/ }).click();
  const card = page.getByRole('button', { name: 'Card: Card' });
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Remove from page' }).click();
  await expect(card).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Badge: Badge' })).toBeVisible();

  // Undo brings it back; redo removes it again.
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(card).toHaveCount(1);
  await page.keyboard.press('Control+Shift+Z');
  await expect(card).toHaveCount(0);
});
