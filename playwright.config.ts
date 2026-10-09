import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Sokana CRM E2E tests.
 *
 * Default target is the local Vite server at http://localhost:3001.
 * Override with PLAYWRIGHT_BASE_URL to hit a deployed frontend (webServer is skipped).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://localhost:3001';
const isRemoteTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL?.trim());

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  webServer: isRemoteTarget
    ? undefined
    : {
        command: 'npm run dev -- --port 3001',
        url: 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
