import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('carga sin errores de consola graves y muestra los elementos principales', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto('/');
    expect(response.ok()).toBeTruthy();

    await expect(page.locator('header.nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('el CTA principal apunta al formulario de contacto', async ({ page }) => {
    // header.nav .nav-cta { display:none } por debajo de 980px — en mobile
    // el CTA equivalente es .nav-mobile-cta, dentro del menú hamburguesa.
    test.skip(test.info().project.name === 'mobile', 'CTA de escritorio, no existe en el layout mobile');

    await page.goto('/');
    const cta = page.locator('.nav-cta a.btn-primary');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/#contacto');
  });
});
