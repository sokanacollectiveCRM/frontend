/**
 * Ticket 6 — E2E: Mandatory structured Birth Outcomes reminder + save record
 *
 * Verifies in the Doula Activities client view:
 * - A destructive reminder banner appears when Birth Outcomes are incomplete (mandatory).
 * - Doula can complete structured fields and save.
 * - After save, banner disappears and a timestamped record is displayed under Birth Outcomes.
 *
 * Notes:
 * - This test uses network stubbing (no real auth/backend required).
 * - It targets the route: /doula-dashboard/activities/:clientId
 */
import { test, expect } from '@playwright/test';

test.describe('Ticket 6 — Birth Outcomes mandatory reminder (E2E)', () => {
  test('doula sees reminder until birth outcomes are completed and saved', async ({ page }) => {
    const clientId = 'client-1';
    const corsHeaders = {
      // Credentials requests (credentials: 'include') cannot use wildcard origin.
      'access-control-allow-origin': 'http://localhost:3001',
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
    } as const;

    // Handle CORS preflight requests the app will trigger in dev.
    await page.route('**/*', (route) => {
      if (route.request().method() !== 'OPTIONS') return route.continue();
      route.fulfill({
        status: 204,
        headers: corsHeaders,
        body: '',
      });
    });

    // ---- In-memory state for stubbed endpoints
    let savedBirthOutcomes: { induction?: boolean; deliveryType?: string; meds?: string[] } = {};
    let activities: any[] = [];

    // ---- Auth: make PrivateRoute allow access (backend auth mode)
    await page.route('**/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          id: 'doula-1',
          firstname: 'Jerry',
          lastname: 'Bony',
          email: 'jbony@example.com',
          role: 'doula',
        }),
      });
    });

    // ---- Assigned clients list
    await page.route('**/api/doulas/clients?*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: clientId,
              user: {
                firstname: 'Jordan',
                lastname: 'Bony',
                email: 'jbony@icstars.org',
              },
              status: 'active',
            },
          ],
        }),
      });
    });

    // ---- Assigned client details (includes structured birth outcomes fields when saved)
    await page.route('**/api/doulas/clients/*', async (route) => {
      const url = route.request().url();
      // Avoid catching /api/doulas/clients/:id/activities
      if (url.includes('/activities')) return route.continue();
      const isDetail = url.includes(`/api/doulas/clients/${clientId}`);
      if (!isDetail) return route.continue();

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          data: {
            id: clientId,
            user: {
              firstname: 'Jordan',
              lastname: 'Bony',
              email: 'jbony@icstars.org',
              ...(savedBirthOutcomes.induction !== undefined
                ? { birth_outcomes_induction: savedBirthOutcomes.induction }
                : {}),
              ...(savedBirthOutcomes.deliveryType
                ? { birth_outcomes_delivery_type: savedBirthOutcomes.deliveryType }
                : {}),
              ...(Array.isArray(savedBirthOutcomes.meds)
                ? { birth_outcomes_medications_used: savedBirthOutcomes.meds }
                : {}),
            },
          },
        }),
      });
    });

    // ---- Activities list (used to render Birth Outcomes Records + Activities list)
    await page.route('**/api/doulas/clients/*/activities**', async (route) => {
      const req = route.request();
      const url = req.url();
      if (!url.includes(`/api/doulas/clients/${clientId}/activities`)) {
        return route.continue();
      }

      if (req.method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({ success: true, data: activities }),
        });
      }

      if (req.method() === 'POST') {
        const bodyText = req.postData() || '{}';
        const body = JSON.parse(bodyText);
        const now = new Date().toISOString();
        const activity = {
          id: `activity-${activities.length + 1}`,
          clientId,
          type: body.type || 'note',
          description: body.description || '',
          metadata: body.metadata || {},
          createdAt: now,
          createdBy: 'Jerry Bony',
          createdByRole: 'doula',
          visible_to_client: false,
        };
        activities = [activity, ...activities];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({ success: true, data: activity }),
        });
      }

      return route.continue();
    });

    // ---- Birth outcomes save endpoint (backend canonical)
    await page.route('**/clients/*/birth-outcomes', async (route) => {
      const req = route.request();
      if (req.method() !== 'PUT') return route.continue();

      const bodyText = req.postData() || '{}';
      const body = JSON.parse(bodyText) as Record<string, unknown>;
      savedBirthOutcomes = {
        induction: body.birth_outcomes_induction as boolean,
        deliveryType: String(body.birth_outcomes_delivery_type || ''),
        meds: Array.isArray(body.birth_outcomes_medications_used)
          ? (body.birth_outcomes_medications_used as unknown[]).map((v) => String(v))
          : [],
      };

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: savedBirthOutcomes }),
      });
    });

    // ---- Go to protected route (should work due to /auth/me stub)
    await page.goto(`/doula-dashboard/activities/${clientId}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByRole('heading', { name: 'Birth Outcomes', exact: true })).toBeVisible();

    // Reminder banner should show (mandatory)
    const reminder = page.getByRole('alert');
    await expect(reminder).toContainText('Birth Outcomes required');
    await expect(reminder).toContainText('Induction');
    await expect(reminder).toContainText('Delivery type');
    await expect(reminder).toContainText('Medications used');

    // Complete structured fields
    await page.getByLabel('Yes').first().check(); // Induction radio yes
    await page.locator('select').nth(0).selectOption({ label: 'Vaginal with pain medication/epidural' });
    await page.getByLabel('Pitocin').check();

    // Save
    await page.getByRole('button', { name: 'Save Birth Outcomes' }).click();
    // Wait for UI to reflect save (record block + content present)
    await expect(
      page.getByRole('heading', { name: 'Birth Outcomes Records', exact: true })
    ).toBeVisible();
    const recordsHeader = page.getByRole('heading', {
      name: 'Birth Outcomes Records',
      exact: true,
    });
    const recordsSection = recordsHeader.locator('..').locator('..'); // container for header + records list
    await expect(recordsSection.getByText('Induction: Yes')).toBeVisible();

    // Banner disappears after save + refresh
    await expect(page.getByRole('alert')).toHaveCount(0);

    // Record displayed under Birth Outcomes
    await expect(recordsSection.getByText('1 record')).toBeVisible();
    await expect(recordsSection.getByText('Induction: Yes')).toBeVisible();
    await expect(recordsSection.getByText('Delivery type: Vaginal with pain medication/epidural')).toBeVisible();
    await expect(recordsSection.getByText('Medications used: Pitocin')).toBeVisible();
  });
});

