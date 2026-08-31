/** Accept only same-app relative paths for post-login redirects. */
export function safePostLoginPath(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (value.startsWith('/login') || value.startsWith('/auth/')) return null;
  return value;
}
