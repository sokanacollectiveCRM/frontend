import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'p23-hr-role.spec.ts',
  workers: 1,
  reporter: [['list']],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3023',
    url: 'http://127.0.0.1:3023',
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITE_APP_BACKEND_URL: 'http://localhost:5053',
      VITE_API_BASE_URL: 'http://localhost:5053',
      VITE_AUTH_MODE: 'cookie',
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'fictional-key',
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3023',
    screenshot: 'only-on-failure',
  },
});
