/**
 * Reorganiza SCSS en arquitectura ITCSS preservando el orden de cascada.
 * Ejecutar: node scripts/reorganize-scss.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const stylesRoot = path.join(root, 'app', 'styles');

function readPartial(relPath) {
  const full = path.join(stylesRoot, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing: ${relPath}`);
  }
  return fs.readFileSync(full, 'utf8');
}

function writeMerged(targetRel, sources, header) {
  const parts = sources.map((src) => {
    const content = readPartial(src);
    return `/* ── ${src} ── */\n${content.trim()}\n`;
  });
  const body = `${header}\n\n${parts.join('\n')}`;
  const target = path.join(stylesRoot, targetRel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body, 'utf8');
  console.log(`  ✓ ${targetRel} (${sources.length} sources)`);
}

const bundles = [
  {
    target: '1-settings/_breakpoints.scss',
    header: '// Breakpoints compartidos — usar en media queries futuras',
    sources: [],
    custom: `// Sass breakpoints (referencia; el CSS actual usa valores literales)
$bp-xs: 360px;
$bp-sm: 560px;
$bp-md: 760px;
$bp-lg: 980px;
$bp-xl: 1180px;
`,
  },
  {
    target: '2-generic/_tokens-reset.scss',
    header: '// Tokens, reset y utilidades tipográficas base',
    sources: ['foundation/_00-tokens-base.scss'],
  },
  {
    target: '5-components/_buttons.scss',
    header: '// Botones',
    sources: ['foundation/_01-buttons.scss'],
  },
  {
    target: '5-components/_navigation.scss',
    header: '// Navegación desktop',
    sources: ['foundation/_02-header.scss'],
  },
  {
    target: '6-sections/_hero.scss',
    header: '// Hero',
    sources: ['foundation/_03-hero.scss'],
  },
  {
    target: '6-sections/_trust-strip.scss',
    header: '// Trust strip / logos intro',
    sources: ['foundation/_04-trust-strip.scss'],
  },
  {
    target: '6-sections/_metrics.scss',
    header: '// Métricas',
    sources: ['foundation/_05-metrics.scss'],
  },
  {
    target: '4-objects/_section-shell.scss',
    header: '// Shell de secciones',
    sources: ['foundation/_06-section-shell.scss'],
  },
  {
    target: '6-sections/_solutions.scss',
    header: '// Soluciones',
    sources: ['foundation/_07-solutions.scss'],
  },
  {
    target: '6-sections/_payments-tabs.scss',
    header: '// Medios de pago (tabs)',
    sources: ['foundation/_08-payments-tabs.scss'],
  },
  {
    target: '6-sections/_modelo-relato.scss',
    header: '// Modelo / relato',
    sources: ['foundation/_09-modelo-relato.scss'],
  },
  {
    target: '6-sections/_process.scss',
    header: '// Proceso',
    sources: ['foundation/_10-process.scss'],
  },
  {
    target: '6-sections/_why-us.scss',
    header: '// Por qué nosotros',
    sources: ['foundation/_11-why-us.scss'],
  },
  {
    target: '6-sections/_regulatory-base.scss',
    header: '// Regulatorio (base)',
    sources: ['foundation/_12-regulatory.scss'],
  },
  {
    target: '6-sections/_team.scss',
    header: '// Equipo',
    sources: ['foundation/_13-team.scss'],
  },
  {
    target: '5-components/_forms.scss',
    header: '// Formulario de contacto',
    sources: ['foundation/_14-contact-form.scss'],
  },
  {
    target: '5-components/_footer.scss',
    header: '// Footer',
    sources: ['foundation/_15-footer.scss'],
  },
  {
    target: '9-utilities/_reveal-responsive.scss',
    header: '// Reveal, tilt, shapes y responsive global',
    sources: ['foundation/_16-reveal-responsive.scss'],
  },
  {
    target: '8-theme/_visual-system.scss',
    header: '// Sistema visual: tema, tipografía, unidades interactivas',
    sources: [
      'visual-overrides/_00-light-theme.scss',
      'visual-overrides/_01-sound-toggle.scss',
      'visual-overrides/_02-technology-hud.scss',
      'visual-overrides/_03-typography-palette.scss',
      'visual-overrides/_04-ai-flagship.scss',
      'visual-overrides/_05-editorial-upgrades.scss',
      'visual-overrides/_06-report-theme.scss',
      'visual-overrides/_07-cover-brain-story.scss',
      'visual-overrides/_08-background-brain-system.scss',
      'visual-overrides/_09-financing-unit.scss',
      'visual-overrides/_10-accent-balance.scss',
      'visual-overrides/_11-unit-reveals.scss',
      'visual-overrides/_12-unit-tree.scss',
      'visual-overrides/_13-model-brain.scss',
      'visual-overrides/_14-liquidity-unit.scss',
      'visual-overrides/_15-payments-page.scss',
      'visual-overrides/_16-scroll-process.scss',
      'visual-overrides/_17-cover-presentation.scss',
      'visual-overrides/_18-logo-base.scss',
      'visual-overrides/_19-premium-buttons.scss',
      'visual-overrides/_20-final-ui-polish.scss',
    ],
  },
  {
    target: '7-features/_legacy-patches.scss',
    header: '// Parches legacy (orden cronológico preservado)',
    sources: [
      '_01-cover-cinematic.scss',
      '_02-responsive-metrics-and-base-logos.scss',
      '_03-logo-section-polish.scss',
      '_04-interactions-forms-privacy.scss',
      '_05-detail-polish.scss',
      '_06-mobile-interactions-and-cards.scss',
      '_07-logo-readability.scss',
      '_08-downloaded-logo-tuning.scss',
      '_09-cover-reference-match.scss',
      '_10-logo-natural-strip.scss',
      '_11-logo-grid-sane-layout.scss',
      '_12-logo-photo-first.scss',
      '_13-regulatory-logo-polish.scss',
      '_14-regulatory-logo-size-reset.scss',
    ],
  },
  {
    target: '6-sections/_partner-logos.scss',
    header: '// Partner logos (componente)',
    sources: ['sections/_partner-logos.scss'],
  },
  {
    target: '6-sections/_liquidity-operators.scss',
    header: '// Operadores de liquidez',
    sources: ['sections/_liquidity-operators.scss'],
  },
  {
    target: '6-sections/_regulatory-panel.scss',
    header: '// Regulatorio (panel final)',
    sources: ['sections/_regulatory.scss'],
  },
  {
    target: '5-components/_mobile-menu.scss',
    header: '// Menú mobile',
    sources: ['components/_mobile-menu.scss'],
  },
  {
    target: '10-trumps/_site-polish.scss',
    header: '// Ajustes finales de producción',
    sources: ['overrides-final/_site-polish.scss'],
  },
];

console.log('Consolidando partials SCSS...\n');

for (const bundle of bundles) {
  if (bundle.custom) {
    const target = path.join(stylesRoot, bundle.target);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bundle.custom, 'utf8');
    console.log(`  ✓ ${bundle.target} (custom)`);
  } else {
    writeMerged(bundle.target, bundle.sources, bundle.header);
  }
}

const entry = `// Value LATAM — arquitectura ITCSS
// Orden de cascada preservado respecto al sistema anterior.

