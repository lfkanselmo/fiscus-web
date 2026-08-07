import { expect, test } from '@playwright/test';

test('crea una categoría nueva eligiendo un color con el picker HSV', async ({ page }) => {
  const name = `Mascotas E2E ${Date.now()}`;

  await page.goto('/categorias');
  await page.getByPlaceholder('Nombre de la categoría').fill(name);

  await page.locator('.color-trigger').click();
  await page.locator('.hex-input').fill('9c27b0');
  await page.locator('.picker-backdrop').click();

  await page.getByRole('button', { name: 'Crear categoría' }).click();

  await expect(page.locator('.category-rows')).toContainText(name);
});
