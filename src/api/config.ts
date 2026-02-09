import { apiBaseUrl, isProd } from '@/config/env';

export type AuthMode = 'supabase' | 'cookie';

function getAuthMode(): AuthMode {
  const v = import.meta.env.VITE_AUTH_MODE;
  if (v === 'supabase' || v === 'cookie') return v;
  // Default to cookie: login via backend, avoids Supabase CORS in production
  return 'cookie';
}

export const API_CONFIG = {
  baseUrl: apiBaseUrl,
  useLegacyApi: import.meta.env.VITE_USE_LEGACY_API === 'true',
  isProd,
  authMode: getAuthMode(),
} as const;
