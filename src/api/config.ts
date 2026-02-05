export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_APP_BACKEND_URL?.replace(/\/+$/, '') || 'http://localhost:5050',
  useLegacyApi: import.meta.env.VITE_USE_LEGACY_API === 'true',
} as const;
