import { expect, test } from '@playwright/test';

test('importa un extracto, categoriza automáticamente y permite recategorizar', async ({
  page,
}) => {
  const merchant = `Exito E2E ${Date.now()}`;

  await page.goto('/importar');

  const csv = `fecha,comercio,monto,descripcion\n05/08/2026,${merchant},150000,COMPRA EXITO\n`;
  await page.setInputFiles('input[type="file"]', {
    name: 'extracto.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf-8'),
  });
  await page.getByRole('button', { name: 'Importar' }).click();
  await expect(page.locator('.tile', { hasText: 'Creadas' }).locator('.v')).toHaveText('1');

  await page.goto('/transacciones');
  const row = page.locator('table.txn tbody tr', { hasText: merchant });
  await expect(row).toBeVisible();
  await expect(row.locator('.select-value')).toHaveText('Supermercado');

  await row.locator('.select-trigger').click();
  await row.locator('.select-option', { hasText: 'Ocio' }).click();
  await expect(row.locator('.select-value')).toHaveText('Ocio');

  await page.reload();
  const rowAfterReload = page.locator('table.txn tbody tr', { hasText: merchant });
  await expect(rowAfterReload.locator('.select-value')).toHaveText('Ocio');
});
