/**
 * Reads an authentication fragment once and removes it from browser history
 * synchronously. Callers may use the returned parameters for the existing
 * authentication flow, but the token-bearing URL is no longer retained.
 */
export function consumeSensitiveHash(
  location: Location,
  history: History
): URLSearchParams {
  const params = new URLSearchParams(location.hash.slice(1));

  if (location.hash) {
    history.replaceState(
      {},
      document.title,
      `${location.pathname}${location.search}`
    );
  }

  return params;
}
