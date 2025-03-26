import test, { expect } from '@playwright/test';
import { credentials } from '../fixtures';

test.describe('Contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(credentials.email);
    await page.locator('[name="password"]').fill(credentials.password);
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await page.waitForURL('systimaas7/dashboard', { timeout: 60000 });
  });
  test('Contact Creation - Validation', async ({ page }) => {
    await page.goto('systimaas7/dashboard');
    await expect(page).toHaveURL('systimaas7/dashboard');

    await page.locator('.v-list-item__title', { hasText: 'Kontakter' }).click();
    await expect(page).toHaveURL('systimaas7/contacts');

    await page.locator('button', { hasText: new RegExp('Ny kontakt') }).click();

    await page.locator('form button', { hasText: 'Opprett kontakt' }).click();

    await expect(
      page.locator('.v-text-field__slot', { hasText: 'Navn *' })
    ).toHaveCSS('color', 'rgb(255, 82, 82)');
    await expect(
      page.locator('.v-messages__wrapper', {
        hasText: 'Vennligst skriv inn navn',
      })
    ).toHaveCSS('color', 'rgb(255, 82, 82)');
  });

  test('Contact Creation - Success', async ({ page }) => {
    await page.goto('systimaas7/dashboard');
    await expect(page).toHaveURL('systimaas7/dashboard');

    await page.locator('.v-list-item__title', { hasText: 'Kontakter' }).click();
    await expect(page).toHaveURL('systimaas7/contacts');

    await page.locator('button', { hasText: 'Ny kontakt' }).click();
    const nameInput = page
      .locator('.v-text-field__slot', { hasText: 'Navn *' })
      .locator('input');
    await nameInput.click();
    await nameInput.fill('Test');
    await page
      .locator('form button', { hasText: /\sOpprett kontakt\s/ })
      .click();

    await expect(page.locator('.v-snack__wrapper')).toHaveCSS(
      'background-color',
      'rgb(226, 248, 227)'
    );
  });
});
