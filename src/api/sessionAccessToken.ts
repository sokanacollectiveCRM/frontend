const STORAGE_KEY = 'sokana.session-token';

/** Remove any legacy browser-stored session tokens (HttpOnly cookie is authoritative). */
function purgeLegacyBrowserToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Safari private mode can throw; ignore.
  }
}

/** @deprecated Session JWT lives in HttpOnly cookie `sokana_session_token` only. */
export function getSessionAccessToken(): string | null {
  purgeLegacyBrowserToken();
  return null;
}

/** @deprecated No-op — do not persist session tokens in browser storage. */
export function setSessionAccessToken(_token: string | null | undefined): void {
  purgeLegacyBrowserToken();
}

/** Clears legacy local/session storage entries from pre-cookie auth. */
export function clearSessionAccessToken(): void {
  purgeLegacyBrowserToken();
}
