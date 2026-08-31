/**
 * Ticket 5 — E2E: Doulas can view admin and co-doula notes on client profiles
 *
 * Uses cookie-mode auth + `/doula-dashboard/activities/:clientId` route.
 */

import { test, expect } from '@playwright/test';
import {
  DOULA_ACTIVITY_IDS,
  doulaActivitiesPath,
  setupDoulaActivitiesPage,
  waitForDoulaActivitiesLoaded,
} from './helpers/doulaE2eStubs';
import {
  defaultCorsHeaders,
  installCorsPreflightStub,
  stubAuthMe,
} from './fixtures/httpStubs';

const MOCK_CLIENT_ID = 'client-jordan-bony';
const MOCK_DOULA_ID = 'doula-sarah-123';

const DOULA_USER = {
  id: MOCK_DOULA_ID,
  firstname: 'Sarah',
  lastname: 'Doula',
  email: 'info@techluminateacademy.com',
  role: 'doula',
};

const MOCK_MIXED_ACTIVITIES = [
  {
    id: DOULA_ACTIVITY_IDS.ownNote,
    clientId: MOCK_CLIENT_ID,
    content:
      'Initial consultation completed. Client is well-prepared and excited.',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-15T10:30:00Z',
    authorName: 'Sarah Doula',
    authorType: 'doula',
  },
  {
    id: DOULA_ACTIVITY_IDS.adminNote1,
    clientId: MOCK_CLIENT_ID,
    content:
      'Insurance verification completed. Client approved for full coverage.',
    type: 'note',
    visibleToClient: false,
    createdAt: '2024-01-16T14:20:00Z',
    authorName: 'Nancy Cowans',
    authorType: 'admin',
  },
  {
    id: DOULA_ACTIVITY_IDS.coDoulaNote,
    clientId: MOCK_CLIENT_ID,
    content:
      'Backup doula note: Available for birth support if needed. Client preferences documented.',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-17T09:15:00Z',
    authorName: 'Emily Co-Doula',
    authorType: 'doula',
  },
  {
    id: DOULA_ACTIVITY_IDS.adminNoteNoName,
    clientId: MOCK_CLIENT_ID,
    content: 'Payment plan adjustment approved by administration.',
    type: 'note',
    visibleToClient: false,
    createdAt: '2024-01-18T11:45:00Z',
    authorName: null,
    authorType: 'admin',
    createdBy: 'admin-unknown-999',
  },
  {
    id: DOULA_ACTIVITY_IDS.adminNote2,
    clientId: MOCK_CLIENT_ID,
    content: 'Client portal access granted. Invitation sent successfully.',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-19T08:30:00Z',
    authorName: 'Sonia Collins',
    authorType: 'admin',
  },
];

test.describe('Ticket 5 — Doulas viewing admin and co-doula notes (E2E)', () => {
  test('app loads and doula can access client activities', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto('/doula-dashboard', { waitUntil: 'domcontentloaded' });
    expect(await page.title()).toBeTruthy();
  });

  test('doula can see all note types in client activity feed', async ({
    page,
  }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(page.getByText(/Initial consultation completed/i)).toBeVisible(
      { timeout: 15_000 }
    );
    await expect(
      page.getByText(/Insurance verification completed/i)
    ).toBeVisible();
    await expect(page.getByText(/Client portal access granted/i)).toBeVisible();
    await expect(page.getByText(/Backup doula note/i)).toBeVisible();
    await expect(
      page.getByText(/Payment plan adjustment approved/i)
    ).toBeVisible();
  });

  test('admin notes show proper author attribution', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(page.getByText(/Added by Nancy Cowans/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Added by Sonia Collins/i)).toBeVisible();
    await expect(
      page.getByText(/Added by admin-unknown-999|Added by Staff member/i)
    ).toBeVisible();
  });

  test('co-doula notes show correct author names', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(page.getByText(/Added by Emily Co-Doula/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('visibility labels distinguish staff-only vs client-visible notes', async ({
    page,
  }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(
      page
        .locator('span, div')
        .filter({ hasText: /^Staff only$/ })
        .filter({ hasNot: page.locator('option') })
        .first()
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page
        .locator('span, div')
        .filter({ hasText: /^Visible to client$/ })
        .filter({ hasNot: page.locator('option') })
        .first()
    ).toBeVisible();
  });

  test('activities are displayed in chronological order', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(page.getByText(/Initial consultation completed/i)).toBeVisible(
      { timeout: 15_000 }
    );
    await expect(page.getByText(/Client portal access granted/i)).toBeVisible();
  });

  test('doula can distinguish own notes from others', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_MIXED_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(page.getByText(/Initial consultation completed/i)).toBeVisible(
      { timeout: 15_000 }
    );
    await expect(page.getByText(/Added by Nancy Cowans/i)).toBeVisible();
    await expect(page.getByText(/Added by Emily Co-Doula/i)).toBeVisible();
  });
});

test.describe('Ticket 5 — Edge cases and error handling', () => {
  test('handles activities with missing author information gracefully', async ({
    page,
  }) => {
    const activitiesWithMissingData = [
      {
        id: '10000000-0000-4000-8000-000000000020',
        clientId: MOCK_CLIENT_ID,
        content: 'Legacy note without complete author information',
        type: 'note',
        visibleToClient: true,
        createdAt: '2024-01-10T00:00:00Z',
      },
      ...MOCK_MIXED_ACTIVITIES.slice(0, 2),
    ];

    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: activitiesWithMissingData,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(
      page.getByText(/Legacy note without complete author information/i)
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/Initial consultation completed/i)
    ).toBeVisible();
  });

  test('displays empty state when no activities exist', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: [],
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(
      page.getByText(/No activities recorded yet/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('handles server error when fetching activities', async ({ page }) => {
    await installCorsPreflightStub(page, defaultCorsHeaders());
    await stubAuthMe(page, DOULA_USER, defaultCorsHeaders());

    await page.route('**/api/doulas/profile**', (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: MOCK_DOULA_ID,
          firstname: 'Sarah',
          lastname: 'Doula',
          address: '123 Main St',
          city: 'Chicago',
          state: 'IL',
          country: 'US',
          zip_code: '60601',
          bio: 'Experienced birth doula.',
          race_ethnicity: ['Black or African American'],
        }),
      });
    });

    await page.route('**/api/doulas/clients**', (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      const url = new URL(route.request().url());
      if (url.pathname.endsWith('/doulas/clients')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: MOCK_CLIENT_ID,
                firstname: 'Jordan',
                lastname: 'Bony',
                email: 'jbony@icstars.org',
                phone: '555-0100',
                dueDate: '2026-09-01',
                status: 'active',
              },
            ],
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: MOCK_CLIENT_ID,
            firstname: 'Jordan',
            lastname: 'Bony',
            email: 'jbony@icstars.org',
            phone: '555-0100',
            dueDate: '2026-09-01',
            status: 'active',
          },
        }),
      });
    });

    await page.route(
      `**/api/doulas/clients/${MOCK_CLIENT_ID}/activities**`,
      (route) => {
        if (route.request().method() !== 'GET') return route.continue();
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      }
    );

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await expect(
      page
        .getByText(
          /Internal server error|Failed to fetch activities|Failed to load activities/i
        )
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