// 1. Settings
@use './styles/1-settings/breakpoints' as *;

// 2. Generic (foundation 00)
@use './styles/2-generic/tokens-reset' as *;

// 5. Components (foundation 01-02, 14-15)
@use './styles/5-components/buttons' as *;
@use './styles/5-components/navigation' as *;

// 6. Sections (foundation 03-13)
@use './styles/6-sections/hero' as *;
@use './styles/6-sections/trust-strip' as *;
@use './styles/6-sections/metrics' as *;
@use './styles/4-objects/section-shell' as *;
@use './styles/6-sections/solutions' as *;
@use './styles/6-sections/payments-tabs' as *;
@use './styles/6-sections/modelo-relato' as *;
@use './styles/6-sections/process' as *;
@use './styles/6-sections/why-us' as *;
@use './styles/6-sections/regulatory-base' as *;
@use './styles/6-sections/team' as *;

// 5. Components (continuación)
@use './styles/5-components/forms' as *;
@use './styles/5-components/footer' as *;

// 9. Utilities (foundation 16 — reveal + responsive global)
@use './styles/9-utilities/reveal-responsive' as *;

// 8. Theme (visual-overrides 00-20)
@use './styles/8-theme/visual-system' as *;

// 7. Features (parches legacy 01-14)
@use './styles/7-features/legacy-patches' as *;

// 6. Sections (componentes finales)
@use './styles/6-sections/partner-logos' as *;
@use './styles/6-sections/liquidity-operators' as *;
@use './styles/6-sections/regulatory-panel' as *;

// 5. Components (mobile nav — gana sobre parches anteriores)
@use './styles/5-components/mobile-menu' as *;

// 10. Trumps
@use './styles/10-trumps/site-polish' as *;
`;

fs.writeFileSync(path.join(root, 'app', 'value-latam.scss'), entry, 'utf8');
console.log('\n✓ app/value-latam.scss actualizado');

// Remove old files/folders
const oldPaths = [
  'foundation',
  'visual-overrides',
  'sections',
  'components',
  'overrides-final',
  ...Array.from({ length: 14 }, (_, i) => `_${String(i + 1).padStart(2, '0')}-*.scss`),
];

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

console.log('\nEliminando archivos antiguos...');
for (const dir of ['foundation', 'visual-overrides', 'sections', 'components', 'overrides-final']) {
  const p = path.join(stylesRoot, dir);
  if (fs.existsSync(p)) {
    rmDir(p);
    console.log(`  ✗ ${dir}/`);
  }
}

for (let i = 1; i <= 14; i++) {
  const prefix = `_${String(i).padStart(2, '0')}-`;
  for (const file of fs.readdirSync(stylesRoot)) {
    if (file.startsWith(prefix) && file.endsWith('.scss')) {
      fs.unlinkSync(path.join(stylesRoot, file));
      console.log(`  ✗ ${file}`);
    }
  }
}

console.log('\nDone.');
