#!/usr/bin/env node
/* global console, process */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const zeroSha = '0000000000000000000000000000000000000000';
const sourceGlobs = ['*.js', '*.jsx', '*.ts', '*.tsx'];
const refs = fs.readFileSync(0, 'utf8').trim();

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function run(label, command, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const refUpdates = refs
  ? refs.split('\n').map((line) => line.trim().split(/\s+/))
  : [];
let checkedFiles = new Set();

for (const [, localSha, , remoteSha] of refUpdates) {
  if (!localSha || !remoteSha) continue;
  let baseSha = remoteSha;
  if (
    baseSha === zeroSha ||
    spawnSync('git', ['cat-file', '-e', `${baseSha}^{commit}`], {
      stdio: 'ignore',
    }).status !== 0
  ) {
    baseSha = 'origin/main';
  }
  if (
    spawnSync('git', ['cat-file', '-e', `${baseSha}^{commit}`], {
      stdio: 'ignore',
    }).status !== 0
  ) {
    baseSha = `${localSha}^`;
  }
  const files = git([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    baseSha,
    localSha,
    '--',
    ...sourceGlobs,
  ])
    .split('\n')
    .filter(Boolean);
  files.forEach((file) => checkedFiles.add(file));
}

const files = [...checkedFiles];
if (files.length === 0) {
  console.log('No changed JavaScript or TypeScript files in this push.');
  process.exit(0);
}

console.log(`Checking ${files.length} pushed source file(s):`);
files.forEach((file) => console.log(`  ${file}`));
const jsxPattern = /<[A-Za-z][^>]*>/;
const invalidJs = files.filter(
  (file) =>
    file.endsWith('.js') &&
    !file.endsWith('.test.js') &&
    jsxPattern.test(fs.readFileSync(file, 'utf8'))
);
if (invalidJs.length) {
  console.error('Changed .js files contain JSX; rename them to .jsx:');
  invalidJs.forEach((file) => console.error(`  ${file}`));
  process.exit(1);
}

run('ESLint', 'npx', ['eslint', ...files]);
run('Prettier', 'npx', ['prettier', '--check', ...files]);
