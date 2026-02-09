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

/** API base URL: VITE_API_BASE_URL (prod) or VITE_APP_BACKEND_URL, no trailing slash. */
export const apiBaseUrl = (
  (getEnv('VITE_API_BASE_URL') ?? getEnv('VITE_APP_BACKEND_URL'))?.replace(/\/+$/, '') ||
  'http://localhost:5050'
);

export const isProd = appEnv === 'production';
export const isDev = appEnv === 'development';
export const isStaging = appEnv === 'staging';
export const appEnvValue: AppEnv = appEnv;
