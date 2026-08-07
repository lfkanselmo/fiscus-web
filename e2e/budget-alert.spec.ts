import { expect, test } from './fixtures/auth';

function todayAsDdMmYyyy(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${today.getFullYear()}`;
}

test('define un presupuesto, importa un gasto que lo supera y ve la alerta en el dashboard', async ({
  page,
}) => {
  const name = `Antojos E2E ${Date.now()}`;

  await page.goto('/categorias');
  await page.getByPlaceholder('Nombre de la categoría').fill(name);
  await page.getByPlaceholder('Presupuesto mensual (opcional)').fill('100000');
  await page.getByRole('button', { name: 'Crear categoría' }).click();
  await expect(page.locator('.category-row', { hasText: name })).toBeVisible();

  const merchant = `Comercio E2E ${Date.now()}`;
  await page.goto('/importar');
  const csv = `fecha,comercio,monto,descripcion\n${todayAsDdMmYyyy()},${merchant},150000,VARIOS\n`;
  await page.setInputFiles('input[type="file"]', {
    name: 'extracto.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf-8'),
  });
  await page.getByRole('button', { name: 'Importar' }).click();
  await expect(page.locator('.tile', { hasText: 'Creadas' }).locator('.v')).toHaveText('1');

  await page.goto('/transacciones');
  const row = page.locator('table.txn tbody tr', { hasText: merchant });
  await row.locator('.select-trigger').click();
  await row.locator('.select-option', { hasText: name }).click();
  await expect(row.locator('.select-value')).toHaveText(name);

  await page.goto('/');
  const budgetRow = page.locator('.budget-bar-row', { hasText: name });
  await expect(budgetRow).toBeVisible();
  await expect(budgetRow.locator('.budget-bar-amounts')).toHaveClass(/over/);
});

test('una categoría presupuestada sin gastos aparece en 0 en el dashboard', async ({ page }) => {
  const name = `Ahorro E2E ${Date.now()}`;

  await page.goto('/categorias');
  await page.getByPlaceholder('Nombre de la categoría').fill(name);
  await page.getByPlaceholder('Presupuesto mensual (opcional)').fill('50000');
  await page.getByRole('button', { name: 'Crear categoría' }).click();
  await expect(page.locator('.category-row', { hasText: name })).toBeVisible();

  await page.goto('/');
  const budgetRow = page.locator('.budget-bar-row', { hasText: name });
  await expect(budgetRow).toBeVisible();
  await expect(budgetRow.locator('.budget-bar-amounts')).not.toHaveClass(/over/);
  await expect(budgetRow.locator('.budget-bar-amounts')).toContainText('$ 0');
});
