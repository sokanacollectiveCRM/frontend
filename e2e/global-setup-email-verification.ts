import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export default async function globalSetup(): Promise<void> {
  loadEnvFile(resolve(process.cwd(), '.env'));
  loadEnvFile(resolve(process.cwd(), '.env.local'));

  const backendRoot = resolve(process.cwd(), '../../backend');
  const fixtureOut = resolve(
    process.cwd(),
    'e2e/.fixtures/email-verification.json'
  );
  const prepareScript = resolve(
    backendRoot,
    'scripts/e2e/prepare-email-verification-fixture.ts'
  );

  if (!existsSync(prepareScript)) {
    throw new Error(`Missing backend prepare script: ${prepareScript}`);
  }

  const reuseVerifyLink = existsSync(fixtureOut);

  execSync(`npx tsx "${prepareScript}"`, {
    cwd: backendRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_SKIP_VERIFY_LINK: reuseVerifyLink ? '1' : '0',
      E2E_FIXTURE_OUT: fixtureOut,
      E2E_API_BASE_URL: process.env.E2E_API_BASE_URL || 'http://localhost:5050',
      E2E_FRONTEND_URL: process.env.E2E_FRONTEND_URL || 'http://localhost:3001',
      FIREBASE_WEB_API_KEY:
        process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    },
  });
}
