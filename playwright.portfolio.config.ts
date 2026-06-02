import { defineConfig } from '@playwright/test';
import {
  AUTH_STORAGE_PATH,
  BASE_URL,
  getAuthMode,
  PORTFOLIO_VIEWPORT,
  SCREENSHOT_OUTPUT_DIR,
} from './e2e/portfolio/config';

const authMode = getAuthMode();
const useStorageState = authMode === 'storage' ? AUTH_STORAGE_PATH : undefined;

/**
 * Playwright config dedicated to portfolio asset capture (not CI regression tests).
 */
export default defineConfig({
  testDir: './e2e/portfolio',
  testMatch: /capture-portfolio\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],

  webServer: {
    command: 'npm run dev -- --port 3001',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  use: {
    baseURL: BASE_URL,
    viewport: PORTFOLIO_VIEWPORT,
    screenshot: 'off',
    trace: 'off',
    video: 'off',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    ...(useStorageState ? { storageState: useStorageState } : {}),
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'portfolio',
      testMatch: /capture-portfolio\.spec\.ts/,
      dependencies: authMode === 'storage' ? ['setup'] : [],
    },
  ],

  metadata: {
    screenshotOutputDir: SCREENSHOT_OUTPUT_DIR,
    authMode,
  },
});
