import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SCHEDULING_DEV_BASE_URL || 'http://localhost:3001';

/**
 * Live-dev Playwright for the scheduling MVP.
 *
 * Credentials MUST come from env vars (Jerry plus-addresses). Never commit them.
 *
 *   SCHEDULING_DEV_BASE_URL
 *   SCHEDULING_DEV_DOULA_EMAIL / SCHEDULING_DEV_DOULA_PASSWORD
 *   SCHEDULING_DEV_CLIENT_EMAIL / SCHEDULING_DEV_CLIENT_PASSWORD
 *   SCHEDULING_DEV_ADMIN_EMAIL / SCHEDULING_DEV_ADMIN_PASSWORD
 *   SCHEDULING_DEV_MFA_CODE (optional, if Identity MFA is still on)
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'scheduling-dev.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/reports/scheduling-dev' }],
  ],
  outputDir: 'e2e/test-results/scheduling-dev',
  use: {
    baseURL,
    timezoneId: 'America/Chicago',
    video: 'on',
    screenshot: 'on',
    trace: 'on',
    viewport: { width: 1400, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
