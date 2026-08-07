import { expect, test } from '@playwright/test';

test('el link de "olvidaste tu contraseña" navega desde login', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();

  await expect(page).toHaveURL(/\/forgot-password$/);
});

test('solicitar recuperación muestra el mensaje genérico de éxito', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.getByPlaceholder('Correo electrónico').fill('cualquiera@fiscus.app');
  await page.getByRole('button', { name: 'Enviar instrucciones' }).click();

  await expect(
    page.getByText('Si el correo existe, se enviaron instrucciones para restablecer tu contraseña.'),
  ).toBeVisible();
});

test('el formulario de recuperación exige un correo válido', async ({ page }) => {
  await page.goto('/forgot-password');

  await expect(page.getByRole('button', { name: 'Enviar instrucciones' })).toBeDisabled();
});

test('restablecer sin token muestra enlace inválido', async ({ page }) => {
  await page.goto('/reset-password');

  await expect(page.getByText('Enlace de recuperación inválido.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restablecer contraseña' })).toBeDisabled();
});

test('restablecer con contraseñas que no coinciden muestra error', async ({ page }) => {
  await page.goto('/reset-password?token=algun-token-de-prueba');
  await page.getByPlaceholder('Nueva contraseña (mínimo 8 caracteres)').fill('supersecret123');
  await page.getByPlaceholder('Confirmar contraseña').fill('otra-clave');

  await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restablecer contraseña' })).toBeDisabled();
});

test('restablecer con un token inválido muestra el error del backend', async ({ page }) => {
  await page.goto('/reset-password?token=token-que-no-existe');
  await page.getByPlaceholder('Nueva contraseña (mínimo 8 caracteres)').fill('supersecret123');
  await page.getByPlaceholder('Confirmar contraseña').fill('supersecret123');
  await page.getByRole('button', { name: 'Restablecer contraseña' }).click();

  await expect(page.getByText('El enlace expiró o no es válido. Solicita uno nuevo.')).toBeVisible();
});
