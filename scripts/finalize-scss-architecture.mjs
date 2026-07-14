/**
 * Split theme + features into maintainable modules.
 * Validates normalized CSS equivalence after each step.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const styles = path.join(root, 'app', 'styles');

function compile() {
  const out = path.join(root, '.tmp-css-current.css');
  execSync(`npx sass app/value-latam.scss "${out}" --style=expanded --no-source-map`, {
    cwd: root,
    stdio: 'pipe',
  });
  return fs.readFileSync(out, 'utf8');
}

function normalize(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/:\s+/g, ':')
    .replace(/;\s+/g, ';')
    .trim();
}

function assertSame(baseline, label) {
  const current = normalize(compile());
  const base = normalize(baseline);
  if (current !== base) {
    console.error(`✗ CSS changed after: ${label}`);
    process.exit(1);
  }
  console.log(`✓ CSS unchanged: ${label}`);
}

function writeModule(dir, name, body) {
  const rel = path.join(dir, `_${name}.scss`);
  fs.writeFileSync(rel, `${body.trim()}\n`, 'utf8');
  return name;
}

function sliceByAnchors(content, anchors) {
  const chunks = [];
  for (let i = 0; i < anchors.length; i++) {
    const { name, start } = anchors[i];
    const end = i + 1 < anchors.length ? anchors[i + 1].start : content.length;
    const body = content.slice(start, end).trim();
    if (body) chunks.push({ name, body });
  }
  return chunks;
}

function buildForwardEntry(dir, names, label) {
  const lines = [`// ${label}`, '', ...names.map((n) => `@use '${n}' as *;`), ''];
  fs.writeFileSync(path.join(dir, '_index.scss'), lines.join('\n'), 'utf8');
}

const baseline = compile();
console.log('Baseline CSS length:', normalize(baseline).length);

// ─── Split 8-theme ───────────────────────────────────────────
const themeContent = fs.readFileSync(path.join(styles, '8-theme/_visual-system.scss'), 'utf8');

const themeAnchors = [
  { name: 'light-theme', start: themeContent.indexOf(':root { --hairline') },
  { name: 'sound-toggle', start: themeContent.indexOf('.sound-toggle{position:fixed') },
  { name: 'technology-hud', start: themeContent.indexOf('.hero-viz::before,.hero-viz::after{content:') },
  { name: 'typography-palette', start: themeContent.indexOf(':root {\n  --paper:#F8F5EF') },
  { name: 'ai-flagship', start: themeContent.indexOf('.ai{background:var(--ink)') },
  { name: 'editorial', start: themeContent.indexOf('section{padding:108px 0}') },
  { name: 'report-theme', start: themeContent.indexOf('/* ============================================================\n     ===== TEMA INFORME') },
  { name: 'brain-story', start: themeContent.indexOf('.brain-stage{position:relative') },
  { name: 'navy-global', start: themeContent.indexOf('html{background:#03090f') },
  { name: 'financing', start: themeContent.indexOf('.fin-lede{font-size:18px') },
  { name: 'accent-balance', start: themeContent.indexOf('.eyebrow,.bs-kicker,.join-sub-eyebrow{color:#8fb2d6}') },
  { name: 'unit-reveals', start: themeContent.indexOf('.reveal-grid .collapsed{display:none}') },
  { name: 'unit-tree', start: themeContent.indexOf('.utree-section .sec-sub{color:rgba(246,243,236,.78)') },
  { name: 'model-brain', start: themeContent.indexOf('.model-stage{margin-top:30px}') },
  { name: 'liquidity', start: themeContent.indexOf('/* Inversion & Liquidez: dos negocios */') },
  { name: 'payments-ui', start: themeContent.indexOf('/* Medios: pagina de pagos */') },
  { name: 'scroll-process', start: themeContent.indexOf('/* Proceso: cerebro que se construye al scrollear */') },
  { name: 'cover-presentation', start: themeContent.indexOf('.cover{background:#01040a') },
  { name: 'logos', start: themeContent.indexOf('.rel-logo{height:56px;padding:0 20px') },
  { name: 'buttons-premium', start: themeContent.indexOf('.btn{ position:relative; overflow:hidden') },
  { name: 'ui-polish', start: themeContent.indexOf('.pay-group{margin-top:30px}') },
].filter((a) => a.start >= 0);

