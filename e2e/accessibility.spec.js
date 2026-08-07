import { test, expect } from '@playwright/test';

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('la home es utilizable y el contenido principal es visible sin animar', async ({ page }) => {
    await page.goto('/');

    // Con reduced motion los modulos de scroll llaman setVisible/setAllHomeVisible
    // de inmediato (ver lib/scroll/home/utils.js): el contenido no depende de
    // que una animacion dispare para poder leerse.
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('una página interna también es usable con reduced motion', async ({ page }) => {
    await page.goto('/financiamiento');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Accesibilidad básica', () => {
  test('los campos del formulario tienen label asociado', async ({ page }) => {
    await page.goto('/');

    for (const id of ['n', 'e', 't', 'emp', 'obj', 'm']) {
      const field = page.locator(`#${id}`);
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveCount(1);
      await expect(field).toHaveCount(1);
    }
  });

  test('el botón de menú mobile expone aria-controls hacia la navegación real', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuBtn = page.locator('.menu-btn');
    const controls = await menuBtn.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveCount(1);
  });

  test('el trigger del dropdown de Soluciones es navegable por teclado', async ({ page }) => {
    // Foco por teclado es un flujo de escritorio; el emulador tactil
    // (isMobile) no lo prueba de forma representativa.
    test.skip(test.info().project.name === 'mobile', 'flujo de teclado, no de touch');

    await page.goto('/');

    await page.locator('#nav-solutions-trigger').focus();
    await expect(page.locator('#nav-solutions-trigger')).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#nav-solutions-trigger')).toHaveAttribute('aria-expanded', 'true');
  });

  test('las imágenes decorativas del header usan alt vacío o descriptivo, nunca ausente', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('header.nav img');
    const count = await images.count();

    for (let i = 0; i < count; i += 1) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});
