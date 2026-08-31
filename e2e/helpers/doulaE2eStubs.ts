import { expect, type Page, type Route } from '@playwright/test';
import {
  defaultCorsHeaders,
  installCorsPreflightStub,
  stubAuthMe,
  type StubbedUser,
} from '../fixtures/httpStubs';
import { isApiRequest } from './e2eApiStubs';

type CorsHeaders = ReturnType<typeof defaultCorsHeaders>;

export const DOULA_ACTIVITY_IDS = {
  visible: '10000000-0000-4000-8000-000000000001',
  hidden: '10000000-0000-4000-8000-000000000002',
  visibleFollowUp: '10000000-0000-4000-8000-000000000003',
  ownNote: '10000000-0000-4000-8000-000000000010',
  adminNote1: '10000000-0000-4000-8000-000000000011',
  coDoulaNote: '10000000-0000-4000-8000-000000000012',
  adminNoteNoName: '10000000-0000-4000-8000-000000000013',
  adminNote2: '10000000-0000-4000-8000-000000000014',
} as const;

const COMPLETE_DOULA_PROFILE = {
  id: 'doula-456',
  firstname: 'Sarah',
  lastname: 'Doula',
  email: 'sarah@example.com',
  address: '123 Main St',
  city: 'Chicago',
  state: 'IL',
  country: 'US',
  zip_code: '60601',
  bio: 'Experienced birth doula.',
  race_ethnicity: ['Black or African American'],
};

function isDoulaProfilePath(pathname: string): boolean {
  return pathname === '/api/doulas/profile';
}

function isDoulaClientsListPath(pathname: string): boolean {
  return pathname === '/api/doulas/clients';
}

function isDoulaClientDetailPath(pathname: string): boolean {
  return /^\/api\/doulas\/clients\/[^/]+$/.test(pathname);
}

function isDoulaActivitiesPath(pathname: string): boolean {
  return /^\/api\/doulas\/clients\/[^/]+\/activities$/.test(pathname);
}

function isDoulaActivityPatchPath(pathname: string): boolean {
  return /^\/api\/doulas\/clients\/[^/]+\/activities\/[^/]+$/.test(pathname);
}

function normalizeDoulaActivity(
  activity: Record<string, unknown>,
  clientId: string
) {
  return {
    id: activity.id,
    client_id: clientId,
    type: activity.type ?? 'note',
    description: activity.description ?? activity.content,
    content: activity.content ?? activity.description,
    created_at: activity.created_at ?? activity.createdAt ?? activity.timestamp,
    visible_to_client:
      activity.visible_to_client ?? activity.visibleToClient ?? false,
    createdByName: activity.createdByName ?? activity.authorName,
    created_by_name: activity.created_by_name ?? activity.authorName,
    createdBy: activity.createdBy ?? activity.authorName,
    createdByRole: activity.createdByRole ?? activity.authorType,
    created_by_role: activity.created_by_role ?? activity.authorType,
    metadata: {
      ...(typeof activity.metadata === 'object' && activity.metadata !== null
        ? (activity.metadata as Record<string, unknown>)
        : {}),
      visible_to_client:
        activity.visible_to_client ?? activity.visibleToClient ?? false,
      createdByName: activity.createdByName ?? activity.authorName,
      created_by_name: activity.created_by_name ?? activity.authorName,
      createdByRole: activity.createdByRole ?? activity.authorType,
      created_by_role: activity.created_by_role ?? activity.authorType,
    },
  };
}

export async function stubDoulaSession(
  page: Page,
  user: StubbedUser,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  await installCorsPreflightStub(page, headers);
  await stubAuthMe(page, user, headers);

  await page.route(
    (url) => isDoulaProfilePath(new URL(url).pathname),
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({ ...COMPLETE_DOULA_PROFILE, id: user.id }),
      });
    }
  );
}

export async function stubAssignedClients(
  page: Page,
  clients: Array<Record<string, unknown>>,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const payload = clients.map((client) => ({
    id: client.id,
    firstname: client.firstname ?? client.first_name,
    lastname: client.lastname ?? client.last_name,
    email: client.email,
    phone: client.phone ?? client.phone_number ?? '',
    dueDate: client.dueDate ?? client.due_date ?? '',
    status: client.status ?? 'active',
  }));

  await page.route(
    (url) => {
      const pathname = new URL(url).pathname;
      return (
        isDoulaClientsListPath(pathname) || isDoulaClientDetailPath(pathname)
      );
    },
    (route: Route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }

      const pathname = new URL(route.request().url()).pathname;

      if (isDoulaClientDetailPath(pathname)) {
        const clientId = decodeURIComponent(pathname.split('/').pop() ?? '');
        const client =
          payload.find((row) => String(row.id) === clientId) ?? payload[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({ success: true, data: client }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({ success: true, data: payload }),
      });
    }
  );
}

export async function stubDoulaActivities(
  page: Page,
  clientId: string,
  activities: Record<string, unknown>[],
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const normalized = activities.map((activity) =>
    normalizeDoulaActivity(activity, clientId)
  );

  await page.route(
    (url) => {
      const pathname = new URL(url).pathname;
      return (
        isDoulaActivitiesPath(pathname) || isDoulaActivityPatchPath(pathname)
      );
    },
    (route: Route) => {
      if (!isApiRequest(route)) return route.continue();

      const pathname = new URL(route.request().url()).pathname;
      const method = route.request().method();

      if (method === 'GET' && isDoulaActivitiesPath(pathname)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({ success: true, data: normalized }),
        });
      }

      if (method === 'PATCH' && isDoulaActivityPatchPath(pathname)) {
        const activityId = decodeURIComponent(pathname.split('/').pop() ?? '');
        const body = route.request().postDataJSON() as {
          visibleToClient?: boolean;
        };
        const existing =
          normalized.find((row) => String(row.id) === activityId) ??
          normalized[0];
        const updated = {
          ...existing,
          visible_to_client: body?.visibleToClient === true,
          metadata: {
            ...(existing.metadata as Record<string, unknown>),
            visible_to_client: body?.visibleToClient === true,
          },
        };
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({
            success: true,
            activity: updated,
            data: updated,
          }),
        });
      }

      return route.continue();
    }
  );
}

export async function setupDoulaActivitiesPage(
  page: Page,
  options: {
    user: StubbedUser;
    clientId: string;
    client?: Record<string, unknown>;
    activities: Record<string, unknown>[];
  }
) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  const headers = defaultCorsHeaders();
  await stubDoulaSession(page, options.user, headers);
  await stubAssignedClients(
    page,
    [
      options.client ?? {
        id: options.clientId,
        firstname: 'Jane',
        lastname: 'Client',
        email: 'client@example.com',
        phone: '555-0100',
        dueDate: '2026-09-01',
        status: 'active',
      },
    ],
    headers
  );
  await stubDoulaActivities(
    page,
    options.clientId,
    options.activities,
    headers
  );
}

export function doulaActivitiesPath(clientId: string) {
  return `/doula-dashboard/activities/${clientId}`;
}

export async function waitForDoulaActivitiesLoaded(page: Page) {
  await expect(
    page.getByRole('heading', { name: 'Client Activities' })
  ).toBeVisible();
  await expect(page.getByText('Loading client information...')).toHaveCount(0, {
    timeout: 15_000,
  });
}
