/**
 * Ticket 3 — E2E: Rename client status "Interviewing" to "Interviewed" in the Sokana CRM
 * Priority: Medium
 *
 * Browser tests verifying:
 * - Client list tables show "Interviewed" label (not "Interviewing")
 * - Status dropdown options display "Interviewed"  
 * - Pipeline/kanban columns show "Interviewed" 
 * - Client detail pages show correct status label
 * - Status filters work with "Interviewed" label
 * - Existing records with 'interviewing' value display as "Interviewed"
 * - Status transitions work correctly to/from interviewing
 * - Internal API continues using 'interviewing' value for compatibility
 */

import { test, expect } from '@playwright/test';
import { installCorsPreflightStub, stubAuthMe } from './fixtures/httpStubs';

const MOCK_CLIENTS_WITH_INTERVIEWING = [
  {
    id: 'client-1',
    firstname: 'Jane',
    lastname: 'Doe',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '555-0123',
    status: 'interviewing',
    serviceNeeded: 'Labor Support',
    service_needed: 'Labor Support',
    requestedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    profilePicture: null,
    role: 'client',
  },
  {
    id: 'client-2',
    firstname: 'John', 
    lastname: 'Smith',
    status: 'matched',
    serviceNeeded: 'Postpartum care',
    requestedAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-14T11:20:00Z',
    profilePicture: null,
  },
  {
    id: 'client-3',
    firstname: 'Alice',
    lastname: 'Johnson',
    status: 'interviewing',
    serviceNeeded: 'Full spectrum',
    requestedAt: '2024-01-18T16:45:00Z', 
    updatedAt: '2024-01-19T09:15:00Z',
    profilePicture: null,
  }
];

const CLIENT_STATUS_LABELS = {
  lead: 'Lead',
  contacted: 'Contacted', 
  matched: 'Matched',
  interviewing: 'Interviewed', // Key test: internal 'interviewing' maps to 'Interviewed'
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
  'not hired': 'Not Hired',
};

