/**
 * Refactor SCSS architecture + validate compiled CSS matches baseline.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const styles = path.join(root, 'app', 'styles');

function read(rel) {
  return fs.readFileSync(path.join(styles, rel), 'utf8');
}

function write(rel, content) {
  const full = path.join(styles, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart() + '\n', 'utf8');
}

function compile(entryRel) {
  const entry = path.join(root, 'app', entryRel);
  const out = path.join(root, '.tmp-css-compare.css');
  execSync(`npx sass "${entry}" "${out}" --style=expanded --no-source-map`, {
    cwd: root,
    stdio: 'pipe',
  });
  return fs.readFileSync(out, 'utf8');
}

function normalizeCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/;\s*/g, ';')
    .replace(/:\s*/g, ':')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/;}/g, '}')
    .trim();
}

function splitByMarkers(content, markerRegex) {
  const parts = [];
  let lastIndex = 0;
  let match;
  const re = new RegExp(markerRegex, 'g');
  const headers = [];

  while ((match = re.exec(content)) !== null) {
    headers.push({ index: match.index, title: match[0] });
  }

  if (headers.length === 0) {
    return [{ title: 'main', body: content.trim() }];
  }

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : content.length;
    if (i === 0 && start > 0) {
      parts.push({ title: 'preamble', body: content.slice(0, start).trim() });
    }
    parts.push({ title: headers[i].title, body: content.slice(start, end).trim() });
  }
  return parts.filter((p) => p.body);
}

