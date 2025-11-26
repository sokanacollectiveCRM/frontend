/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BACKEND_URL: string
  readonly VITE_APP_FRONTEND_URL?: string // Optional, defaults to window.location.origin
  readonly VITE_STRIPE_PUBLIC_KEY: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


