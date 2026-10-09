import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { defineConfig, devices } from '@playwright/test';

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const frontendEnv = {
  ...loadEnvFile(resolve(process.cwd(), '.env')),
  ...loadEnvFile(resolve(process.cwd(), '.env.local')),
};

/**
 * Email verification E2E — records video for manual-style review.
 *
 * Prereqs:
 * - Backend on E2E_API_BASE_URL (default :5050) with email-verification code
 * - Firebase Admin ADC + FIREBASE_WEB_API_KEY (or VITE_FIREBASE_API_KEY)
 * - globalSetup writes e2e/.fixtures/email-verification.json
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'email-verification-flow.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  globalSetup: './e2e/global-setup-email-verification.ts',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/reports/email-verification' }],
  ],
  outputDir: 'e2e/test-results/email-verification',

  webServer: {
    command: 'npm run dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      ...frontendEnv,
      VITE_API_BASE_URL:
        process.env.E2E_API_BASE_URL ||
        frontendEnv.VITE_APP_BACKEND_URL ||
        'http://localhost:5050',
      VITE_APP_BACKEND_URL:
        process.env.E2E_API_BASE_URL ||
        frontendEnv.VITE_APP_BACKEND_URL ||
        'http://localhost:5050',
    },
  },

  use: {
    baseURL: process.env.E2E_FRONTEND_URL || 'http://localhost:3001',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 20_000,
    launchOptions: {
      slowMo: process.env.E2E_SLOW_MO ? Number(process.env.E2E_SLOW_MO) : 250,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
