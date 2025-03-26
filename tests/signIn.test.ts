import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { colors, credentials } from '../fixtures';

test.describe('Sign in', () => {
  test('Successful Login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(credentials.email);
    await page.locator('[name="password"]').fill(credentials.password);
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await page.waitForURL('systimaas7/dashboard');
    await expect(page).toHaveURL('systimaas7/dashboard');
  });

  test('Failed Login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(faker.internet.email());
    await page.locator('[name="password"]').fill(faker.internet.password());
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'Feil brukernavn / passord'
    );
    await expect(page.getByRole('alert')).toHaveCSS(
      'background-color',
      colors.error
    );
    await expect(page).toHaveURL('login');
  });
});
