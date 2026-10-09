import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright proof run for the Oct 2026 public intake / request-form pilot fixes.
 *
 * Local (default, used in CI/VM — mocks branding + submit):
 *   npm run test:intake-pilot:e2e
 *
 * After the frontend is deployed, the same spec can be pointed at the live SPA.
 * Submit is still intercepted in the browser, so this does not create real leads:
 *   PLAYWRIGHT_BASE_URL=https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app npm run test:intake-pilot:e2e
 *
 * Do not run the PLAYWRIGHT_BASE_URL command against the real dev site from the
 * Cloud Agent VM. Video is always on (`video: 'on'`).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://localhost:3001';
const isRemoteTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL?.trim());

export default defineConfig({
  testDir: './e2e',
  testMatch: 'request-form-pilot-fixes.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/reports/intake-pilot' }],
  ],
  outputDir: 'e2e/test-results/intake-pilot',

  webServer: isRemoteTarget
    ? undefined
    : {
        command: 'npm run dev -- --port 3001',
        url: 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          VITE_API_BASE_URL: 'http://localhost:5050',
          VITE_APP_BACKEND_URL: 'http://localhost:5050',
          VITE_SUPABASE_URL:
            process.env.VITE_SUPABASE_URL || 'https://example.supabase.co',
          VITE_SUPABASE_ANON_KEY:
            process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key',
        },
      },

  use: {
    baseURL,
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    viewport: { width: 500, height: 900 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 500, height: 900 } },
    },
  ],
});
