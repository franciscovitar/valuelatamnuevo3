import { defineConfig, devices } from '@playwright/test';

/*
 * Suite minima: protege los flujos de mayor riesgo (nav, formulario, rutas
 * internas, accesibilidad basica, reduced motion), no reemplaza verificacion
 * visual. Ver docs/refactor-maintainability-report.md seccion 7.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /*
   * `next dev` compila bajo demanda: con el conteo de workers por defecto
   * (uno por núcleo) varias paginas piden compilación al mismo tiempo y
   * algunos `page.goto` directamente agotan el timeout esperando "load".
   * No es una animación inestable ni un bug de los tests — es contención del
   * propio servidor de desarrollo. Limitar workers lo evita sin depender de
   * qué server esté sirviendo `webServer.url`.
   */
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    // Build de producción: sin compilación bajo demanda, sirve mucho más
    // rápido y estable bajo carga concurrente que `next dev`. Si ya hay un
    // server respondiendo en :3000 (dev o prod), reuseExistingServer lo usa
    // tal cual, para no forzar un build en cada iteración local.
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
