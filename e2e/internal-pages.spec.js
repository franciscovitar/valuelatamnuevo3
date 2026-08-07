import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/financiamiento', title: 'Financiamiento empresarial' },
  { path: '/liquidez', title: 'Inversión y liquidez' },
  { path: '/medios-de-pago', title: 'Medios de pago' },
  { path: '/procesos-ia', title: 'Automatización con IA' },
  { path: '/referenciadores', title: 'Referenciadores' },
  { path: '/como-trabajamos', title: 'Cómo trabajamos' },
];

test.describe('Páginas internas', () => {
  for (const { path, title } of ROUTES) {
    test(`${path} carga, tiene el título esperado y el shell de marketing`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response.ok()).toBeTruthy();

      await expect(page).toHaveTitle(new RegExp(title));
      await expect(page.locator('header.nav')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  }

  test('/privacidad carga fuera del shell de marketing', async ({ page }) => {
    const response = await page.goto('/privacidad');
    expect(response.ok()).toBeTruthy();
  });

  test('una ruta inexistente no revienta y devuelve la página 404 de Next', async ({ page }) => {
    const response = await page.goto('/esta-ruta-no-existe');
    expect(response.status()).toBe(404);
  });
});
