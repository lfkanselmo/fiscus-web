import { expect, test } from './fixtures/auth';

test('agrega una regla compuesta a una categoría, la edita y la borra', async ({ page }) => {
  const name = `Delivery E2E ${Date.now()}`;

  await page.goto('/categorias');
  await page.getByPlaceholder('Nombre de la categoría').fill(name);
  await page.locator('.color-trigger').click();
  await page.locator('.hex-input').fill('e87ba4');
  await page.locator('.picker-backdrop').click();
  await page.getByRole('button', { name: 'Crear categoría' }).click();

  const row = page.locator('.category-row', { hasText: name });
  await row.getByRole('button', { name: 'Reglas' }).click();

  const panel = row.locator('.rules-panel');
  await panel.getByRole('button', { name: '+ Agregar regla' }).click();

  const ruleCard = panel.locator('.rule-card').first();
  await ruleCard.locator('.select-trigger').click();
  await ruleCard.locator('.select-option', { hasText: 'Comercio contiene' }).click();
  await ruleCard.locator('input[placeholder="Palabra clave"]').fill('rappi');
  await ruleCard.getByRole('button', { name: 'Guardar' }).click();

  await expect(ruleCard).toContainText("Comercio contiene 'rappi'");

  await ruleCard.getByRole('button', { name: 'Editar' }).click();
  await ruleCard.getByRole('button', { name: 'Agrupar con Y' }).click();

  const newLeaf = ruleCard.locator('.rule-node-leaf').nth(1);
  await newLeaf.locator('.select-trigger').click();
  await ruleCard.locator('.select-option', { hasText: 'Día de la semana' }).click();
  await newLeaf.locator('.weekday-toggle-day').nth(5).click();

  await ruleCard.getByRole('button', { name: 'Guardar' }).click();
  await expect(ruleCard).toContainText(' Y ');

  await page.reload();
  await row.getByRole('button', { name: 'Reglas' }).click();
  await expect(ruleCard).toContainText(' Y ');

  await ruleCard.getByRole('button', { name: 'Eliminar' }).click();
  await ruleCard.getByRole('button', { name: '¿Confirmar?' }).click();
  await expect(panel.locator('.rule-card')).toHaveCount(0);
});
