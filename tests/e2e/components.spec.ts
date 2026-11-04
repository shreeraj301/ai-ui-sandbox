import { expect, test, type Page } from '@playwright/test';

async function add(page: Page, name: string) {
  await page.getByRole('button', { name: new RegExp(`^${name} .*add to the page`) }).click();
  const node = page.getByRole('button', { name: `${name}: ${name}` });
  await expect(node).toHaveAttribute('aria-pressed', 'true');
  return node;
}

test('each new component can be added and edited', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Components' })).toBeVisible();
  const label = () => page.getByLabel('Label', { exact: true });

  const iconButton = await add(page, 'Icon button');
  await page.getByLabel('Icon', { exact: true }).selectOption('heart');
  await label().fill('Like');
  await expect(iconButton.locator('.uc-icon-button')).toHaveAttribute('aria-label', 'Like');

  const divider = await add(page, 'Divider');
  await label().fill('or');
  await expect(divider).toContainText('or');

  const textarea = await add(page, 'Textarea');
  await page.getByLabel('Rows').fill('6');
  await expect(textarea.locator('textarea')).toHaveAttribute('rows', '6');

  const select = await add(page, 'Select');
  await page.getByLabel('Options').fill('Small\nLarge');
  await expect(select.locator('option')).toHaveCount(3);

  const checkbox = await add(page, 'Checkbox');
  await page.getByRole('switch', { name: 'Checked' }).uncheck();
  await expect(checkbox.locator('input')).not.toBeChecked();

  const toggle = await add(page, 'Switch');
  await page.getByRole('switch', { name: 'On' }).check();
  await expect(toggle.locator('input')).toBeChecked();

  const avatar = await add(page, 'Avatar');
  await page.getByLabel('Name').fill('Mei Lin');
  await expect(avatar).toContainText('ML');

  const image = await add(page, 'Image');
  await page.getByLabel('Address').fill('http://example.com/photo.jpg');
  await expect(page.getByRole('alert')).toHaveText('Use a full address starting with https://');
  await expect(image).toContainText('No image yet');

  const alert = await add(page, 'Alert');
  await page.getByRole('radio', { name: 'Danger' }).check();
  await expect(alert.locator('.uc-alert')).toHaveAttribute('data-severity', 'danger');

  const progress = await add(page, 'Progress');
  await page.getByLabel('Value', { exact: true }).fill('85');
  await expect(progress).toContainText('85%');

  expect(errors).toEqual([]);
});

test('the States tab previews a state on the stage without saving it', async ({ page }) => {
  await page.goto('/');
  const button = await add(page, 'Button');
  await page.getByRole('tab', { name: 'States' }).click();
  await expect(page.getByRole('radio', { name: /Hover/ })).toBeVisible();

  await page.getByRole('radio', { name: /Hover/ }).check();
  await expect(button.locator('.uc-button')).toHaveAttribute('data-state', 'hover');
  await expect(page.getByText('Showing hover')).toBeVisible();

  await page.getByRole('radio', { name: /Disabled/ }).check();
  await expect(button.locator('.uc-button')).toBeDisabled();

  await page.getByRole('radio', { name: /Default/ }).check();
  await expect(button.locator('.uc-button')).not.toHaveAttribute('data-state', /.+/);

  // Previews are not edits: nothing to undo beyond adding the button.
  await page.getByRole('radio', { name: /Loading/ }).check();
  await expect(page.getByTestId('save-status')).toHaveText('Saved locally');
  await page.reload();
  const restored = page.getByRole('button', { name: 'Button: Button' });
  await expect(restored.locator('.uc-button')).not.toHaveAttribute('aria-busy', 'true');
});
