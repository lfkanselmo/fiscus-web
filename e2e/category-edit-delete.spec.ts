import { expect, test } from './fixtures/auth';

test('edita el nombre y color de una categoría y luego la borra', async ({ page }) => {
  const name = `Suscripciones E2E ${Date.now()}`;
  const renamed = `${name} editado`;

  await page.goto('/categorias');
  await page.getByPlaceholder('Nombre de la categoría').fill(name);
  await page.locator('.color-trigger').click();
  await page.locator('.hex-input').fill('2a78d6');
  await page.locator('.picker-backdrop').click();
  await page.getByRole('button', { name: 'Crear categoría' }).click();

  const row = page.locator('.category-row', { hasText: name });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: 'Editar' }).click();
  const nameInput = page.getByPlaceholder('Nombre de la categoría');
  await nameInput.fill('');
  await nameInput.fill(renamed);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  const renamedRow = page.locator('.category-row', { hasText: renamed });
  await expect(renamedRow).toBeVisible();

  await renamedRow.getByRole('button', { name: 'Eliminar' }).click();
  await renamedRow.getByRole('button', { name: '¿Confirmar?' }).click();
  await expect(page.locator('.category-row', { hasText: renamed })).toHaveCount(0);
});

test('la categoría "Sin categorizar" no tiene controles de editar/eliminar/reglas', async ({
  page,
}) => {
  await page.goto('/categorias');

  const sentinelRow = page.locator('.category-row', { hasText: 'Sin categorizar' });
  await expect(sentinelRow).toBeVisible();
  await expect(sentinelRow.getByRole('button', { name: 'Editar' })).toHaveCount(0);
  await expect(sentinelRow.getByRole('button', { name: 'Eliminar' })).toHaveCount(0);
  await expect(sentinelRow.getByRole('button', { name: 'Reglas' })).toHaveCount(0);
});
