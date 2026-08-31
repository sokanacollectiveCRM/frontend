const STORAGE_KEY = 'sokana.session-token';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getSessionAccessToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && value.length > 0) return value;

    if (typeof sessionStorage !== 'undefined') {
      const legacy = sessionStorage.getItem(STORAGE_KEY);
      if (legacy && legacy.length > 0) {
        localStorage.setItem(STORAGE_KEY, legacy);
        sessionStorage.removeItem(STORAGE_KEY);
        return legacy;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function setSessionAccessToken(token: string | null | undefined): void {
  if (!canUseStorage()) return;
  try {
    const trimmed = typeof token === 'string' ? token.trim() : '';
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    // Safari private mode can throw; cookie auth may still work on desktop.
  }
}

export function clearSessionAccessToken(): void {
  setSessionAccessToken(null);
}
