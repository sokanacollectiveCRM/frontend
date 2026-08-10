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
  rawAppEnv === 'production' || rawAppEnv === 'staging' || rawAppEnv === 'development'
    ? rawAppEnv
    : 'development';

const DEFAULT_CLOUD_RUN_API_URL =
  'https://sokana-private-api-634744984887.us-central1.run.app';

/**
 * Gradual cutover flag: when VITE_USE_CLOUD_RUN=true, use Cloud Run API
 * (VITE_CLOUD_RUN_API_URL or default) instead of local/Vercel backend URL.
 */
const useCloudRun = (getEnv('VITE_USE_CLOUD_RUN') ?? '').toLowerCase() === 'true';
const cloudRunApiUrl = (
  getEnv('VITE_CLOUD_RUN_API_URL') ?? DEFAULT_CLOUD_RUN_API_URL
).replace(/\/+$/, '');

/** API base URL: Cloud Run (if flagged), else VITE_API_BASE_URL / VITE_API_URL / VITE_APP_BACKEND_URL. */
export const apiBaseUrl = useCloudRun
  ? cloudRunApiUrl
  : (
      (getEnv('VITE_API_BASE_URL') ?? getEnv('VITE_API_URL') ?? getEnv('VITE_APP_BACKEND_URL'))?.replace(
        /\/+$/,
        ''
      ) || 'http://localhost:5050'
    );

export const isCloudRunApi = useCloudRun;

export const isProd = appEnv === 'production';
export const isDev = appEnv === 'development';
export const isStaging = appEnv === 'staging';
export const appEnvValue: AppEnv = appEnv;
