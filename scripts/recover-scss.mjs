/** Recupera monolitos desde splits rotos y deja el proyecto compilando. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const styles = path.join(__dirname, '..', 'app', 'styles');

function stripBrokenHeader(content) {
  return content
    .replace(/^\/\/[^\n]*={3,}[^\n]*\n(?:[^\n]*\n){0,3}/m, '')
    .replace(/^\/\/[^\n]+\n\/\/[^\n]+\n\/\/[^\n]+\n/m, '')
    .trim();
}

function mergeFromIndex(indexPath, outPath, keepIndex = false) {
  const dir = path.dirname(indexPath);
  const index = fs.readFileSync(indexPath, 'utf8');
  const forwards = [...index.matchAll(/@forward\s+'([^']+)'/g)].map((m) => m[1]);
  const chunks = forwards.map((name) => {
    const file = path.join(dir, `${name}.scss`);
    return stripBrokenHeader(fs.readFileSync(file, 'utf8'));
  });
  fs.writeFileSync(outPath, `// Auto-consolidado — módulos en ${path.basename(path.dirname(outPath))}/\n\n${chunks.join('\n\n')}\n`);
  console.log(`Merged ${forwards.length} → ${path.relative(styles, outPath)}`);

  if (!keepIndex) {
    for (const name of forwards) {
      fs.unlinkSync(path.join(dir, `${name}.scss`));
    }
    fs.unlinkSync(indexPath);
  }
}

mergeFromIndex(
  path.join(styles, '8-theme', '_index.scss'),
  path.join(styles, '8-theme', '_visual-system.scss')
);

mergeFromIndex(
  path.join(styles, '7-features', '_index.scss'),
  path.join(styles, '7-features', '_legacy-patches.scss')
);

// Foundation tokens only (theme sigue sobreescribiendo en visual-system)
fs.writeFileSync(
  path.join(styles, '1-settings', '_tokens.scss'),
  `:root {
  --ink: #0B2129;
  --ink-2: #102D38;
  --ink-3: #163A47;
  --paper: #F6F3EC;
  --paper-2: #FBFAF6;
  --brass: #C49A3A;
  --brass-2: #D8B25A;
  --slate: #5C7480;
  --slate-light: #9DB0B8;
  --line-dark: rgba(246, 243, 236, .14);
  --line-light: rgba(11, 33, 41, .12);
  --maxw: 1180px;
  --ease-out: cubic-bezier(.23, 1, .32, 1);
  --ease-in-out: cubic-bezier(.77, 0, .175, 1);
  --ease-drawer: cubic-bezier(.32, .72, 0, 1);
  --font-fraunces: 'Fraunces';
  --font-hanken: 'Hanken Grotesk';
  --font-mono: 'IBM Plex Mono';
}
`,
  'utf8'
);

fs.writeFileSync(
  path.join(styles, '3-elements', '_typography.scss'),
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
  font-weight: 500;
}

.serif {
  font-family: var(--font-fraunces), serif;
  font-weight: 500;
  letter-spacing: -.01em;
  line-height: 1.08;
}

.mono {
  font-family: var(--font-mono), monospace;
}
`,
  'utf8'
);

fs.writeFileSync(
  path.join(styles, '2-generic', '_reset.scss'),
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
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}
`,
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, '..', 'app', 'value-latam.scss'),
  `// Value LATAM — ITCSS (cascada preservada)

@use './styles/1-settings/breakpoints' as *;
@use './styles/1-settings/tokens' as *;
@use './styles/2-generic/reset' as *;
@use './styles/3-elements/typography' as *;

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
@use './styles/8-theme/visual-system' as *;
@use './styles/7-features/legacy-patches' as *;

@use './styles/6-sections/partner-logos' as *;
@use './styles/6-sections/liquidity-operators' as *;
@use './styles/6-sections/regulatory-panel' as *;

@use './styles/5-components/mobile-menu' as *;
@use './styles/10-trumps/site-polish' as *;
`,
  'utf8'
);

// Remove unused index barrels that forward deleted modules
for (const barrel of ['1-settings/_index.scss', '2-generic/_index.scss', '3-elements/_index.scss']) {
  const p = path.join(styles, barrel);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log('Recovery complete.');
