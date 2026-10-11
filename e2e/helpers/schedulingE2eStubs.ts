import { expect, type Page, type Route } from '@playwright/test';

import {
  defaultCorsHeaders,
  installCorsPreflightStub,
  stubAuthMe,
  type StubbedUser,
} from '../fixtures/httpStubs';
import { isApiRequest } from './e2eApiStubs';

export const SCHEDULING_FIXTURE = {
  doula: {
    id: 'doula-maya-rivers',
    firstname: 'Maya',
    lastname: 'Rivers',
    email: 'maya.rivers@example.com',
    role: 'doula',
  },
  client: {
    id: 'client-jordan-lake',
    firstname: 'Jordan',
    lastname: 'Lake',
    email: 'jordan.lake@example.com',
    role: 'client',
    clientNumber: 'C-1042',
  },
  admin: {
    id: 'admin-sokana',
    firstname: 'Sokana',
    lastname: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
  },
} as const;

export type SchedulingUser = StubbedUser;

type AvailabilityStatus = 'available' | 'unavailable';
type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface StubAvailability {
  id: string;
  doulaId: string;
  startAt: string;
  endAt: string;
  availabilityStatus: AvailabilityStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StubBooking {
  id: string;
  clientId: string;
  doulaId: string;
  requestedBy: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulingStore {
  availability: StubAvailability[];
  bookings: StubBooking[];
  nextId: number;
}

const VISIT_MS = 60 * 60 * 1000;

function headers() {
  return defaultCorsHeaders();
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: headers(),
    body: JSON.stringify(body),
  });
}

function pathnameOf(url: string): string {
  return new URL(url).pathname.replace(/\/+$/, '') || '/';
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function computeSlots(
  store: SchedulingStore,
  doulaId: string,
  from: string,
  to: string
) {
  const fromMs = new Date(from).getTime();
  const toMs = new Date(to).getTime();
  const now = Date.now();
  const windows = store.availability.filter(
    (row) => row.doulaId === doulaId && row.availabilityStatus === 'available'
  );
  const blockers = [
    ...store.availability.filter(
      (row) =>
        row.doulaId === doulaId && row.availabilityStatus === 'unavailable'
    ),
    ...store.bookings.filter(
      (row) =>
        row.doulaId === doulaId &&
        (row.status === 'pending' || row.status === 'approved')
    ),
  ];

  const slots: Array<{ startAt: string; endAt: string }> = [];
  for (const window of windows) {
    let cursor = new Date(window.startAt).getTime();
    const windowEnd = new Date(window.endAt).getTime();
    while (cursor + VISIT_MS <= windowEnd) {
      const slotEnd = cursor + VISIT_MS;
      const inRange = cursor >= fromMs && slotEnd <= toMs && cursor >= now;
      const blocked = blockers.some((row) =>
        overlaps(
          cursor,
          slotEnd,
          new Date(row.startAt).getTime(),
          new Date(row.endAt).getTime()
        )
      );
      if (inRange && !blocked) {
        slots.push({
          startAt: new Date(cursor).toISOString(),
          endAt: new Date(slotEnd).toISOString(),
        });
      }
      cursor = slotEnd;
    }
  }
  return slots;
}

function bookingConflict(
  store: SchedulingStore,
  doulaId: string,
  startAt: string,
  endAt: string
): { status: number; error: string; code: string } | null {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const inside = store.availability.some(
    (row) =>
      row.doulaId === doulaId &&
      row.availabilityStatus === 'available' &&
      new Date(row.startAt).getTime() <= start &&
      end <= new Date(row.endAt).getTime()
  );
  if (!inside) {
    return {
      status: 409,
      error: 'Requested time is outside an available window',
      code: 'OUTSIDE_WINDOW',
    };
  }
  const blackout = store.availability.some(
    (row) =>
      row.doulaId === doulaId &&
      row.availabilityStatus === 'unavailable' &&
      overlaps(
        start,
        end,
        new Date(row.startAt).getTime(),
        new Date(row.endAt).getTime()
      )
  );
  if (blackout) {
    return {
      status: 409,
      error: 'Requested time overlaps a blackout',
      code: 'BLACKOUT',
    };
  }
  const busy = store.bookings.some(
    (row) =>
      row.doulaId === doulaId &&
      (row.status === 'pending' || row.status === 'approved') &&
      overlaps(
        start,
        end,
        new Date(row.startAt).getTime(),
        new Date(row.endAt).getTime()
      )
  );
  if (busy) {
    return {
      status: 409,
      error: 'Requested time overlaps another visit',
      code: 'OVERLAP',
    };
  }
  return null;
}

function decorateBooking(booking: StubBooking) {
  return {
    ...booking,
    doulaName: 'Maya Rivers',
    clientFirstName: SCHEDULING_FIXTURE.client.firstname,
    clientNumber: SCHEDULING_FIXTURE.client.clientNumber,
  };
}

function completeDoulaProfile(user: SchedulingUser) {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    address: '123 Lake Shore Dr',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    zip_code: '60601',
    bio: 'Test Doula Maya Rivers',
    pronouns: 'she/her',
    race_ethnicity: ['Black or African American'],
    languages_other_than_english: ['Spanish'],
    account_status: 'approved',
    profile_picture: null,
  };
}

