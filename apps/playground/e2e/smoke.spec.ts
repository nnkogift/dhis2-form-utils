import { expect, test } from '@playwright/test';

test('playground loads with sample text input', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'dhis2-form-utils Playground' })).toBeVisible();
  await expect(page.getByLabel('Sample Field')).toBeVisible();
});