const themeDir = path.join(styles, '8-theme');
const themeNames = sliceByAnchors(themeContent, themeAnchors).map(({ name, body }) =>
  writeModule(themeDir, name, body)
);

buildForwardEntry(themeDir, themeNames, 'Tema visual — orden de cascada');
fs.unlinkSync(path.join(themeDir, '_visual-system.scss'));

// ─── Split 7-features ────────────────────────────────────────
const legacyContent = fs.readFileSync(path.join(styles, '7-features/_legacy-patches.scss'), 'utf8');

const featureAnchors = [
  { name: 'cover-cinematic', start: legacyContent.indexOf('.vl2-wa {') },
  { name: 'metrics-logos-base', start: legacyContent.indexOf('/* responsive metrics polish */') },
  { name: 'interactions', start: legacyContent.indexOf('/* final responsive and interaction polish */') },
  { name: 'detail-polish', start: legacyContent.indexOf('/* final detail polish - 2026-07-01 */') },
  { name: 'mobile-cards', start: legacyContent.indexOf('/* final requested polish - whatsapp menu cover cards form */') },
  { name: 'logo-tuning', start: legacyContent.indexOf('/* final logo readability polish */') },
  { name: 'regulatory-logos', start: legacyContent.indexOf('/* regulatory logo final polish */') },
].filter((a) => a.start >= 0);

const featureDir = path.join(styles, '7-features');
const featureNames = sliceByAnchors(legacyContent, featureAnchors).map(({ name, body }) =>
  writeModule(featureDir, name, body)
);

buildForwardEntry(featureDir, featureNames, 'Features legacy — orden cronológico');
fs.unlinkSync(path.join(featureDir, '_legacy-patches.scss'));

// Update entry
const entry = fs.readFileSync(path.join(root, 'app/value-latam.scss'), 'utf8')
  .replace("@use './styles/8-theme/visual-system' as *;", "@use './styles/8-theme' as *;")
  .replace("@use './styles/7-features/legacy-patches' as *;", "@use './styles/7-features' as *;");
fs.writeFileSync(path.join(root, 'app/value-latam.scss'), entry);

assertSame(baseline, 'module split');

// ─── Remove dead light-theme overrides (keep :root vars) ─────
const lightPath = path.join(themeDir, '_light-theme.scss');
let light = fs.readFileSync(lightPath, 'utf8');
const deadStart = light.indexOf('body{background:var(--paper-2)}');
if (deadStart >= 0) {
  const soundIdx = light.indexOf('.sound-toggle{');
  if (soundIdx > deadStart) {
    light = light.slice(0, deadStart).trim() + '\n';
    fs.writeFileSync(lightPath, light + '\n');
    assertSame(baseline, 'remove dead light-theme overrides');
    console.log('Removed superseded light-theme surface rules');
  }
}

// ─── Settings: mixins ────────────────────────────────────────
fs.writeFileSync(
  path.join(styles, '1-settings/_mixins.scss'),
  `@use 'breakpoints' as *;

@mixin panel-surface($bg: rgba(255, 255, 255, .045), $border: rgba(246, 243, 236, .12)) {
  background: $bg;
  border: 1px solid $border;
}

@mixin text-muted($alpha: .80) {
  color: rgba(246, 243, 236, $alpha);
}

@mixin mono-label {
  font-family: var(--font-mono), monospace;
  letter-spacing: .16em;
  text-transform: uppercase;
}
`,
  'utf8'
);

// Remove orphan barrels
for (const f of ['4-objects/_index.scss', '5-components/_index.scss', '6-sections/_index.scss', '9-utilities/_index.scss', '10-trumps/_index.scss']) {
  const p = path.join(styles, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log('\nTheme modules:', themeNames.length);
console.log('Feature modules:', featureNames.length);
console.log('Done.');
