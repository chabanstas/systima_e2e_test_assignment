import test, { expect } from '@playwright/test';
import { credentials } from '../fixtures';

test.describe('Purchase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('[name="email"]').fill(credentials.email);
    await page.locator('[name="password"]').fill(credentials.password);
    await page.locator('button', { hasText: 'Logg inn' }).click();
    await page.waitForURL('systimaas7/dashboard', { timeout: 60000 });
  });

  test('Create Purchase', async ({ page }) => {
    const contactSelectTestId = 'contact-select';
    const totalAmountLabel = 'Totalt beløp inkl. mva. *';
    const invoiceDateLabel = 'Fakturadato *';
    const dueDateLabel = 'Forfallsdato';
    const accountSearchTerm = '1000 Utvikling, ervervet';
    const accountItemText = '1000 Utvikling, ervervet';
    const submitButtonText = 'Bokfør';
    const snackbarSelector = '[class="snackbar-item__content"]';

    await page.goto('systimaas7/dashboard');
    await expect(page).toHaveURL('systimaas7/dashboard');

    if (await page.locator('[class*="app-nav-drawer"]').isVisible()) {
      await page.locator('button[class*="class="v-app-bar__nav-icon"]').click();
    }
    await page.getByText('Bokføring').click();
    await page.getByText('Bokfør godkjente filer').click();
    await expect(page).toHaveURL('systimaas7/bookkeeping/purchase');

    await page.getByTestId(contactSelectTestId).click();
    await page.locator('[class*="v-menu__content"] input').fill('Systima AS');
    await page
      .locator('.v-list-item__title')
      .filter({ hasText: 'Systima AS' })
      .click();

    const amountInput = page
      .getByText(totalAmountLabel)
      .locator('..')
      .locator('input');
    await amountInput.click();
    await amountInput.fill('1000');

    const invoiceDateInput = page
      .getByText(invoiceDateLabel)
      .locator('..')
      .locator('input');
    await invoiceDateInput.click();
    await invoiceDateInput.fill('01.01.2024');

    const dueDateInput = page
      .getByText(dueDateLabel)
      .locator('..')
      .locator('input');
    await dueDateInput.click();
    await dueDateInput.fill('15.01.2024');

    await page.locator('[class="py-3 vertical-align-top"]').nth(1).click();
    await page.getByRole('textbox', { name: 'Søk' }).fill(accountSearchTerm);
    await page
      .locator('.v-list-item__title')
      .filter({ hasText: accountItemText })
      .click();

    await page
      .getByRole('button', { name: submitButtonText, exact: true })
      .click();

    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/purchases') && response.status() === 200,
      { timeout: 10000 }
    );
    const responseBody = await response.text();
    const responseJson = JSON.parse(responseBody);
    const transactionNumber = responseJson.transactionNumber;

    await expect(page.locator('.v-snack__wrapper')).toHaveCSS(
      'background-color',
      'rgb(226, 248, 227)'
    );
    await expect(page.locator(snackbarSelector)).toContainText(
      `Bilag opprettet med bilagsnr. ${transactionNumber}`
    );

    // TODO: add assertation that inputs are cleared after submit
  });

  test('Duplicate Invoice Number Handling', async ({ page }) => {
    const contactSelectTestId = 'contact-select';
    const totalAmountLabel = 'Totalt beløp inkl. mva. *';
    const invoiceDateLabel = 'Fakturadato *';
    const dueDateLabel = 'Forfallsdato';
    const accountSearchTerm = '1000 Utvikling, ervervet';
    const accountItemText = '1000 Utvikling, ervervet';
    const submitButtonText = 'Bokfør';
    const snackbarSelector = '[class="snackbar-item__content"]';

    await page.goto('systimaas7/dashboard');
    await expect(page).toHaveURL('systimaas7/dashboard');

    if (await page.locator('[class*="app-nav-drawer"]').isVisible()) {
      await page.locator('button[class*="class="v-app-bar__nav-icon"]').click();
    }
    await page.getByText('Bokføring').click();
    await page.getByText('Bokfør godkjente filer').click();
    await expect(page).toHaveURL('systimaas7/bookkeeping/purchase');

    await page.getByTestId(contactSelectTestId).click();
    await page.locator('[class*="v-menu__content"] input').fill('Systima AS');
    await page
      .locator('.v-list-item__title')
      .filter({ hasText: 'Systima AS' })
      .click();

    const amountInput = page
      .getByText(totalAmountLabel)
      .locator('..')
      .locator('input');
    await amountInput.click();
    await amountInput.fill('1000');

    const invoiceDateInput = page
      .getByText(invoiceDateLabel)
      .locator('..')
      .locator('input');
    await invoiceDateInput.click();
    await invoiceDateInput.fill('01.01.2024');

    const dueDateInput = page
      .getByText(dueDateLabel)
      .locator('..')
      .locator('input');
    await dueDateInput.click();
    await dueDateInput.fill('15.01.2024');

    await page.locator('[class="py-3 vertical-align-top"]').nth(1).click();
    await page.getByRole('textbox', { name: 'Søk' }).fill(accountSearchTerm);
    await page
      .locator('.v-list-item__title')
      .filter({ hasText: accountItemText })
      .click();

    const invoiceNumberInput = page
      .getByText('Fakturanr.')
      .locator('..')
      .locator('input');
    await invoiceNumberInput.click();
    await invoiceNumberInput.fill('1');

    await page
      .getByRole('button', { name: submitButtonText, exact: true })
      .click();

    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/purchases') && response.status() === 422,
      { timeout: 10000 }
    );
    const responseBody = await response.text();
    const responseJson = JSON.parse(responseBody);
    const number = responseJson.number;

    await expect(
      page.locator('span', {
        hasText: new RegExp(`Fakturanr\. er allerede bokført ${number}`),
      })
    ).toHaveCSS('color', 'rgb(255, 82, 82)');

    // TODO: add check that form didn't clear after submit
  });
});