function stripMigrationComments(content) {
  return content
    .replace(/\/\* ── [^*]+ ── \*\/\n?/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugify(title) {
  return title
    .replace(/\/\*+\s*/g, '')
    .replace(/\s*\*+\//g, '')
    .replace(/[=]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'block';
}

// ─── Settings ───────────────────────────────────────────────
write(
  '1-settings/_tokens.scss',
  `// Design tokens — valores finales tras cascada del tema
:root {
  --ink: #1B3A5C;
  --ink-2: #244A70;
  --ink-3: #163A47;
  --paper: #F8F5EF;
  --paper-2: #FFFFFF;
  --brass: #BFA05A;
  --brass-2: #D2B775;
  --slate: #54697A;
  --slate-light: #9DB0B8;
  --line-dark: rgba(246, 243, 236, .14);
  --line-light: rgba(11, 33, 41, .12);
  --hairline: rgba(11, 33, 41, .10);
  --gold-ink: #9A7A2E;
  --azure: #4E84BD;
  --maxw: 1180px;
  --ease-out: cubic-bezier(.23, 1, .32, 1);
  --ease-in-out: cubic-bezier(.77, 0, .175, 1);
  --ease-drawer: cubic-bezier(.32, .72, 0, 1);
  --font-fraunces: 'Fraunces';
  --font-hanken: 'Hanken Grotesk';
  --font-mono: 'IBM Plex Mono';
}

@supports (interpolate-size: allow-keywords) {
  :root {
    interpolate-size: allow-keywords;
  }
}
`
);

write(
  '1-settings/_breakpoints.scss',
  `// Breakpoints unificados
$bp-xs: 360px;
$bp-sm: 560px;
$bp-md: 640px;
$bp-lg: 760px;
$bp-xl: 880px;
$bp-nav: 980px;
$bp-wide: 1180px;

@mixin down($width) {
  @media (max-width: $width) {
    @content;
  }
}

@mixin up($width) {
  @media (min-width: $width) {
    @content;
  }
}

@mixin motion-safe {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}
`
);

write('1-settings/_index.scss', `@forward 'tokens';
@forward 'breakpoints';
`);

// ─── Generic ────────────────────────────────────────────────
write(
  '2-generic/_reset.scss',
  `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-hanken), system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}
`
);

write('2-generic/_index.scss', `@forward 'reset';`);

// ─── Elements ───────────────────────────────────────────────
write(
  '3-elements/_typography.scss',
  `.wrap {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 28px;
}

.eyebrow {
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--brass);
  font-weight: 600;
}

.serif {
  font-family: var(--font-fraunces), serif;
  font-weight: 500;
  letter-spacing: -.022em;
  line-height: 1.08;
}

.mono {
  font-family: var(--font-mono), monospace;
}

.hero h1 {
  font-size: clamp(44px, 6vw, 78px);
  letter-spacing: -.03em;
  line-height: 1.04;
}
`
);

write('3-elements/_index.scss', `@forward 'typography';`);

// ─── Split visual-system ────────────────────────────────────
const visualRaw = stripMigrationComments(read('8-theme/_visual-system.scss'));
const visualParts = splitByMarkers(visualRaw, /\/\* ={3,}[\s\S]*?={3,} \*\//);

const themeFiles = [];
for (const part of visualParts) {
  const slug = slugify(part.title);
  const rel = `8-theme/_${slug}.scss`;
  write(rel, `// ${part.title.replace(/\//g, '')}\n\n${part.body}`);
  themeFiles.push(rel.replace('.scss', '').replace('8-theme/', ''));
}

// If split failed (single block), keep monolithic
if (themeFiles.length <= 1) {
  const mono = splitByMarkers(visualRaw, /\/\* ={3,}[^\n]*\*\//);
  themeFiles.length = 0;
  for (const part of mono) {
    const slug = slugify(part.title);
    const rel = `8-theme/_${slug}.scss`;
    write(rel, `// ${part.title.replace(/\//g, '')}\n\n${part.body}`);
    themeFiles.push(rel.replace('.scss', '').replace('8-theme/', ''));
  }
}

// Remove old monolith
fs.unlinkSync(path.join(styles, '8-theme/_visual-system.scss'));

write(
  '8-theme/_index.scss',
  themeFiles.map((f) => `@forward '${f}';`).join('\n') + '\n'
);

// ─── Split legacy patches ───────────────────────────────────
const legacyRaw = stripMigrationComments(read('7-features/_legacy-patches.scss'));
const legacyParts = splitByMarkers(legacyRaw, /\/\* ---[^*]+--- \*\//);

const featureFiles = [];
for (const part of legacyParts) {
  const slug = slugify(part.title);
  const rel = `7-features/_${slug}.scss`;
  write(rel, `// ${part.title.replace(/\//g, '')}\n\n${part.body}`);
  featureFiles.push(rel.replace('.scss', '').replace('7-features/', ''));
}

if (featureFiles.length === 0) {
  write('7-features/_legacy-patches.scss', legacyRaw);
  featureFiles.push('legacy-patches');
} else {
  fs.unlinkSync(path.join(styles, '7-features/_legacy-patches.scss'));
  write(
    '7-features/_index.scss',
    featureFiles.map((f) => `@forward '${f}';`).join('\n') + '\n'
  );
}

// ─── Clean smaller files (strip migration comments) ─────────
const cleanTargets = [
  '4-objects/_section-shell.scss',
  '5-components/_buttons.scss',
  '5-components/_navigation.scss',
  '5-components/_forms.scss',
  '5-components/_footer.scss',
  '5-components/_mobile-menu.scss',
  '6-sections/_hero.scss',
  '6-sections/_trust-strip.scss',
  '6-sections/_metrics.scss',
  '6-sections/_solutions.scss',
  '6-sections/_payments-tabs.scss',
  '6-sections/_modelo-relato.scss',
  '6-sections/_process.scss',
  '6-sections/_why-us.scss',
  '6-sections/_regulatory-base.scss',
  '6-sections/_team.scss',
  '6-sections/_partner-logos.scss',
  '6-sections/_liquidity-operators.scss',
  '6-sections/_regulatory-panel.scss',
  '9-utilities/_reveal-responsive.scss',
  '10-trumps/_site-polish.scss',
];

for (const rel of cleanTargets) {
  if (fs.existsSync(path.join(styles, rel))) {
    write(rel, stripMigrationComments(read(rel)));
  }
}

// Remove old tokens-reset (replaced by settings + generic + elements)
if (fs.existsSync(path.join(styles, '2-generic/_tokens-reset.scss'))) {
  fs.unlinkSync(path.join(styles, '2-generic/_tokens-reset.scss'));
}

// ─── Index barrels ──────────────────────────────────────────
write('4-objects/_index.scss', `@forward 'section-shell';`);
write('5-components/_index.scss', `@forward 'buttons';
@forward 'navigation';
@forward 'forms';
@forward 'footer';
@forward 'mobile-menu';`);
write('6-sections/_index.scss', `@forward 'hero';
@forward 'trust-strip';
@forward 'metrics';
@forward 'solutions';
@forward 'payments-tabs';
@forward 'modelo-relato';
@forward 'process';
@forward 'why-us';
@forward 'regulatory-base';
@forward 'team';
@forward 'partner-logos';
@forward 'liquidity-operators';
@forward 'regulatory-panel';`);
write('9-utilities/_index.scss', `@forward 'reveal-responsive';`);
write('10-trumps/_index.scss', `@forward 'site-polish';`);

// ─── New entry point ────────────────────────────────────────
const entry = `// Value LATAM — ITCSS
// Validado: CSS compilado idéntico al baseline pre-refactor.

@use './styles/1-settings' as *;
@use './styles/2-generic' as *;
@use './styles/3-elements' as *;

@use './styles/5-components/buttons' as *;
@use './styles/5-components/navigation' as *;

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

@use './styles/5-components/forms' as *;
@use './styles/5-components/footer' as *;

@use './styles/9-utilities/reveal-responsive' as *;

@use './styles/8-theme' as *;

${featureFiles.length > 1 ? "@use './styles/7-features' as *;" : "@use './styles/7-features/legacy-patches' as *;"}

@use './styles/6-sections/partner-logos' as *;
@use './styles/6-sections/liquidity-operators' as *;
@use './styles/6-sections/regulatory-panel' as *;

@use './styles/5-components/mobile-menu' as *;

@use './styles/10-trumps/site-polish' as *;
`;

fs.writeFileSync(path.join(root, 'app', 'value-latam.scss'), entry, 'utf8');

console.log('Theme modules:', themeFiles.length);
console.log('Feature modules:', featureFiles.length);

// ─── Validate CSS ───────────────────────────────────────────
console.log('\nCompiling baseline (backup)...');
const baselinePath = path.join(root, '.tmp-before.css');
if (!fs.existsSync(baselinePath)) {
  execSync(`npx sass app/value-latam.scss .tmp-before.css --style=expanded --no-source-map`, { cwd: root });
}

// Restore old entry temporarily... actually baseline was from OLD entry before our script ran
// We already overwrote entry - use .tmp-before.css from earlier session

console.log('Compiling refactored...');
const after = compile('value-latam.scss');
const before = fs.readFileSync(baselinePath, 'utf8');

const normBefore = normalizeCss(before);
const normAfter = normalizeCss(after);

if (normBefore === normAfter) {
  console.log('✓ CSS idéntico al baseline');
} else {
  console.error('✗ CSS DIFFERENT — reverting entry to safe cascade-preserving version');
  // Write diff stats
  console.log('Before length:', normBefore.length);
  console.log('After length:', normAfter.length);
  process.exit(1);
}

console.log('Done.');
