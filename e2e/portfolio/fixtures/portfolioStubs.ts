import type { Page, Route } from '@playwright/test';
import { defaultCorsHeaders, installCorsPreflightStub } from '../../fixtures/httpStubs';
import {
  CALENDAR_EVENTS,
  DASHBOARD_STATS,
  DOULA_ASSIGNMENTS,
  DOULA_DIRECTORY,
  INVOICES,
  PAYMENTS,
  PORTFOLIO_ADMIN,
  PORTFOLIO_CLIENT_DETAIL,
  PORTFOLIO_CLIENT_ID,
  PORTFOLIO_CLIENT_LIST,
  QUICKBOOKS_CUSTOMERS,
  RECONCILIATION_ROWS,
  TEAM_MEMBERS,
} from './portfolioData';

function isApiRequest(route: Route): boolean {
  const t = route.request().resourceType();
  return t === 'fetch' || t === 'xhr';
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: defaultCorsHeaders(),
    body: JSON.stringify(body),
  });
}

/**
 * Installs repeatable API stubs so portfolio screenshots render rich UI
 * without a live backend. Pair with PORTFOLIO_AUTH_MODE=stub.
 */
export async function installPortfolioStubs(page: Page): Promise<void> {
  const headers = defaultCorsHeaders();
  await installCorsPreflightStub(page, headers);

  // General API stubs (registered first → lower priority than auth handler below).
  await page.route('**/*', async (route) => {
    if (!isApiRequest(route)) {
      return route.continue();
    }

    const url = new URL(route.request().url());
    const { pathname } = url;
    const method = route.request().method();

    // Dashboard
    if (pathname.endsWith('/api/dashboard/stats') && method === 'GET') {
      return json(route, { success: true, data: DASHBOARD_STATS });
    }
    if (pathname.includes('/api/dashboard/calendar') && method === 'GET') {
      return json(route, { success: true, data: CALENDAR_EVENTS });
    }

    // Clients list + detail
    if ((pathname === '/clients' || pathname === '/api/clients') && method === 'GET') {
      return json(route, { success: true, data: PORTFOLIO_CLIENT_LIST, meta: { count: PORTFOLIO_CLIENT_LIST.length } });
    }
    if (
      (pathname === `/clients/${PORTFOLIO_CLIENT_ID}` ||
        pathname === `/api/clients/${PORTFOLIO_CLIENT_ID}`) &&
      method === 'GET'
    ) {
      return json(route, { success: true, data: PORTFOLIO_CLIENT_DETAIL });
    }
    if (pathname.includes(`/clients/${PORTFOLIO_CLIENT_ID}/activities`) && method === 'GET') {
      return json(route, {
        success: true,
        data: [
          {
            id: 'act-1',
            clientId: PORTFOLIO_CLIENT_ID,
            type: 'note',
            description: 'Initial intake completed; insurance verified.',
            timestamp: '2026-05-01T10:00:00Z',
            metadata: { category: 'milestone', createdByName: 'Nancy Cowans', createdByRole: 'admin' },
          },
        ],
      });
    }

    // Doulas directory + assignments
    if (pathname.includes('/api/doulas') && !pathname.includes('assignments') && method === 'GET') {
      return json(route, {
        success: true,
        data: { data: DOULA_DIRECTORY, meta: { limit: 200, offset: 0, count: DOULA_DIRECTORY.length } },
      });
    }
    if (pathname.includes('/api/doula-assignments') && method === 'GET') {
      return json(route, {
        success: true,
        data: {
          data: DOULA_ASSIGNMENTS,
          meta: { limit: 50, offset: 0, count: DOULA_ASSIGNMENTS.length },
        },
      });
    }

    // Payments / invoices / reconciliation
    if (pathname.includes('/api/payments') && method === 'GET') {
      return json(route, { success: true, data: PAYMENTS });
    }
    if (pathname.includes('/api/invoices') && method === 'GET') {
      return json(route, { success: true, data: INVOICES });
    }
    if (pathname.includes('/api/financial/reconciliation') && method === 'GET') {
      return json(route, {
        success: true,
        data: RECONCILIATION_ROWS,
        summary: {
          total_invoice_count: 2,
          total_invoice_amount: 3250,
          total_paid_count: 1,
          total_pending_count: 1,
          payment_count: 2,
          payment_total_amount: 3250,
        },
      });
    }

    // Team — API returns a raw array (see teams.tsx fetchTeam)
    if (pathname.includes('/clients/team/all') && method === 'GET') {
      return json(route, TEAM_MEMBERS);
    }

    // QuickBooks
    if (pathname.endsWith('/quickbooks/status') && method === 'GET') {
      const connected = url.searchParams.get('connected') !== '0';
      return json(route, { connected });
    }
    if (pathname.includes('/quickbooks/customers') && method === 'GET') {
      return json(route, { success: true, data: QUICKBOOKS_CUSTOMERS });
    }
    if (pathname.includes('/quickbooks/customers/invoiceable') && method === 'GET') {
      return json(route, {
        success: true,
        data: PORTFOLIO_CLIENT_LIST.map((c) => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
        })),
      });
    }

    // CSV export (clients toolbar)
    if (pathname.includes('/clients/fetchCSV') && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: { ...headers, 'content-type': 'text/csv' },
        body: 'first_name,last_name,email\nJordan,Rivera,jordan.rivera@example.com\n',
      });
    }

    return route.continue();
  });

  // Register last so this runs first: cookie-mode UserContext expects a bare user JSON body.
  await page.route('**/auth/me', async (route) => {
    if (route.request().method() !== 'GET' || !isApiRequest(route)) {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({ ...PORTFOLIO_ADMIN }),
    });
  });
}

/** Force QuickBooks disconnected UI for OAuth workflow screenshot. */
export async function stubQuickBooksDisconnected(page: Page): Promise<void> {
  await page.route('**/quickbooks/status', (route) => {
    if (!isApiRequest(route)) return route.continue();
    return json(route, { connected: false });
  });
}

/** Force QuickBooks connected state. */
export async function stubQuickBooksConnected(page: Page): Promise<void> {
  await page.route('**/quickbooks/status', (route) => {
    if (!isApiRequest(route)) return route.continue();
    return json(route, { connected: true });
  });
}
