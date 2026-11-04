import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('edit tokens, see the stage change, check contrast, export and reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  // A primary button and an elevated card to watch.
  await page.getByRole('button', { name: /^Button .*add to the page/ }).click();
  const button = page.getByRole('button', { name: 'Button: Button' }).locator('.uc-button');
  await page.getByRole('button', { name: /^Card .*add to the page/ }).click();
  await page
    .getByRole('radiogroup', { name: 'Elevation' })
    .getByRole('radio', { name: 'M', exact: true })
    .check();
  const card = page.getByRole('button', { name: 'Card: Card' }).locator('.uc-card');
  await expect(card).toHaveAttribute('data-elevation', 'md');

  // Open the Tokens tab: the starter border fails its contrast check.
  await page.getByRole('tab', { name: 'Tokens' }).click();
  await expect(page.getByText('15 of 16 colour pairs pass WCAG AA.')).toBeVisible();

  // Change brand by typing a hex value. The button follows at once.
  await page.getByRole('button', { name: /^Brand #b5175a/ }).click();
  await expect(page.getByRole('heading', { name: 'Token' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Colour', exact: true }).fill('#0055aa');
  await expect(button).toHaveCSS('background-color', 'rgb(0, 85, 170)');
  await expect(page.getByText('Primary button label', { exact: true })).toBeVisible();

  // A half-typed value is held back, then a bad one is explained.
  await page.getByRole('textbox', { name: 'Colour', exact: true }).fill('#00');
  await expect(button).toHaveCSS('background-color', 'rgb(0, 85, 170)');
  await page.getByRole('textbox', { name: 'Colour', exact: true }).fill('#00zz');
  await expect(page.getByRole('alert')).toHaveText('Use 3 or 6 hex digits, such as #b5175a.');
  await page.getByRole('textbox', { name: 'Colour', exact: true }).blur();
  await expect(page.getByRole('textbox', { name: 'Colour', exact: true })).toHaveValue('#0055aa');

  // An out-of-range size is refused with a reason.
  await page.getByRole('button', { name: /^Medium 10px/ }).click();
  await page.getByRole('spinbutton', { name: 'Size', exact: true }).fill('80');
  await expect(page.getByRole('alert')).toHaveText('Enter a value from 0px to 64px.');
  await page.getByRole('spinbutton', { name: 'Size', exact: true }).fill('4');
  await expect(button).toHaveCSS('border-radius', '4px');

  // Fixing the border clears the contrast warning.
  await page.getByRole('button', { name: /^Border/ }).click();
  await page.getByRole('textbox', { name: 'Colour', exact: true }).fill('#8a8289');
  await expect(page.getByText('16 of 16 colour pairs pass WCAG AA.')).toBeVisible();

  // Export the CSS file.
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download tokens.css' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('tokens.css');
  const css = await readFile((await download.path()) as string, 'utf8');
  expect(css).toContain('--color-brand: #0055aa;');
  expect(css).toContain('--radius-md: 4px;');

  // Reload keeps the edits.
  await expect(page.getByTestId('save-status')).toHaveText('Saved locally');
  await page.reload();
  await expect(button).toHaveCSS('background-color', 'rgb(0, 85, 170)');

  // Reset all puts the starter values back, and undo brings the edits back.
  await page.getByRole('tab', { name: 'Tokens' }).click();
  await page.getByRole('button', { name: /^Reset all tokens/ }).click();
  await expect(button).toHaveCSS('background-color', 'rgb(181, 23, 90)');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(button).toHaveCSS('background-color', 'rgb(0, 85, 170)');

  expect(errors).toEqual([]);
});
