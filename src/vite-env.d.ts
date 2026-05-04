/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BACKEND_URL: string
  readonly VITE_APP_FRONTEND_URL?: string
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
  /** Optional: external URL for client portal "Service Outcomes" link */
  readonly VITE_CLIENT_PORTAL_SERVICE_OUTCOMES_URL?: string
  /** Optional: URL to payment authorization form PDF (same-origin path or absolute URL) */
  readonly VITE_PAYMENT_AUTHORIZATION_FORM_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

