import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTFOLIO_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Repo root: sokana-crm-frontend/ */
export const REPO_ROOT = path.resolve(PORTFOLIO_DIR, '../../..');

/**
 * Centralized output folder for all portfolio screenshots.
 * Override with PORTFOLIO_SCREENSHOT_DIR if needed.
 */
export const SCREENSHOT_OUTPUT_DIR =
  process.env.PORTFOLIO_SCREENSHOT_DIR ??
  path.join(REPO_ROOT, 'portfolio-assets', 'sokana-all-screenshots');

/** Portfolio capture viewport (consulting deck / case-study friendly). */
export const PORTFOLIO_VIEWPORT = {
  width: 1600,
  height: 1200,
} as const;

export const BASE_URL =
  process.env.PORTFOLIO_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';

/**
 * Auth modes:
 * - stub: API mocks + fake admin session (repeatable, no backend)
 * - storage: reuse saved storageState from auth.setup.ts
 * - login: automated email/password login (set PORTFOLIO_ADMIN_EMAIL / PORTFOLIO_ADMIN_PASSWORD)
 */
export type PortfolioAuthMode = 'stub' | 'storage' | 'login';

export function getAuthMode(): PortfolioAuthMode {
  const raw = (process.env.PORTFOLIO_AUTH_MODE ?? 'stub').toLowerCase();
  if (raw === 'storage' || raw === 'login' || raw === 'stub') return raw;
  return 'stub';
}

export const AUTH_STORAGE_PATH = path.join(PORTFOLIO_DIR, '.auth', 'admin.json');

/** Default wait budgets (ms). */
export const TIMEOUTS = {
  navigation: 30_000,
  dashboard: 25_000,
  table: 20_000,
  modal: 15_000,
  stabilize: 500,
} as const;
