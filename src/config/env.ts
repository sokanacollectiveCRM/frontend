/**
 * Central environment config for production-ready split-db (PHI vs non-PHI) architecture.
 * Reads Vite env vars safely. Prefer VITE_API_BASE_URL for prod Cloud Run; fallback to VITE_APP_BACKEND_URL.
 */

type AppEnv = 'production' | 'staging' | 'development';

function getEnv(key: string): string | undefined {
  try {
    return import.meta.env[key];
  } catch {
    return undefined;
  }
}

const rawAppEnv = (getEnv('VITE_APP_ENV') ?? 'development') as string;
const appEnv: AppEnv =
  rawAppEnv === 'production' ||
  rawAppEnv === 'staging' ||
  rawAppEnv === 'development'
    ? rawAppEnv
    : 'development';

const LOCAL_API_URL = 'http://localhost:5050';

/**
 * Gradual cutover flag: when VITE_USE_CLOUD_RUN=true, use VITE_CLOUD_RUN_API_URL.
 * Production builds never fall back to a hardcoded Cloud Run URL or localhost.
 */
const useCloudRun =
  (getEnv('VITE_USE_CLOUD_RUN') ?? '').toLowerCase() === 'true';

function configuredApiUrl(): string {
  const cloudRun = (getEnv('VITE_CLOUD_RUN_API_URL') ?? '').replace(/\/+$/, '');
  const fromEnv = (
    getEnv('VITE_API_BASE_URL') ??
    getEnv('VITE_API_URL') ??
    getEnv('VITE_APP_BACKEND_URL') ??
    ''
  ).replace(/\/+$/, '');

  if (useCloudRun) {
    if (cloudRun) return cloudRun;
    return import.meta.env.DEV ? LOCAL_API_URL : '';
  }
  if (fromEnv) return fromEnv;
  return import.meta.env.DEV ? LOCAL_API_URL : '';
}

export const apiBaseUrl = configuredApiUrl();

export const isCloudRunApi = useCloudRun;

export const isProd = appEnv === 'production';
export const isDev = appEnv === 'development';
export const isStaging = appEnv === 'staging';
export const appEnvValue: AppEnv = appEnv;

/** Public request form QA control. On in Vite dev; production only with explicit flag. */
export function isRequestTestDataEnabled(): boolean {
  const flagged =
    (getEnv('VITE_ENABLE_REQUEST_TEST_DATA') ?? '').toLowerCase() === 'true';
  if (flagged) return true;
  return Boolean(import.meta.env.DEV);
}
