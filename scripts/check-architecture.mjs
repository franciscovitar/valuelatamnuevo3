#!/usr/bin/env node
/*
 * Guardrail de arquitectura. Reporta deuda, no la inventa: mientras dure la
 * migracion de app/styles/10-trumps y 7-features (ver docs/refactor-
 * maintainability-report.md), va a reportar muchas violaciones reales — ese
 * es el punto. Sirve para medir progreso y evitar que la limpieza retroceda,
 * no para bloquear `npm run check` hasta que la migracion este terminada.
 *
 * Uso: node scripts/check-architecture.mjs [--fail-on-new]
 *   --fail-on-new  sale con codigo 1 si el conteo total supera el registrado
 *                  en scripts/architecture-baseline.json (lo crea si no existe).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASELINE_PATH = path.join(import.meta.dirname, 'architecture-baseline.json');

/* Carpetas legacy: no deben reaparecer una vez que la migracion las borre. */
const FORBIDDEN_DIRS = [
  'app/styles/10-trumps',
  'app/styles/7-features',
];

/*
 * Literales de color: se permiten solo en la fuente unica y en excepciones
 * tecnicas. rgb(var(--x-rgb) / alpha) es el patron correcto para
 * transparencia (ver CLAUDE.md) y no cuenta como literal: el lookahead
 * negativo lo excluye para no inflar el conteo con ~680 usos legitimos.
 */
const COLOR_PATTERN = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*(?!var\()[^)]*\)|\bhsla?\(\s*(?!var\()[^)]*\)/g;
const COLOR_SCSS_ALLOWLIST = new Set([
  'app/styles/1-settings/_palette.scss',
]);
const COLOR_JS_ALLOWLIST = new Set([
  // Vacio a proposito: cero mirrors cromaticos en JS es el objetivo (Fase 2).
]);

/* font-family: solo el loader/foundation puede declarar familias. */
const FONT_FAMILY_PATTERN = /font-family\s*:\s*[^;]+;/g;
const FONT_ALLOWLIST = new Set([
  'app/styles/1-settings/_tokens.scss',
  'app/layout.jsx',
]);

/* Breakpoints canonicos: solo el registry Sass y (cuando exista) el registry JS. */
const BREAKPOINT_NUMBERS = ['360', '560', '640', '760', '880', '980', '981', '1100', '1160', '1180'];
const BREAKPOINT_PATTERN = new RegExp(`(?<![\\d.])(${BREAKPOINT_NUMBERS.join('|')})px\\b`, 'g');
const BREAKPOINT_ALLOWLIST = new Set([
  'app/styles/1-settings/_breakpoints.scss',
]);

/* !important: deliberado y documentado solo donde ya se decidio que es deuda conocida. */
const IMPORTANT_ALLOWLIST_DIRS = [
  'app/styles/10-trumps',
];

function walk(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git' || entry === 'out') continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, out);
    else if (exts.some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function report(violations, title) {
  if (!violations.length) return;
  console.log(`\n${title} (${violations.length})`);
  for (const v of violations.slice(0, 40)) console.log(`  ${v}`);
  if (violations.length > 40) console.log(`  ...y ${violations.length - 40} mas`);
}

const scssFiles = walk(path.join(ROOT, 'app/styles'), ['.scss']);
const jsFiles = [
  ...walk(path.join(ROOT, 'app'), ['.js', '.jsx']),
  ...walk(path.join(ROOT, 'components'), ['.js', '.jsx']),
  ...walk(path.join(ROOT, 'lib'), ['.js']),
];

const violations = { colors: [], fonts: [], breakpoints: [], important: [], forbiddenDirs: [] };

for (const dir of FORBIDDEN_DIRS) {
  if (existsSync(path.join(ROOT, dir))) {
    violations.forbiddenDirs.push(`${dir} deberia estar eliminado (migracion pendiente, no reaparecer una vez borrado)`);
  }
}

for (const file of scssFiles) {
  const r = rel(file);
  const src = readFileSync(file, 'utf8');
  if (!COLOR_SCSS_ALLOWLIST.has(r)) {
    for (const m of src.matchAll(COLOR_PATTERN)) {
      violations.colors.push(`${r}: ${m[0].slice(0, 40)}`);
    }
  }
  if (!FONT_ALLOWLIST.has(r)) {
    for (const m of src.matchAll(FONT_FAMILY_PATTERN)) {
      violations.fonts.push(`${r}: ${m[0].trim().slice(0, 60)}`);
    }
  }
  if (!BREAKPOINT_ALLOWLIST.has(r)) {
    for (const m of src.matchAll(BREAKPOINT_PATTERN)) {
      violations.breakpoints.push(`${r}: ${m[0]}`);
    }
  }
  const isAllowedImportant = IMPORTANT_ALLOWLIST_DIRS.some((d) => r.startsWith(d));
  if (!isAllowedImportant) {
    const count = (src.match(/!important/g) || []).length;
    if (count) violations.important.push(`${r}: ${count} uso(s)`);
  }
}

for (const file of jsFiles) {
  const r = rel(file);
  const src = readFileSync(file, 'utf8');
  if (!COLOR_JS_ALLOWLIST.has(r)) {
    for (const m of src.matchAll(COLOR_PATTERN)) {
      violations.colors.push(`${r}: ${m[0].slice(0, 40)}`);
    }
  }
}

report(violations.forbiddenDirs, 'Carpetas legacy que no deberian existir');
report(violations.colors, 'Colores literales fuera de la fuente unica');
report(violations.fonts, 'font-family fuera de foundation/layout');
report(violations.breakpoints, 'Breakpoints crudos fuera del registry');
report(violations.important, '!important fuera de la allowlist');

const total = Object.values(violations).reduce((sum, arr) => sum + arr.length, 0);
console.log(`\nTotal: ${total} violaciones`);

const failOnNew = process.argv.includes('--fail-on-new');

if (!existsSync(BASELINE_PATH)) {
  writeFileSync(BASELINE_PATH, JSON.stringify({ total }, null, 2));
  console.log(`\nBaseline creada en ${rel(BASELINE_PATH)}: ${total}.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
console.log(`Baseline registrada: ${baseline.total}.`);

if (failOnNew && total > baseline.total) {
  console.error(`\nLa deuda aumento (${baseline.total} -> ${total}). No se permite sumar violaciones nuevas.`);
  process.exit(1);
}

if (total < baseline.total) {
  writeFileSync(BASELINE_PATH, JSON.stringify({ total }, null, 2));
  console.log(`Progreso: baseline actualizada a ${total}.`);
}

process.exit(0);