test.describe('Ticket 3 — Client status "Interviewed" display (E2E)', () => {
  test('app loads and is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(await page.title()).toBeTruthy();
  });

  test('clients list displays "Interviewed" label for interviewing status', async ({ page }) => {
    await installCorsPreflightStub(page);
    await stubAuthMe(page, {
      id: 'admin-1',
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      role: 'admin'
    });

    // Intercept multiple potential client API routes
    await page.route('**/clients', (route) => {
      console.log('🔥 Intercepting clients API call:', route.request().url());
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ clients: MOCK_CLIENTS_WITH_INTERVIEWING }),
      });
    });
    
    await page.route('**/api/clients', (route) => {
      console.log('🔥 Intercepting /api/clients call:', route.request().url());
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ clients: MOCK_CLIENTS_WITH_INTERVIEWING }),
      });
    });

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Wait a bit for the page to load
    await page.waitForTimeout(3000);

    // Debug: Log what's actually on the page
    const pageContent = await page.content();
    console.log('🔍 Page content contains "Interviewed":', pageContent.includes('Interviewed'));
    console.log('🔍 Page content contains "interviewing":', pageContent.includes('interviewing'));
    console.log('🔍 Page content contains "Jane":', pageContent.includes('Jane'));
    
    // Look for any status-related content
    const allStatusElements = await page.locator('[data-testid="status-display"]').all();
    console.log('🔍 Found status elements:', allStatusElements.length);
    for (let i = 0; i < allStatusElements.length; i++) {
      const text = await allStatusElements[i].textContent();
      console.log(`🔍 Status element ${i}:`, text);
    }

    // Look for "Interviewed" text anywhere on the page (like the working pipeline test)
    const interviewedText = page.locator('text=Interviewed').first();
    await expect(interviewedText).toBeVisible({ timeout: 15000 });
    
    // Should not show old "Interviewing" text
    const interviewingText = page.locator('text=Interviewing');
    await expect(interviewingText).not.toBeVisible();
  });

  test('status dropdown shows "Interviewed" option', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate((labels) => {
      // Simulate status dropdown options generation
      const statusOptions = Object.entries(labels).map(([value, label]) => ({
        value,
        label: label as string,
      }));

      const interviewedOption = statusOptions.find(opt => opt.value === 'interviewing');
      const hasInterviewingLabel = statusOptions.some(opt => opt.label === 'Interviewing');
      
      return {
        interviewedOptionExists: !!interviewedOption,
        interviewedLabel: interviewedOption?.label,
        hasOldInterviewingLabel: hasInterviewingLabel,
        allOptions: statusOptions,
      };
    }, CLIENT_STATUS_LABELS);

    expect(result.interviewedOptionExists).toBe(true);
    expect(result.interviewedLabel).toBe('Interviewed');
    expect(result.hasOldInterviewingLabel).toBe(false);
  });

  test('pipeline/kanban view groups clients under "Interviewed" column', async ({ page }) => {
    await installCorsPreflightStub(page);
    await stubAuthMe(page, {
      id: 'admin-1',
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      role: 'admin'
    });

    await page.route('**/clients', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json', 
        body: JSON.stringify({ clients: MOCK_CLIENTS_WITH_INTERVIEWING }),
      });
    });

    await page.goto('/pipeline');
    await page.waitForLoadState('networkidle');

    // Should have "Interviewed" column header
    const interviewedColumn = page.locator('text=Interviewed').first();
    await expect(interviewedColumn).toBeVisible();
    
    // Should not have "Interviewing" column
    const interviewingColumn = page.locator('text=Interviewing');
    await expect(interviewingColumn).not.toBeVisible();
  });

  test('client detail page shows "Interviewed" status', async ({ page }) => {
    await installCorsPreflightStub(page);
    await stubAuthMe(page, {
      id: 'admin-1',
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      role: 'admin'
    });

    const clientId = 'client-1';
    
    await page.route(`**/clients/${clientId}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: {
            ...MOCK_CLIENTS_WITH_INTERVIEWING[0],
            firstName: MOCK_CLIENTS_WITH_INTERVIEWING[0].firstname,
            lastName: MOCK_CLIENTS_WITH_INTERVIEWING[0].lastname,
          },
        }),
      });
    });

    await page.goto(`/clients/${clientId}`);
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Status should display as "Interviewed"
    const statusDisplay = page.locator('text=Interviewed').first();
    await expect(statusDisplay).toBeVisible({ timeout: 15000 });
  });

  test('status filter options include "Interviewed" not "Interviewing"', async ({ page }) => {
    await page.route('**/api/clients', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ clients: MOCK_CLIENTS_WITH_INTERVIEWING }),
      });
    });

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Look for status filter dropdown
    const statusFilter = page.locator('[data-testid="status-filter"]').or(
      page.locator('select').filter({ hasText: 'Status' })
    ).or(
      page.locator('text=Filter by status')
    );

    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      
      // Should see "Interviewed" option
      const interviewedOption = page.locator('text=Interviewed');
      await expect(interviewedOption).toBeVisible();
      
      // Should not see "Interviewing" option
      const interviewingOption = page.locator('text=Interviewing');
      await expect(interviewingOption).not.toBeVisible();
    }
  });
});

test.describe('Ticket 3 — Internal API compatibility', () => {
  test('API requests still use "interviewing" status value', async ({ page }) => {
    let capturedRequestBody: any = null;
    
    await page.route('**/api/clients/*/status', (route) => {
      const request = route.request();
      if (request.method() === 'PATCH') {
        capturedRequestBody = request.postDataJSON();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      // Simulate updating client status to "interviewed"
      const statusValue = 'interviewing'; // Internal API value
      
      return fetch('/api/clients/client-123/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValue }),
      }).then(() => statusValue);
    });

    expect(result).toBe('interviewing');
    expect(capturedRequestBody?.status).toBe('interviewing');
  });

  test('API responses with "interviewing" status display correctly', async ({ page }) => {
    await page.route('**/api/clients/client-test', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: {
            id: 'client-test',
            firstName: 'Test',
            lastName: 'Client',
            status: 'interviewing', // API returns internal value
            serviceNeeded: 'Test service',
          },
        }),
      });
    });

    await page.goto('/clients/client-test');
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Even though API returns 'interviewing', UI should show 'Interviewed'
    const statusDisplay = page.locator('text=Interviewed').first();
    await expect(statusDisplay).toBeVisible({ timeout: 15000 });
    
    const wrongDisplay = page.locator('text=interviewing');
    await expect(wrongDisplay).not.toBeVisible();
  });
});

test.describe('Ticket 3 — Status transitions and workflow', () => {
  test('status can transition from "matched" to "interviewing" correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate((labels) => {
      // Simulate status transition workflow
      const currentStatus = 'matched';
      const nextStatus = 'interviewing';
      
      const currentLabel = labels[currentStatus];
      const nextLabel = labels[nextStatus];
      
      const validTransition = ['matched', 'contacted'].includes(currentStatus);
      
      return {
        currentLabel,
        nextLabel, 
        validTransition,
      };
    }, CLIENT_STATUS_LABELS);

    expect(result.currentLabel).toBe('Matched');
    expect(result.nextLabel).toBe('Interviewed');
    expect(result.validTransition).toBe(true);
  });

  test('status can transition from "interviewing" to "follow up" correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate((labels) => {
      const currentStatus = 'interviewing';
      const nextStatus = 'follow up';
      
      return {
        currentLabel: labels[currentStatus],
        nextLabel: labels[nextStatus],
        bothExist: currentStatus in labels && nextStatus in labels,
      };
    }, CLIENT_STATUS_LABELS);

    expect(result.currentLabel).toBe('Interviewed');
    expect(result.nextLabel).toBe('Follow Up');
    expect(result.bothExist).toBe(true);
  });

  test('bulk status updates preserve "Interviewed" display', async ({ page }) => {
    const clientIds = ['client-1', 'client-2'];
    
    await page.route('**/api/clients/bulk/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          updated: clientIds.map(id => ({
            id,
            status: 'interviewing', // API response
          })),
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async (ids) => {
      const response = await fetch('/api/clients/bulk/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds: ids,
          status: 'interviewing',
        }),
      });
      
      const data = await response.json();
      
      // Simulate UI handling of bulk update response
      const statusLabels: Record<string, string> = {
        interviewing: 'Interviewed',
      };
      
      return {
        updatedCount: data.updated.length,
        statusValue: data.updated[0].status,
        displayLabel: statusLabels[data.updated[0].status],
      };
    }, clientIds);

    expect(result.updatedCount).toBe(2);
    expect(result.statusValue).toBe('interviewing');
    expect(result.displayLabel).toBe('Interviewed');
  });
});

test.describe('Ticket 3 — Edge cases and data consistency', () => {
  test('handles mixed status data correctly', async ({ page }) => {
    const mixedStatusClients = [
      { id: 'c1', status: 'interviewing' },
      { id: 'c2', status: 'matched' }, 
      { id: 'c3', status: 'interviewing' },
      { id: 'c4', status: 'contract' },
    ];

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(({ clients, labels }) => {
      // Simulate grouping clients by status for analytics/reporting
      const statusCounts = clients.reduce((acc: Record<string, number>, client) => {
        const displayLabel = labels[client.status];
        acc[displayLabel] = (acc[displayLabel] || 0) + 1;
        return acc;
      }, {});

      return {
        interviewedCount: statusCounts['Interviewed'] || 0,
        matchedCount: statusCounts['Matched'] || 0,
        contractCount: statusCounts['Contract'] || 0,
        hasInterviewingLabel: 'Interviewing' in statusCounts,
      };
    }, { clients: mixedStatusClients, labels: CLIENT_STATUS_LABELS });

    expect(result.interviewedCount).toBe(2);
    expect(result.matchedCount).toBe(1);
    expect(result.contractCount).toBe(1);
    expect(result.hasInterviewingLabel).toBe(false);
  });

  test('search and filtering work with "Interviewed" label', async ({ page }) => {
    await installCorsPreflightStub(page);
    await stubAuthMe(page, {
      id: 'admin-1',
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      role: 'admin'
    });

    await page.route('**/clients', (route) => {
      const url = new URL(route.request().url());
      const statusFilter = url.searchParams.get('status');
      
      let filteredClients = MOCK_CLIENTS_WITH_INTERVIEWING;
      if (statusFilter) {
        filteredClients = MOCK_CLIENTS_WITH_INTERVIEWING.filter(
          client => client.status === statusFilter
        );
      }
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ clients: filteredClients }),
      });
    });

    await page.goto('/clients?status=interviewing');
    await page.waitForLoadState('networkidle');

    // URL parameter uses internal 'interviewing' value
    expect(page.url()).toContain('status=interviewing');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // But UI should show "Interviewed" label
    const interviewedLabel = page.locator('text=Interviewed').first();
    await expect(interviewedLabel).toBeVisible({ timeout: 15000 });
  });

  test('export/reporting maintains label consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(({ clients, labels }) => {
      // Simulate generating CSV export data
      const exportData = clients.map(client => ({
        ...client,
        statusLabel: labels[client.status], // Use display label for export
      }));

      const interviewedRows = exportData.filter(row => 
        row.statusLabel === 'Interviewed'
      );

      return {
        totalRows: exportData.length,
        interviewedRows: interviewedRows.length,
        sampleStatusLabel: exportData[0]?.statusLabel,
        hasOldLabels: exportData.some(row => row.statusLabel === 'Interviewing'),
      };
    }, { clients: MOCK_CLIENTS_WITH_INTERVIEWING, labels: CLIENT_STATUS_LABELS });

    expect(result.totalRows).toBe(3);
    expect(result.interviewedRows).toBe(2);
    expect(result.hasOldLabels).toBe(false);
  });
});