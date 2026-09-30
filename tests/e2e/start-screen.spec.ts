import { expect, test } from '@playwright/test';

test.describe('start screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('preferredLanguage', 'sv');
    });
    await page.goto('/');
    await expect(page.locator('.overlay-backdrop--start')).toBeVisible();
  });

  test('renders the game and accepts configuration choices', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dissignas Labyrint' })).toBeVisible();

    const groups = page.locator('.config-group');
    await groups.nth(0).getByRole('button', { name: /13/ }).click();
    await groups.nth(1).getByRole('button', { name: 'Svår' }).click();
    await groups.nth(2).getByRole('button', { name: '2 min' }).click();

    await expect(groups.nth(0).getByRole('button', { name: /13/ })).toHaveClass(
      /btn-option--active/,
    );
    await expect(groups.nth(1).getByRole('button', { name: 'Svår' })).toHaveClass(
      /btn-option--active/,
    );
    await expect(groups.nth(2).getByRole('button', { name: '2 min' })).toHaveClass(
      /btn-option--active/,
    );
  });

  test('opens and closes the tutorial', async ({ page }) => {
    await page.getByRole('button', { name: /Hur man spelar|How to play/ }).click();
    await expect(page.locator('.overlay-backdrop--modal')).toBeVisible();
    await expect(page.locator('.tutorial-step')).toHaveCount(5);

    await page.getByRole('button', { name: 'Uppfattat!' }).click();
    await expect(page.locator('.overlay-backdrop--modal')).toHaveCount(0);
  });

  test('opens and closes the high score dialog', async ({ page }) => {
    await page.locator('.btn-link--gold').click();
    await expect(page.locator('.overlay-backdrop--modal')).toBeVisible();
    await expect(page.locator('.modal-box--info .text-muted')).toBeVisible();

    await page.getByRole('button', { name: 'Uppfattat!' }).click();
    await expect(page.locator('.overlay-backdrop--modal')).toHaveCount(0);
  });

  test('loads a game session after starting', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.getByRole('button', { name: 'Starta spelet' }).click();
    await expect(page.locator('#maze-container canvas')).toBeVisible({ timeout: 15_000 });

    expect(pageErrors).toEqual([]);
  });
});
