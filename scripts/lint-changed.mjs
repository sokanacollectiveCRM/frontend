#!/usr/bin/env node
/**
 * Lint/format check for changed source files — mirrors .github/workflows/lint.yaml.
 *
 * Usage:
 *   node scripts/lint-changed.mjs                    # vs origin/main
 *   node scripts/lint-changed.mjs --base main        # vs local main
 *   node scripts/lint-changed.mjs --staged           # staged files only (pre-commit)
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const SOURCE_GLOBS = ['*.js', '*.jsx', '*.ts', '*.tsx'];

function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function parseArgs(argv) {
  let base = 'origin/main';
  let staged = false;
  for (const arg of argv) {
    if (arg === '--staged') staged = true;
    else if (arg.startsWith('--base=')) base = arg.slice('--base='.length);
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/lint-changed.mjs [--base=origin/main] [--staged]`);
      process.exit(0);
    }
  }
  return { base, staged };
}

function listChangedFiles({ base, staged }) {
  const diffArgs = staged
    ? ['diff', '--name-only', '--diff-filter=ACMR', '--cached', '--', ...SOURCE_GLOBS]
    : ['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`, '--', ...SOURCE_GLOBS];

  try {
    const output = run('git', diffArgs);
    return output ? output.split('\n').filter(Boolean) : [];
  } catch (error) {
    if (staged) return [];
    // Fallback when origin/main is unavailable (e.g. first clone).
    try {
      const output = run('git', [
        'diff',
        '--name-only',
        '--diff-filter=ACMR',
        'HEAD~1',
        'HEAD',
        '--',
        ...SOURCE_GLOBS,
      ]);
      return output ? output.split('\n').filter(Boolean) : [];
    } catch {
      console.error('Could not determine changed files. Fetch main and retry:');
      console.error('  git fetch origin main');
      console.error(`  npm run lint:push`);
      process.exit(1);
    }
  }
}

function checkJsxExtensions(files) {
  const invalid = [];
  const jsxPattern = /<[A-Za-z][^>]*>/;
  for (const file of files) {
    if (!file.endsWith('.js') || file.endsWith('.test.js')) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (jsxPattern.test(content)) invalid.push(file);
  }
  if (invalid.length > 0) {
    console.error('These changed .js files contain JSX and must use .jsx:');
    for (const file of invalid) console.error(`  ${file}`);
    process.exit(1);
  }
}

function runCheck(label, cmd, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const { base, staged } = parseArgs(process.argv.slice(2));
const files = listChangedFiles({ base, staged });

if (files.length === 0) {
  console.log(staged ? 'No staged source files to lint.' : `No changed source files vs ${base}.`);
  process.exit(0);
}

console.log(`Checking ${files.length} file(s)${staged ? ' (staged)' : ` vs ${base}`}:`);
for (const file of files) console.log(`  ${file}`);

checkJsxExtensions(files);
runCheck('ESLint', 'npx', ['eslint', ...files]);
runCheck('Prettier', 'npx', ['prettier', '--check', ...files]);

console.log('\n✅ Lint and format checks passed.');
