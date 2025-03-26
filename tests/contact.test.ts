import test, { expect } from '@playwright/test';
import { colors, credentials } from '../fixtures';
import { timeout } from '../playwright.config';

test.describe('Contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(credentials.email);
    await page.locator('[name="password"]').fill(credentials.password);
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await page.waitForURL('systimaas7/dashboard', { timeout: timeout * 2 });
  });
  test('Contact Creation - Validation', async ({ page }) => {
    await page.locator('.v-list-item__title', { hasText: 'Kontakter' }).click();
    await expect(page).toHaveURL('systimaas7/contacts');

    await page.locator('button', { hasText: new RegExp('Ny kontakt') }).click();

    await page.locator('form button', { hasText: 'Opprett kontakt' }).click();

    await expect(
      page.locator('.v-text-field__slot', { hasText: 'Navn *' })
    ).toHaveCSS('color', colors.errorText);
    await expect(
      page.locator('.v-messages__wrapper', {
        hasText: 'Vennligst skriv inn navn',
      })
    ).toHaveCSS('color', colors.errorText);
  });

  test('Contact Creation - Success', async ({ page }) => {
    await page.locator('.v-list-item__title', { hasText: 'Kontakter' }).click();
    await expect(page).toHaveURL('systimaas7/contacts');

    await page.locator('button', { hasText: 'Ny kontakt' }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes('/account_number_suggestions') &&
        response.status() === 200,
      { timeout }
    );
    const nameInput = page
      .locator('.v-text-field__slot', { hasText: 'Navn *' })
      .locator('input');
    await nameInput.click();
    await nameInput.fill('Test');
    await page.locator('button', { hasText: /\sOpprett kontakt\s/ }).click();

    await expect(page.locator('.v-snack__wrapper')).toHaveCSS(
      'background-color',
      colors.success
    );
  });
});
