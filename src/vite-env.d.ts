/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_QUICKBOOKS_CLIENT_ID: string
  // Add other env variables you're using
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 