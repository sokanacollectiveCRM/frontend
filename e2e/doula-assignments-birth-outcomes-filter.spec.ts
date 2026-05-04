import { test, expect } from '@playwright/test';
import { installCorsPreflightStub, stubAuthMe, defaultCorsHeaders } from './fixtures/httpStubs';

test.describe('Doulas — Assignments birth outcomes filter (E2E)', () => {
  test('filters rows by Complete / Incomplete / Not recorded', async ({ page }) => {
    const corsHeaders = defaultCorsHeaders();
    await installCorsPreflightStub(page, corsHeaders);
    await stubAuthMe(
      page,
      {
        id: 'admin-1',
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@example.com',
        role: 'admin',
      },
      corsHeaders
    );

    // Doula dropdown population
    await page.route('**/api/doulas?*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            data: [
              { id: 'doula-1', first_name: 'Dana', last_name: 'Doula', email: 'dana@example.com' },
            ],
            meta: { limit: 200, offset: 0, count: 1 },
          },
        }),
      });
    });

    const assignments = [
      {
        id: 'a1',
        clientId: 'c1',
        clientFirstName: 'Complete',
        clientLastName: 'Client',
        clientEmail: 'complete@example.com',
        clientPhone: '555-000-0001',
        doulaId: 'doula-1',
        doulaFirstName: 'Dana',
        doulaLastName: 'Doula',
        services: ['Labor Support'],
        role: 'primary',
        hospital: 'Hospital A',
        assignedAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        birth_outcomes_induction: false,
        birth_outcomes_delivery_type: 'Vaginal (unmedicated)',
        birth_outcomes_medications_used: ['Pitocin'],
      },
      {
        id: 'a2',
        clientId: 'c2',
        clientFirstName: 'Incomplete',
        clientLastName: 'Client',
        clientEmail: 'incomplete@example.com',
        clientPhone: '555-000-0002',
        doulaId: 'doula-1',
        doulaFirstName: 'Dana',
        doulaLastName: 'Doula',
        services: ['Postpartum Support'],
        role: 'backup',
        hospital: 'Hospital B',
        assignedAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        birth_outcomes_induction: true,
        // delivery_type missing => incomplete
        birth_outcomes_medications_used: ['Epidural'],
      },
      {
        id: 'a3',
        clientId: 'c3',
        clientFirstName: 'No',
        clientLastName: 'Record',
        clientEmail: 'norecord@example.com',
        clientPhone: '555-000-0003',
        doulaId: 'doula-1',
        doulaFirstName: 'Dana',
        doulaLastName: 'Doula',
        services: ['Labor Support'],
        role: 'primary',
        hospital: 'Hospital C',
        assignedAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
        // no birth outcomes fields => not recorded
      },
    ];

    await page.route('**/api/doula-assignments?*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            data: assignments,
            meta: { limit: 10, offset: 0, count: assignments.length },
          },
        }),
      });
    });

    await page.goto('/hours', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Doulas' })).toBeVisible();

    // Switch to Assignments tab
    await page.getByRole('tab', { name: 'Assignments' }).click();

    // Baseline: all 3 clients are listed
    await expect(page.getByText('Complete Client')).toBeVisible();
    await expect(page.getByText('Incomplete Client')).toBeVisible();
    await expect(page.getByText('No Record')).toBeVisible();

    // Filter to Complete
    await page.getByRole('combobox', { name: /Birth outcomes/i }).click().catch(async () => {
      // If the Select isn't exposing accessible combobox name, fall back to clicking the trigger by text.
      await page.getByText('All birth outcomes').click();
    });
    await page.getByText('Complete', { exact: true }).click();
    await expect(page.getByText('Complete Client')).toBeVisible();
    await expect(page.getByText('Incomplete Client')).toHaveCount(0);
    await expect(page.getByText('No Record')).toHaveCount(0);

    // Filter to Incomplete
    await page.getByText('Complete', { exact: true }).click();
    await page.getByText('Incomplete', { exact: true }).click();
    await expect(page.getByText('Incomplete Client')).toBeVisible();
    await expect(page.getByText('Complete Client')).toHaveCount(0);
    await expect(page.getByText('No Record')).toHaveCount(0);

    // Filter to Not recorded
    await page.getByText('Incomplete', { exact: true }).click();
    await page.getByText('Not recorded', { exact: true }).click();
    await expect(page.getByText('No Record')).toBeVisible();
    await expect(page.getByText('Complete Client')).toHaveCount(0);
    await expect(page.getByText('Incomplete Client')).toHaveCount(0);
  });
});

