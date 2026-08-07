import { expect, test } from './fixtures/auth';

test('reporta filas inválidas sin abortar la importación completa', async ({ page }) => {
  const merchant = `Netflix E2E ${Date.now()}`;

  await page.goto('/importar');

  const csv =
    'fecha,comercio,monto,descripcion\n' +
    `06/08/2026,${merchant},38900,SUSCRIPCION\n` +
    '07/08/2026,Comercio Malo,no-es-un-numero,VARIOS\n';
  await page.setInputFiles('input[type="file"]', {
    name: 'extracto-con-errores.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf-8'),
  });
  await page.getByRole('button', { name: 'Importar' }).click();

  await expect(page.locator('.tile', { hasText: 'Creadas' }).locator('.v')).toHaveText('1');
  await expect(page.locator('.tile', { hasText: 'Filas inválidas' }).locator('.v')).toHaveText('1');

  const errorReport = page.locator('.error-report');
  await expect(errorReport).toBeVisible();
  await expect(errorReport).toContainText("Monto inválido 'no-es-un-numero'");
  await expect(errorReport.locator('.line-badge')).toHaveText('L3');
});
