import { test, expect } from '@playwright/test';

test.describe('Navegación desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  // El dropdown/foco por teclado es un flujo de puntero fino + teclado; se
  // prueba contra el proyecto desktop. El emulador táctil (isMobile) tiene su
  // propia cobertura abajo, con su propio patrón de interacción.
  test.skip(({ isMobile }) => isMobile, 'cubierto por "Navegación mobile"');

  test('el dropdown de Soluciones abre, expone sus links y cierra con Escape', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('#nav-solutions-trigger');
    const menu = page.locator('#nav-solutions-menu');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.locator('a[href="/financiamiento"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('navegar a una página interna desde el dropdown', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-solutions-trigger').click();
    await page.locator('#nav-solutions-menu a[href="/financiamiento"]').click();

    await expect(page).toHaveURL(/\/financiamiento$/);
    await expect(page.locator('header.nav')).toBeVisible();
  });

  test('el link "Inicio" tiene aria-current cuando está activo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links a[href="/"]')).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Navegación mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('el menú abre, muestra los links y cierra con el botón', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('.menu-btn');
    // navigationCards.js aplica la clase 'menu-open' sobre header.nav (y
    // sobre <body>), no sobre .nav-links — .nav-links solo queda sin
    // atributo `inert` mientras el menu esta abierto.
    const header = page.locator('header.nav');

    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(header).toHaveClass(/menu-open/);
    await expect(page.locator('.nav-links')).not.toHaveAttribute('inert');

    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape cierra el menú abierto', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('.menu-btn');

    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('el dropdown de Soluciones abre dentro del menú mobile y navega', async ({ page }) => {
    await page.goto('/');
    await page.locator('.menu-btn').click();

    const trigger = page.locator('#nav-solutions-trigger');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.locator('#nav-solutions-menu a[href="/liquidez"]').click();
    await expect(page).toHaveURL(/\/liquidez$/);
  });
});
