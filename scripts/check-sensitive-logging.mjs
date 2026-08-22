#!/usr/bin/env node
/**
 * CI gate: disallow direct console.log/console.debug in application source.
 * Use @/utils/logger or @/utils/safeLog instead.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');

const ALLOWLIST = new Set([
  path.join(SRC, 'utils/logger.ts'),
]);

const TEST_PATTERN = /\.(test|spec)\.[tj]sx?$/;
const FORBIDDEN = /\bconsole\.(log|debug)\s*\(/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      walk(full, out);
    } else if (/\.[tj]sx?$/.test(entry.name) && !TEST_PATTERN.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  if (ALLOWLIST.has(file)) continue;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (FORBIDDEN.test(line)) {
      violations.push({
        file: path.relative(path.join(__dirname, '..'), file),
        line: index + 1,
        text: line.trim(),
      });
    }
  });
}

if (violations.length) {
  console.error('Sensitive logging check failed: console.log/debug in src/');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.text}`);
  }
  console.error(`\nTotal: ${violations.length} violation(s). Use safeLog or logger.`);
  process.exit(1);
}

console.log('Sensitive logging check passed (no console.log/debug in src/).');
