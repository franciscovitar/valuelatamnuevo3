import { test, expect } from '@playwright/test';

/*
 * No pega contra Resend real: intercepta /api/contact. El formulario usa
 * `noValidate` (validacion propia en runtime/leadCapture.js), asi que estos
 * tests cubren esa logica, no la validacion nativa del navegador.
 *
 * El formulario se revela con scroll (lib/scroll/home/contact.js: filas en
 * opacity:0 hasta que el ScrollTrigger dispara, luego un timeline de ~0.7s +
 * stagger). Sin esperar a que asiente, Playwright ve el boton "unstable"
 * (todavia animando) y el click falla o queda pendiente. `prepareForm` deja
 * el formulario listo para interactuar de verdad.
 */
async function prepareForm(page) {
  await page.goto('/');
  await page.locator('form').scrollIntoViewIfNeeded();
  await expect(page.locator('form button[type="submit"]')).toBeEnabled();
  await page.waitForTimeout(1200);
}

async function fillValidForm(page) {
  await page.fill('#n', 'Ada Lovelace');
  await page.fill('#e', 'ada@example.com');
  await page.fill('#t', '+54 9 11 5555-5555');
  await page.fill('#emp', 'Analytical Engines SA');
  await page.selectOption('#obj', 'Financiamiento');
}

test.describe('Formulario de contacto', () => {
  // runtime/leadCapture.js usa field.toggleAttribute('aria-invalid', invalid):
  // un atributo booleano, no un string "true"/"false" — presente y vacío
  // cuando es invalido, ausente cuando no.

  test('bloquea el envío con campos obligatorios vacíos y marca el primero inválido', async ({ page }) => {
    await prepareForm(page);
    await page.locator('form button[type="submit"]').click();

    const nombre = page.locator('#n');
    await expect(nombre).toHaveAttribute('aria-invalid', '');
    await expect(nombre).toBeFocused();
    await expect(page.locator('.vl2-form-feedback')).toHaveClass(/is-error/);
  });

  test('rechaza un email con formato inválido', async ({ page }) => {
    await prepareForm(page);
    await fillValidForm(page);
    await page.fill('#e', 'no-es-un-email');
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator('#e')).toHaveAttribute('aria-invalid', '');
  });

  test('envío exitoso: deshabilita el botón mientras envía y muestra éxito', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await new Promise((r) => setTimeout(r, 150));
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await prepareForm(page);
    await fillValidForm(page);

    const submit = page.locator('form button[type="submit"]');
    await submit.click();

    await expect(submit).toBeDisabled();
    await expect(page.locator('.vl2-form-feedback')).toHaveClass(/is-success/, { timeout: 5000 });
    await expect(submit).toBeEnabled();
  });

  test('error del servidor: rehabilita el botón y muestra el estado de error', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({ status: 500, json: { ok: false, error: 'Server error' } });
    });

    await prepareForm(page);
    await fillValidForm(page);
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator('.vl2-form-feedback')).toHaveClass(/is-error/, { timeout: 5000 });
    await expect(page.locator('form button[type="submit"]')).toBeEnabled();
  });

  test('el campo honeypot está oculto por posición (no display:none) y fuera del tab order', async ({ page }) => {
    // .hp-field usa position:absolute + left:-10000px (visible para
    // Playwright/lectores de pantalla sin JS, invisible en pantalla) en vez
    // de display:none, para no delatar el honeypot a bots simples.
    await page.goto('/');
    const honeypot = page.locator('#website');

    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(honeypot.locator('xpath=ancestor::div[contains(@class,"hp-field")]')).toHaveAttribute('aria-hidden', 'true');

    const box = await honeypot.boundingBox();
    expect(box.x).toBeLessThan(0);
  });
});
