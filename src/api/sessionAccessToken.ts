const STORAGE_KEY = 'sokana.session-token';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

export function getSessionAccessToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function setSessionAccessToken(token: string | null | undefined): void {
  if (!canUseStorage()) return;
  try {
    const trimmed = typeof token === 'string' ? token.trim() : '';
    if (!trimmed) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    // Safari private mode can throw; cookie auth may still work on desktop.
  }
}

export function clearSessionAccessToken(): void {
  setSessionAccessToken(null);
}
