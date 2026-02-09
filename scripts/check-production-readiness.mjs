#!/usr/bin/env node
/**
 * Production readiness checklist for split-db (PHI) architecture.
 * Run before deploy. Set env vars or use .env.production.
 * Usage: VITE_API_BASE_URL=https://... VITE_AUTH_MODE=cookie node scripts/check-production-readiness.mjs
 */

const apiUrl = process.env.VITE_API_BASE_URL || process.env.VITE_APP_BACKEND_URL;
const authMode = process.env.VITE_AUTH_MODE;
const appEnv = process.env.VITE_APP_ENV || 'development';

let failed = false;

if (!apiUrl || String(apiUrl).trim() === '') {
  console.error('[FAIL] VITE_API_BASE_URL or VITE_APP_BACKEND_URL must be set for production.');
  failed = true;
} else {
  console.log('[OK] API base URL is set.');
  if (String(apiUrl).includes('localhost') && appEnv === 'production') {
    console.error('[WARN] API URL contains localhost in production. Use Cloud Run URL.');
    failed = true;
  }
}

if (!authMode || (authMode !== 'supabase' && authMode !== 'cookie')) {
  console.error('[FAIL] VITE_AUTH_MODE must be set to "supabase" or "cookie".');
  failed = true;
} else {
  console.log('[OK] VITE_AUTH_MODE is set to', authMode);
}

process.exit(failed ? 1 : 0);
