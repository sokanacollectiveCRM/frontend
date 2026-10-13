import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'oct21-doula-documents-live.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 180000,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 15000,
    video: 'off',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
});
