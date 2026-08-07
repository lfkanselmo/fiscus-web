import { test as base, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const TOKEN_STORAGE_KEY = 'fiscus_access_token';

export const test = base.extend<{ authenticatedPage: void }>({
  authenticatedPage: [
    async ({ page, request }, use) => {
      const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@fiscus.app`;
      const response = await request.post(`${API_BASE_URL}/auth/register`, {
        data: { email, password: 'supersecret123' },
      });
      const { access_token: token } = await response.json();

      await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
        TOKEN_STORAGE_KEY,
        token,
      ] as [string, string]);

      await use();
    },
    { auto: true },
  ],
});

export { expect };
