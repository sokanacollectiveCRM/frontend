/**
 * Ticket 4 — E2E: Doula note visibility toggle ("Show to client")
 *
 * Uses cookie-mode auth + canonical doula activity API paths.
 */

import { test, expect } from '@playwright/test';
import {
  DOULA_ACTIVITY_IDS,
  doulaActivitiesPath,
  setupDoulaActivitiesPage,
  waitForDoulaActivitiesLoaded,
} from './helpers/doulaE2eStubs';

const MOCK_CLIENT_ID = 'client-123';
const MOCK_DOULA_ID = 'doula-456';

const DOULA_USER = {
  id: MOCK_DOULA_ID,
  firstname: 'Sarah',
  lastname: 'Doula',
  email: 'sarah@example.com',
  role: 'doula',
};

const MOCK_ACTIVITIES = [
  {
    id: DOULA_ACTIVITY_IDS.visible,
    clientId: MOCK_CLIENT_ID,
    content: 'Initial consultation notes - discussing birth plan preferences',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-15T10:30:00Z',
    authorName: 'Sarah Doula',
    authorType: 'doula',
  },
  {
    id: DOULA_ACTIVITY_IDS.hidden,
    clientId: MOCK_CLIENT_ID,
    content:
      'Private note: client seems anxious about pain management, need to address gently',
    type: 'note',
    visibleToClient: false,
    createdAt: '2024-01-16T14:20:00Z',
    authorName: 'Sarah Doula',
    authorType: 'doula',
  },
  {
    id: DOULA_ACTIVITY_IDS.visibleFollowUp,
    clientId: MOCK_CLIENT_ID,
    content: 'Follow-up scheduled for next week to finalize birth preferences',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-17T09:15:00Z',
    authorName: 'Sarah Doula',
    authorType: 'doula',
  },
];

function activityVisibilityBadge(
  page: import('@playwright/test').Page,
  label: 'Staff only' | 'Visible to client'
) {
  return page
    .locator('span, div')
    .filter({ hasText: new RegExp(`^${label}$`) })
    .filter({ hasNot: page.locator('option') })
    .first();
}

function portalCheckbox(
  page: import('@playwright/test').Page,
  activityId: string
) {
  return page.locator(`#portal-vis-${MOCK_CLIENT_ID}-${activityId}`);
}

test.describe('Ticket 4 — Notes visibility toggle (E2E)', () => {
  test('app loads and doula can access client activities', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await expect(
      page.getByText(
        'Initial consultation notes - discussing birth plan preferences'
      )
    ).toBeVisible({ timeout: 15_000 });
  });

  test('doula can toggle note visibility from OFF to ON', async ({ page }) => {
    let toggleCalled = false;
    let capturedVisibility: boolean | null = null;

    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.route(
      `**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/${DOULA_ACTIVITY_IDS.hidden}`,
      async (route) => {
        if (route.request().method() === 'PATCH') {
          toggleCalled = true;
          capturedVisibility = route.request().postDataJSON()?.visibleToClient;
          const body = route.request().postDataJSON();
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              activity: {
                id: DOULA_ACTIVITY_IDS.hidden,
                description: MOCK_ACTIVITIES[1].content,
                visible_to_client: body?.visibleToClient === true,
              },
            }),
          });
        }
        return route.continue();
      }
    );

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await expect(page.getByText(/anxious about pain management/i)).toBeVisible({
      timeout: 15_000,
    });

    await portalCheckbox(page, DOULA_ACTIVITY_IDS.hidden).click();
    await expect.poll(() => toggleCalled).toBe(true);
    expect(capturedVisibility).toBe(true);
  });

  test('doula can toggle note visibility from ON to OFF', async ({ page }) => {
    let toggleCalled = false;
    let capturedVisibility: boolean | null = null;

    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.route(
      `**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/${DOULA_ACTIVITY_IDS.visible}`,
      async (route) => {
        if (route.request().method() === 'PATCH') {
          toggleCalled = true;
          capturedVisibility = route.request().postDataJSON()?.visibleToClient;
          const body = route.request().postDataJSON();
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              activity: {
                id: DOULA_ACTIVITY_IDS.visible,
                description: MOCK_ACTIVITIES[0].content,
                visible_to_client: body?.visibleToClient === true,
              },
            }),
          });
        }
        return route.continue();
      }
    );

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await expect(page.getByText(/Initial consultation notes/i)).toBeVisible({
      timeout: 15_000,
    });

    await portalCheckbox(page, DOULA_ACTIVITY_IDS.visible).click();
    await expect.poll(() => toggleCalled).toBe(true);
    expect(capturedVisibility).toBe(false);
  });

  test('toggle shows correct visual state (ON = visible, OFF = hidden)', async ({
    page,
  }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await expect(page.getByText(/Initial consultation notes/i)).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      portalCheckbox(page, DOULA_ACTIVITY_IDS.visible)
    ).toBeChecked();
    await expect(
      portalCheckbox(page, DOULA_ACTIVITY_IDS.hidden)
    ).not.toBeChecked();
  });

  test('visibility labels show correct status text', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await expect(
      activityVisibilityBadge(page, 'Visible to client')
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(activityVisibilityBadge(page, 'Staff only')).toBeVisible();
  });

  test('toggle state persists after page reload', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await expect(
      portalCheckbox(page, DOULA_ACTIVITY_IDS.hidden)
    ).not.toBeChecked();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(
      portalCheckbox(page, DOULA_ACTIVITY_IDS.hidden)
    ).not.toBeChecked();
  });
});

