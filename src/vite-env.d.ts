/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BACKEND_URL: string
  readonly VITE_APP_FRONTEND_URL?: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  /** Prod Cloud Run URL; fallback: VITE_APP_BACKEND_URL */
  readonly VITE_API_BASE_URL?: string
  /** Same as VITE_API_BASE_URL (alias for backend URL) */
  readonly VITE_API_URL?: string
  /** "production" | "staging" | "development" */
  readonly VITE_APP_ENV?: string
  /** "supabase" (Bearer token) | "cookie" (credentials: include) */
  readonly VITE_AUTH_MODE?: 'supabase' | 'cookie'
  /** Optional: client id for smoke test GET /clients/:id */
  readonly VITE_SMOKE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


