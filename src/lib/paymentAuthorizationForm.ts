/**
 * PDF or URL for the client-facing payment authorization form.
 *
 * Set `VITE_PAYMENT_AUTHORIZATION_FORM_URL` to an absolute URL (e.g. S3, CMS).
 * If unset, the app links to `/payment-authorization-form.pdf` — add that file under
 * `public/` in this package so Vite serves it at the site root.
 */
export function getPaymentAuthorizationFormHref(): string {
  const fromEnv = import.meta.env.VITE_PAYMENT_AUTHORIZATION_FORM_URL?.trim();
  if (fromEnv) return fromEnv;
  return '/payment-authorization-form.pdf';
}