test.describe('Ticket 4 — Toggle error handling', () => {
  test('shows error message when toggle request fails', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.route(
      `**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/${DOULA_ACTIVITY_IDS.visible}`,
      (route) => {
        if (route.request().method() === 'PATCH') {
          return route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Failed to update note visibility' }),
          });
        }
        return route.continue();
      }
    );

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    await portalCheckbox(page, DOULA_ACTIVITY_IDS.visible).click();

    await expect(
      page.getByText(
        /Failed to update note visibility|Could not update visibility/i
      )
    ).toBeVisible({ timeout: 10_000 });
  });

  test('toggle reverts to original state on error', async ({ page }) => {
    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.route(
      `**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/${DOULA_ACTIVITY_IDS.visible}`,
      (route) => {
        if (route.request().method() === 'PATCH') {
          return route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        }
        return route.continue();
      }
    );

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);
    const toggle = portalCheckbox(page, DOULA_ACTIVITY_IDS.visible);
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked({ timeout: 10_000 });
  });
});

test.describe('Ticket 4 — Multiple notes management', () => {
  test('can manage different visibility states for multiple notes', async ({
    page,
  }) => {
    const toggleStates: Record<string, boolean> = {};

    await setupDoulaActivitiesPage(page, {
      user: DOULA_USER,
      clientId: MOCK_CLIENT_ID,
      activities: MOCK_ACTIVITIES,
    });

    await page.route(
      `**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/**`,
      (route) => {
        if (route.request().method() === 'PATCH') {
          const activityId = decodeURIComponent(
            new URL(route.request().url()).pathname.split('/').pop() ?? ''
          );
          const body = route.request().postDataJSON() as {
            visibleToClient?: boolean;
          };
          toggleStates[activityId] = body?.visibleToClient === true;
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              activity: {
                id: activityId,
                visible_to_client: body?.visibleToClient === true,
              },
            }),
          });
        }
        return route.continue();
      }
    );

    await page.goto(doulaActivitiesPath(MOCK_CLIENT_ID), {
      waitUntil: 'domcontentloaded',
    });
    await waitForDoulaActivitiesLoaded(page);

    await portalCheckbox(page, DOULA_ACTIVITY_IDS.visible).click();
    await portalCheckbox(page, DOULA_ACTIVITY_IDS.hidden).click();
    await portalCheckbox(page, DOULA_ACTIVITY_IDS.visibleFollowUp).click();

    await expect
      .poll(() => toggleStates[DOULA_ACTIVITY_IDS.visible])
      .toBe(false);
    await expect.poll(() => toggleStates[DOULA_ACTIVITY_IDS.hidden]).toBe(true);
    await expect
      .poll(() => toggleStates[DOULA_ACTIVITY_IDS.visibleFollowUp])
      .toBe(false);
  });
});