export function createSchedulingStore(): SchedulingStore {
  return {
    availability: [],
    bookings: [],
    nextId: 1,
  };
}

export async function installSchedulingStubs(
  page: Page,
  store: SchedulingStore,
  user: SchedulingUser
) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  const cors = headers();
  await installCorsPreflightStub(page, cors);

  await page.route('http://localhost:5050/**', (route) => {
    if (!isApiRequest(route)) return route.continue();
    const path = pathnameOf(route.request().url());
    if (path === '/auth/me' || path === '/api/auth/me') {
      return route.continue();
    }
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors, body: '' });
    }
    return json(route, { success: true, data: [] });
  });

  await stubAuthMe(page, user, cors);

  await page.route(
    (url) => pathnameOf(url) === '/api/doulas/profile',
    (route) => {
      if (!isApiRequest(route)) return route.continue();
      return json(route, completeDoulaProfile(user));
    }
  );

  await page.route(
    (url) => {
      const path = pathnameOf(url);
      return (
        path === '/api/doulas/availability' ||
        /^\/api\/doulas\/availability\/[^/]+$/.test(path)
      );
    },
    (route) => {
      if (!isApiRequest(route)) return route.continue();
      const path = pathnameOf(route.request().url());
      const method = route.request().method();

      if (method === 'GET' && path === '/api/doulas/availability') {
        return json(route, {
          availabilityStatus: {
            status: 'available',
            reason: null,
            startAt: null,
            endAt: null,
          },
          records: store.availability.filter(
            (row) => row.doulaId === SCHEDULING_FIXTURE.doula.id
          ),
        });
      }

      if (method === 'POST' && path === '/api/doulas/availability') {
        const body = route.request().postDataJSON() as {
          startAt: string;
          endAt: string;
          availabilityStatus?: AvailabilityStatus;
          reason?: string | null;
        };
        const now = new Date().toISOString();
        const record: StubAvailability = {
          id: `avail-${store.nextId++}`,
          doulaId: SCHEDULING_FIXTURE.doula.id,
          startAt: body.startAt,
          endAt: body.endAt,
          availabilityStatus: body.availabilityStatus || 'available',
          reason: body.reason ?? null,
          createdAt: now,
          updatedAt: now,
        };
        store.availability.push(record);
        return json(route, { record }, 201);
      }

      const id = path.split('/').pop() || '';
      if (method === 'DELETE') {
        store.availability = store.availability.filter((row) => row.id !== id);
        return json(route, { success: true });
      }
      return route.continue();
    }
  );

  await page.route(
    (url) =>
      /^\/api\/scheduling\/client\/doulas\/[^/]+\/slots$/.test(pathnameOf(url)),
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      const requestUrl = new URL(route.request().url());
      const doulaId = requestUrl.pathname.split('/')[5];
      const slots = computeSlots(
        store,
        doulaId,
        requestUrl.searchParams.get('from') || new Date().toISOString(),
        requestUrl.searchParams.get('to') ||
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      );
      return json(route, { success: true, data: slots });
    }
  );

  await page.route(
    (url) => pathnameOf(url) === '/api/scheduling/client/bookings',
    (route) => {
      if (!isApiRequest(route)) return route.continue();
      if (route.request().method() === 'GET') {
        return json(route, {
          success: true,
          data: store.bookings
            .filter((row) => row.clientId === SCHEDULING_FIXTURE.client.id)
            .map(decorateBooking),
        });
      }
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON() as {
          doulaId: string;
          startAt: string;
          endAt: string;
          notes?: string;
        };
        const conflict = bookingConflict(
          store,
          body.doulaId,
          body.startAt,
          body.endAt
        );
        if (conflict) {
          return json(route, conflict, conflict.status);
        }
        const now = new Date().toISOString();
        const booking: StubBooking = {
          id: `booking-${store.nextId++}`,
          clientId: SCHEDULING_FIXTURE.client.id,
          doulaId: body.doulaId,
          requestedBy: SCHEDULING_FIXTURE.client.id,
          startAt: body.startAt,
          endAt: body.endAt,
          status: 'pending',
          notes: body.notes ?? null,
          createdAt: now,
          updatedAt: now,
        };
        store.bookings.push(booking);
        return json(
          route,
          { success: true, data: decorateBooking(booking) },
          201
        );
      }
      return route.continue();
    }
  );

  await page.route(
    (url) => pathnameOf(url) === '/api/scheduling/doula/bookings',
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      return json(route, {
        success: true,
        data: store.bookings
          .filter((row) => row.doulaId === SCHEDULING_FIXTURE.doula.id)
          .map(decorateBooking),
      });
    }
  );

  await page.route(
    (url) => pathnameOf(url) === '/api/scheduling/admin/bookings',
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      const requestUrl = new URL(route.request().url());
      const status = requestUrl.searchParams.get('status');
      const doulaId = requestUrl.searchParams.get('doulaId');
      const rows = store.bookings.filter((row) => {
        if (status && row.status !== status) return false;
        if (doulaId && row.doulaId !== doulaId) return false;
        return true;
      });
      return json(route, { success: true, data: rows.map(decorateBooking) });
    }
  );

  await page.route(
    (url) =>
      /^\/api\/scheduling\/admin\/doulas\/[^/]+\/availability$/.test(
        pathnameOf(url)
      ),
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      const doulaId = pathnameOf(route.request().url()).split('/')[5];
      return json(route, {
        success: true,
        data: store.availability.filter((row) => row.doulaId === doulaId),
      });
    }
  );

  await page.route(
    (url) => /^\/api\/scheduling\/bookings\/[^/]+$/.test(pathnameOf(url)),
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'PATCH') {
        return route.continue();
      }
      const id = pathnameOf(route.request().url()).split('/').pop() || '';
      const body = route.request().postDataJSON() as { status: BookingStatus };
      const booking = store.bookings.find((row) => row.id === id);
      if (!booking) {
        return json(route, { error: 'Not found' }, 404);
      }
      if (body.status === 'approved') {
        const conflict = bookingConflict(
          store,
          booking.doulaId,
          booking.startAt,
          booking.endAt
        );
        const overlappingOther = store.bookings.some(
          (row) =>
            row.id !== booking.id &&
            row.doulaId === booking.doulaId &&
            (row.status === 'pending' || row.status === 'approved') &&
            overlaps(
              new Date(booking.startAt).getTime(),
              new Date(booking.endAt).getTime(),
              new Date(row.startAt).getTime(),
              new Date(row.endAt).getTime()
            )
        );
        if (overlappingOther || (conflict && conflict.code === 'BLACKOUT')) {
          return json(
            route,
            conflict || { error: 'Overlap', code: 'OVERLAP' },
            409
          );
        }
      }
      booking.status = body.status;
      booking.updatedAt = new Date().toISOString();
      return json(route, { success: true, data: decorateBooking(booking) });
    }
  );

  await page.route(
    (url) => {
      const path = pathnameOf(url);
      return (
        path === `/clients/${SCHEDULING_FIXTURE.client.id}` ||
        path === `/api/clients/${SCHEDULING_FIXTURE.client.id}`
      );
    },
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      return json(route, {
        success: true,
        data: {
          id: SCHEDULING_FIXTURE.client.id,
          firstname: SCHEDULING_FIXTURE.client.firstname,
          lastname: SCHEDULING_FIXTURE.client.lastname,
          email: SCHEDULING_FIXTURE.client.email,
          status: 'contract',
          contract_status: 'contract',
          has_signed_contract: true,
        },
      });
    }
  );

  await page.route(
    (url) =>
      pathnameOf(url) ===
        `/clients/${SCHEDULING_FIXTURE.client.id}/assigned-doulas` ||
      pathnameOf(url) ===
        `/api/clients/${SCHEDULING_FIXTURE.client.id}/assigned-doulas`,
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      return json(route, {
        doulas: [
          {
            id: 'assign-maya-jordan',
            doulaId: SCHEDULING_FIXTURE.doula.id,
            assignedAt: '2026-10-01T00:00:00.000Z',
            status: 'active',
            role: 'primary',
            doula: {
              id: SCHEDULING_FIXTURE.doula.id,
              firstname: SCHEDULING_FIXTURE.doula.firstname,
              lastname: SCHEDULING_FIXTURE.doula.lastname,
              email: SCHEDULING_FIXTURE.doula.email,
            },
          },
        ],
      });
    }
  );

  await page.route(
    (url) =>
      pathnameOf(url) === '/clients/team/doulas' ||
      pathnameOf(url) === '/api/clients/team/doulas',
    (route) => {
      if (!isApiRequest(route) || route.request().method() !== 'GET') {
        return route.continue();
      }
      return json(route, {
        doulas: [
          {
            id: SCHEDULING_FIXTURE.doula.id,
            firstname: SCHEDULING_FIXTURE.doula.firstname,
            lastname: SCHEDULING_FIXTURE.doula.lastname,
            email: SCHEDULING_FIXTURE.doula.email,
          },
        ],
      });
    }
  );
}

export async function openAsUser(
  page: Page,
  store: SchedulingStore,
  user: SchedulingUser,
  path: string
) {
  await installSchedulingStubs(page, store, user);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

export async function waitForSchedulePage(page: Page) {
  await expect(page.getByRole('heading', { name: 'Schedule' })).toBeVisible();
  await expect(page.getByText('Loading schedule...')).toHaveCount(0, {
    timeout: 15_000,
  });
}
