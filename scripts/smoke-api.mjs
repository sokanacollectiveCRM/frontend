#!/usr/bin/env node
/**
 * Smoke test: call GET /health, GET /clients, GET /clients/:id and display status codes.
 * Usage: VITE_API_BASE_URL=https://... node scripts/smoke-api.mjs
 * Optional: VITE_SMOKE_CLIENT_ID=uuid for GET /clients/:id
 */

const base = (process.env.VITE_API_BASE_URL || process.env.VITE_APP_BACKEND_URL || 'http://localhost:5050').replace(/\/+$/, '');
const clientId = process.env.VITE_SMOKE_CLIENT_ID;

async function fetchStatus(path, options = {}) {
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    const res = await fetch(url, { method: 'GET', ...options });
    return { path: path || '/', status: res.status, ok: res.ok };
  } catch (e) {
    return { path: path || '/', status: 0, ok: false, error: e.message };
  }
}

async function main() {
  console.log('Base URL:', base);
  const health = await fetchStatus('/health');
  console.log('GET /health:', health.status, health.ok ? 'OK' : health.error || 'FAIL');
  const clients = await fetchStatus('/clients');
  console.log('GET /clients:', clients.status, clients.ok ? 'OK' : clients.error || 'FAIL');
  if (clientId) {
    const detail = await fetchStatus(`/clients/${clientId}`);
    console.log('GET /clients/:id:', detail.status, detail.ok ? 'OK' : detail.error || 'FAIL');
  } else {
    console.log('GET /clients/:id: (skip, set VITE_SMOKE_CLIENT_ID to test)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
