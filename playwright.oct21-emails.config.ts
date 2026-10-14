import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'oct21-email-previews.spec.ts',
  workers: 1,
  reporter: 'list',
  use: { browserName: 'chromium', screenshot: 'only-on-failure' },
});
