import { expect, test } from '@playwright/test';

test('un visitante sin sesión es redirigido a /login', async ({ page }) => {
  await page.goto('/categorias');

  await expect(page).toHaveURL(/\/login$/);
});

test('registra una cuenta nueva y entra directo al dashboard', async ({ page }) => {
  const email = `e2e-register-${Date.now()}@fiscus.app`;

  await page.goto('/register');
  await page.getByPlaceholder('Correo electrónico').fill(email);
  await page.getByPlaceholder('Contraseña (mínimo 8 caracteres)').fill('supersecret123');
  await page.getByPlaceholder('Confirmar contraseña').fill('supersecret123');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
});

test('el registro rechaza contraseñas que no coinciden', async ({ page }) => {
  await page.goto('/register');
  await page.getByPlaceholder('Correo electrónico').fill(`e2e-mismatch-${Date.now()}@fiscus.app`);
  await page.getByPlaceholder('Contraseña (mínimo 8 caracteres)').fill('supersecret123');
  await page.getByPlaceholder('Confirmar contraseña').fill('otra-clave');

  await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();
});

test('inicia sesión con una cuenta existente y cierra sesión', async ({ page }) => {
  const email = `e2e-login-${Date.now()}@fiscus.app`;

  await page.goto('/register');
  await page.getByPlaceholder('Correo electrónico').fill(email);
  await page.getByPlaceholder('Contraseña (mínimo 8 caracteres)').fill('supersecret123');
  await page.getByPlaceholder('Confirmar contraseña').fill('supersecret123');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByPlaceholder('Correo electrónico').fill(email);
  await page.getByPlaceholder('Contraseña').fill('supersecret123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('link', { name: 'Categorías' })).toBeVisible();
});

test('el login rechaza credenciales incorrectas', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Correo electrónico').fill('nadie@fiscus.app');
  await page.getByPlaceholder('Contraseña').fill('cualquier-cosa');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Correo o contraseña incorrectos.')).toBeVisible();
});
