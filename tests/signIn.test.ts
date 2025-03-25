import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Sign in', () => {
  test('Successful Login', async ({ page }) => {
    const email = 'joachim+453459@systima.no';
    const password = '123456789';

    await page.goto('/login');
    await page.locator('[name="email"]').fill(email);
    await page.locator('[name="password"]').fill(password);
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await page.waitForURL('systimaas7/dashboard');
    await expect(page).toHaveURL('systimaas7/dashboard');
  });

  test('Failed Login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(faker.internet.email());
    await page.locator('[name="password"]').fill(faker.internet.password());
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await expect(page.locator('.v-alert__content')).toHaveText(
      'Feil brukernavn / passord'
    );
    await expect(page.locator('[role="alert"]')).toHaveCSS(
      'background-color',
      'rgb(255, 214, 214)'
    );
    await expect(page).toHaveURL('login');
  });
});
