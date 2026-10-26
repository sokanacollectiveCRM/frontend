import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'organization-memberships.spec.ts',
  workers: 1,
  reporter: [['list']],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3024',
    url: 'http://127.0.0.1:3024',
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITE_APP_BACKEND_URL: 'http://localhost:5054',
      VITE_API_BASE_URL: 'http://localhost:5054',
      VITE_AUTH_MODE: 'cookie',
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'fictional-key',
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3024',
    screenshot: 'only-on-failure',
  },
});
