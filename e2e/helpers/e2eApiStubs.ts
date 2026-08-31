import type { Page, Route } from '@playwright/test';
import {
  defaultCorsHeaders,
  installCorsPreflightStub,
  stubAuthMe,
  type StubbedUser,
} from '../fixtures/httpStubs';

export const BACKEND_ORIGIN = 'http://localhost:5050';

type CorsHeaders = ReturnType<typeof defaultCorsHeaders>;

export function isApiRequest(route: Route): boolean {
  const t = route.request().resourceType();
  return t === 'fetch' || t === 'xhr';
}

export function apiEnvelope(data: unknown, count?: number) {
  return JSON.stringify({
    success: true,
    data,
    meta: { count: count ?? (Array.isArray(data) ? data.length : 1) },
  });
}

export function toCanonicalListClient(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    first_name: raw.first_name ?? raw.firstname ?? raw.firstName,
    last_name: raw.last_name ?? raw.lastname ?? raw.lastName,
    email: raw.email,
    phone_number: raw.phone_number ?? raw.phoneNumber ?? raw.phone,
    status: raw.status,
    service_needed: raw.service_needed ?? raw.serviceNeeded,
    requested_at:
      raw.requested_at ?? raw.requestedAt ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? raw.updatedAt ?? new Date().toISOString(),
    matched_at: raw.matched_at ?? raw.matchedAt,
    ...raw,
  };
}

export async function stubAdminSession(
  page: Page,
  user: StubbedUser,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await installCorsPreflightStub(page, headers);
  await stubAuthMe(page, user, headers);
}

/** Stub canonical GET /clients list. */
export async function stubClientsList(
  page: Page,
  clients: Record<string, unknown>[],
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const payload = clients.map(toCanonicalListClient);
  await page.route(
    (url) => {
      try {
        const pathname = new URL(url).pathname;
        return pathname === '/clients' || pathname === '/api/clients';
      } catch {
        return false;
      }
    },
    (route) => {
      if (!isApiRequest(route)) return route.continue();
      if (route.request().method() !== 'GET') return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: apiEnvelope(payload),
      });
    }
  );
}

/** Stub canonical GET /clients/:id detail. */
export async function stubClientDetail(
  page: Page,
  client: Record<string, unknown>,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const clientId = String(client.id);
  const payload = toCanonicalListClient(client);
  await page.route(
    (url) => {
      try {
        const pathname = new URL(url).pathname;
        return (
          pathname === `/clients/${clientId}` ||
          pathname === `/api/clients/${clientId}`
        );
      } catch {
        return false;
      }
    },
    (route) => {
      if (!isApiRequest(route)) return route.continue();
      if (route.request().method() !== 'GET') return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: apiEnvelope(payload),
      });
    }
  );
}

/** Stub billing panel requests opened from LeadProfileModal. */
export async function stubClientBillingWorkflow(
  page: Page,
  clientId: string,
  options: { onFile?: boolean } = {},
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const onFile = options.onFile ?? false;

  await page.route(
    (url) => {
      const pathname = new URL(url).pathname;
      return (
        pathname === `/clients/${clientId}/billing/payment-schedule` ||
        pathname === `/api/clients/${clientId}/billing/payment-schedule`
      );
    },
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: apiEnvelope([]),
      });
    }
  );

  await page.route(
    (url) => {
      const pathname = new URL(url).pathname;
      return (
        pathname === `/api/payment-methods/${clientId}` ||
        pathname === `/payment-methods/${clientId}`
      );
    },
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            required: true,
            on_file: onFile,
            status: onFile ? 'active' : 'missing',
            quickbooks_customer_id: 'QB-123',
            payment_method_reference: null,
            card_brand: onFile ? 'Visa' : null,
            last4: onFile ? '4242' : null,
            exp_month: onFile ? 12 : null,
            exp_year: onFile ? 2028 : null,
            last_verified_at: null,
            source: 'quickbooks',
            message: onFile
              ? 'Card is on file in QuickBooks'
              : 'Card is not on file in QuickBooks',
          },
        }),
      });
    }
  );
}
