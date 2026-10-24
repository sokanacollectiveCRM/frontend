import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'p15-doula-phone-live.spec.ts',
  workers: 1,
  expect: { timeout: 30000 },
  retries: 0,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    actionTimeout: 15000,
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
});
