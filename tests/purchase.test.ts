import test, { expect } from '@playwright/test';
import { credentials, colors } from '../fixtures';
import { timeout } from '../playwright.config';

test.describe('Purchase', () => {
  const contact = 'Systima AS';
  const totalAmount = 1000;
  const invoiceDate = '01.01.2024';
  const dueDate = '15.01.2024';
  const account = '1000 Utvikling, ervervet';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(credentials.email);
    await page.locator('[name="password"]').fill(credentials.password);
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await page.waitForURL('systimaas7/dashboard', { timeout: timeout * 2 });
  });

  test('Create Purchase', async ({ page }) => {
    await page.getByRole('button', { name: 'Bokføring' }).click();
    await page.getByRole('link', { name: 'Bokfør godkjente filer' }).click();
    await expect(page).toHaveURL('systimaas7/bookkeeping/purchase');

    await page.getByTestId('contact-select').click();
    await page.getByRole('textbox', { name: 'Søk' }).fill(contact);
    await page.getByRole('option', { name: contact }).click();

    await page
      .getByRole('textbox', { name: 'Totalt beløp inkl. mva. *' })
      .fill(totalAmount.toString());

    await page.getByRole('button', { name: 'Fakturadato *' }).fill(invoiceDate);

    await page.getByRole('button', { name: 'Forfallsdato' }).fill(dueDate);

    await page.getByRole('textbox', { name: 'Konto' }).click();
    await page.keyboard.type(account);
    await page.getByRole('option', { name: account }).click();

    await page.getByRole('button', { name: 'Bokfør', exact: true }).click();

    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/purchases') && response.status() === 200,
      { timeout }
    );
    const responseBody = await response.text();
    const responseJson = JSON.parse(responseBody);
    const transactionNumber = responseJson.transactionNumber;

    await expect(
      page
        .getByRole('status')
        .filter({
          hasText: `Bilag opprettet med bilagsnr. ${transactionNumber}`,
        })
        .locator('..')
    ).toHaveCSS('background-color', colors.success);
    await expect(
      page.getByRole('status').filter({
        hasText: `Bilag opprettet med bilagsnr. ${transactionNumber}`,
      })
    ).toBeAttached();

    await expect(
      page
        .getByRole('button', { name: 'Kontakt (valgfri ved kvittering)' })
        .locator('.v-select__selections')
    ).not.toContainText(contact);
    await expect(
      page.getByRole('textbox', { name: 'Totalt beløp inkl. mva. *' })
    ).not.toHaveValue(totalAmount.toString());
    await expect(
      page.getByRole('button', { name: 'Fakturadato *' })
    ).not.toHaveValue(invoiceDate);
    await expect(
      page.getByRole('button', { name: 'Forfallsdato' })
    ).not.toHaveValue(dueDate);
    await expect(
      page
        .getByRole('button', { name: 'Konto' })
        .locator('.v-select__selections')
    ).not.toContainText(account);
  });

  test('Duplicate Invoice Number Handling', async ({ page }) => {
    const invoiceNumer = 1;

    await page.getByRole('button', { name: 'Bokføring' }).click();
    await page.getByRole('link', { name: 'Bokfør godkjente filer' }).click();
    await expect(page).toHaveURL('systimaas7/bookkeeping/purchase');

    await page.getByTestId('contact-select').click();
    await page.getByRole('textbox', { name: 'Søk' }).fill(contact);
    await page.getByRole('option', { name: contact }).click();

    await page
      .getByRole('textbox', { name: 'Totalt beløp inkl. mva. *' })
      .fill(totalAmount.toString());

    await page.getByRole('button', { name: 'Fakturadato *' }).fill(invoiceDate);

    await page.getByRole('button', { name: 'Forfallsdato' }).fill(dueDate);

    await page.getByRole('textbox', { name: 'Konto' }).click();
    await page.keyboard.type(account);
    await page.getByRole('option', { name: account }).click();

    await page
      .getByRole('textbox', { name: 'Fakturanr.' })
      .fill(invoiceNumer.toString());

    await page.getByRole('button', { name: 'Bokfør', exact: true }).click();

    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/purchases') && response.status() === 422,
      { timeout }
    );
    const responseBody = await response.text();
    const responseJson = JSON.parse(responseBody);
    const number = responseJson.number;

    await expect(
      page.locator('span', {
        hasText: new RegExp(`Fakturanr. er allerede bokført ${number}`),
      })
    ).toHaveCSS('color', colors.errorText);

    await expect(
      page
        .getByRole('button', { name: 'Kontakt (valgfri ved kvittering)' })
        .locator('.v-select__selections')
    ).toContainText(contact);
    await expect(
      page.getByRole('textbox', { name: 'Totalt beløp inkl. mva. *' })
    ).toHaveValue(totalAmount.toString());
    await expect(
      page.getByRole('button', { name: 'Fakturadato *' })
    ).toHaveValue(invoiceDate);
    await expect(
      page.getByRole('button', { name: 'Forfallsdato' })
    ).toHaveValue(dueDate);
    await expect(
      page
        .getByRole('button', { name: 'Konto' })
        .locator('.v-select__selections')
    ).toContainText(account);
  });
});
