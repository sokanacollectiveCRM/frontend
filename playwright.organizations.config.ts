import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'organization-sign-in.spec.ts',
  outputDir: 'test-results/organizations',
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3007', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3007 --strictPort',
    url: 'http://localhost:3007',
    reuseExistingServer: false,
    env: {
      VITE_API_BASE_URL: 'http://localhost:5057',
      VITE_APP_BACKEND_URL: 'http://localhost:5057',
      VITE_USE_CLOUD_RUN: 'false',
      VITE_FIREBASE_API_KEY: 'test-org-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'sokana-org-test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'sokana-org-test',
      VITE_FIREBASE_APP_ID: 'test-org-app',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
