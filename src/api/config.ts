import { apiBaseUrl, isProd } from '@/config/env';

export const API_CONFIG = {
  baseUrl: apiBaseUrl,
  useLegacyApi: import.meta.env.VITE_USE_LEGACY_API === 'true',
  isProd,
} as const;
