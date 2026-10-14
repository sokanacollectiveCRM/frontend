import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.OCT21_BASE_URL || 'http://localhost:3001';
const useLocalServer = !process.env.OCT21_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'oct21-doula-documents.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 180000,
  reporter: [['list']],
  ...(useLocalServer
    ? {
        webServer: {
          command: 'npm run dev -- --port 3001 --strictPort',
          url: 'http://localhost:3001',
          reuseExistingServer: true,
          env: {
            ...process.env,
            VITE_API_BASE_URL:
              process.env.OCT21_API_BASE_URL || 'http://localhost:5050',
            VITE_APP_BACKEND_URL:
              process.env.OCT21_API_BASE_URL || 'http://localhost:5050',
          },
        },
      }
    : {}),
  use: {
    baseURL,
    video: 'on',
    trace: 'on',
    screenshot: 'on',
    launchOptions: {
      slowMo: 500,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
