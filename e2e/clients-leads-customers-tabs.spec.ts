import { test, expect } from '@playwright/test';
import { installCorsPreflightStub, stubAuthMe, defaultCorsHeaders } from './fixtures/httpStubs';

test.describe('Clients — Leads vs Customers tabs (E2E)', () => {
  test('matched clients appear only in Customers tab and counts update', async ({ page }) => {
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

    // Client list (canonical ApiResponse wrapper)
    await page.route('**/clients', (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'lead-1',
              first_name: 'Lead',
              last_name: 'One',
              email: 'lead1@example.com',
              phone_number: '555-000-0001',
              status: 'lead',
              service_needed: 'Labor Support',
              requested_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'matched-1',
              first_name: 'Matched',
              last_name: 'Client',
              email: 'matched@example.com',
              phone_number: '555-000-0002',
              status: 'matched',
              matched_at: new Date().toISOString(),
              qbo_customer_id: 'QB-123',
              service_needed: 'Postpartum Support',
              requested_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          meta: { count: 2 },
        }),
      });
    });

    await page.goto('/clients', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Default tab is Leads; should contain Lead One but not Matched Client
    await expect(page.getByText('Lead One')).toBeVisible();
    await expect(page.getByText('Matched Client')).toHaveCount(0);

    // Switch to Customers tab; should contain Matched Client only
    await page.getByRole('tab', { name: /Customers/i }).click();
    await expect(page.getByText('Matched Client')).toBeVisible();
    await expect(page.getByText('Lead One')).toHaveCount(0);
  });
});

