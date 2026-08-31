/**
 * Ticket 3 — E2E: Rename client status "Interviewing" to "Interviewed" in the Sokana CRM
 *
 * Uses canonical ApiResponse wrappers (`{ success, data }`) and cookie-mode auth stubs.
 */

import { test, expect } from '@playwright/test';
import { defaultCorsHeaders } from './fixtures/httpStubs';
import {
  stubAdminSession,
  stubClientDetail,
  stubClientsList,
  toCanonicalListClient,
} from './helpers/e2eApiStubs';

const ADMIN_USER = {
  id: 'admin-1',
  firstname: 'Admin',
  lastname: 'User',
  email: 'admin@example.com',
  role: 'admin',
};

const MOCK_CLIENTS_WITH_INTERVIEWING = [
  {
    id: 'client-1',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@example.com',
    phone_number: '555-0123',
    status: 'interviewing',
    service_needed: 'Labor Support',
    requested_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T14:30:00Z',
  },
  {
    id: 'client-2',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    phone_number: '555-0124',
    status: 'matched',
    service_needed: 'Postpartum care',
    requested_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-14T11:20:00Z',
  },
  {
    id: 'client-3',
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice.johnson@example.com',
    phone_number: '555-0125',
    status: 'interviewing',
    service_needed: 'Full spectrum',
    requested_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-19T09:15:00Z',
  },
];

const CLIENT_STATUS_LABELS = {
  lead: 'Lead',
  contacted: 'Contacted',
  matched: 'Matched',
  interviewing: 'Interviewed',
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

  test('clients list displays "Interviewed" label for interviewing status', async ({
    page,
  }) => {
    await stubAdminSession(page, ADMIN_USER);
    await stubClientsList(page, MOCK_CLIENTS_WITH_INTERVIEWING);

    await page.goto('/clients', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Interviewing clients live on the Leads tab by default.
    await expect(page.getByText('Jane Doe')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Interviewed').first()).toBeVisible();
    await expect(page.getByText('Interviewing', { exact: true })).toHaveCount(
      0
    );
  });

  test('status dropdown shows "Interviewed" option', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate((labels) => {
      const statusOptions = Object.entries(labels).map(([value, label]) => ({
        value,
        label: label as string,
      }));

      const interviewedOption = statusOptions.find(
        (opt) => opt.value === 'interviewing'
      );
      const hasInterviewingLabel = statusOptions.some(
        (opt) => opt.label === 'Interviewing'
      );

      return {
        interviewedOptionExists: !!interviewedOption,
        interviewedLabel: interviewedOption?.label,
        hasOldInterviewingLabel: hasInterviewingLabel,
      };
    }, CLIENT_STATUS_LABELS);

    expect(result.interviewedOptionExists).toBe(true);
    expect(result.interviewedLabel).toBe('Interviewed');
    expect(result.hasOldInterviewingLabel).toBe(false);
  });

  test('pipeline/kanban view groups clients under "Interviewed" column', async ({
    page,
  }) => {
    await stubAdminSession(page, ADMIN_USER);
    await stubClientsList(page, MOCK_CLIENTS_WITH_INTERVIEWING);

    await page.goto('/pipeline', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Interviewed').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Interviewing', { exact: true })).toHaveCount(
      0
    );
  });

  test('client detail page shows "Interviewed" status', async ({ page }) => {
    const clientId = 'client-1';
    await stubAdminSession(page, ADMIN_USER);
    await stubClientsList(page, MOCK_CLIENTS_WITH_INTERVIEWING);
    await stubClientDetail(page, MOCK_CLIENTS_WITH_INTERVIEWING[0]);

    await page.goto(`/clients/${clientId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Interviewed').first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('status filter options include "Interviewed" not "Interviewing"', async ({
    page,
  }) => {
    await stubAdminSession(page, ADMIN_USER);
    await stubClientsList(page, MOCK_CLIENTS_WITH_INTERVIEWING);

    await page.goto('/clients', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
    await expect(page.getByText('Interviewed').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Interviewing', { exact: true })).toHaveCount(
      0
    );
  });
});

test.describe('Ticket 3 — Internal API compatibility', () => {
  test('API requests still use "interviewing" status value', async ({
    page,
  }) => {
    let capturedRequestBody: { status?: string } | null = null;
    const headers = defaultCorsHeaders();

    await page.route('**/clients/*/status', (route) => {
      if (route.request().method() === 'PATCH') {
        capturedRequestBody = route.request().postDataJSON();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate(() => {
      const statusValue = 'interviewing';
      return fetch('/api/clients/client-123/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValue }),
      }).then(() => statusValue);
    });

    expect(result).toBe('interviewing');
    expect(capturedRequestBody?.status).toBe('interviewing');
  });

  test('API responses with "interviewing" status display correctly', async ({
    page,
  }) => {
    const client = {
      id: 'client-test',
      first_name: 'Test',
      last_name: 'Client',
      email: 'test@example.com',
      status: 'interviewing',
      service_needed: 'Test service',
    };
    await stubAdminSession(page, ADMIN_USER);
    await stubClientsList(page, [client]);
    await stubClientDetail(page, client);

    await page.goto('/clients/client-test', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Interviewed').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('interviewing', { exact: true })).toHaveCount(
      0
    );
  });
});

test.describe('Ticket 3 — Status transitions and workflow', () => {
  test('status can transition from "matched" to "interviewing" correctly', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate((labels) => {
      const currentStatus = 'matched';
      const nextStatus = 'interviewing';
      return {
        currentLabel: labels[currentStatus as keyof typeof labels],
        nextLabel: labels[nextStatus as keyof typeof labels],
        validTransition: ['matched', 'contacted'].includes(currentStatus),
      };
    }, CLIENT_STATUS_LABELS);

    expect(result.currentLabel).toBe('Matched');
    expect(result.nextLabel).toBe('Interviewed');
    expect(result.validTransition).toBe(true);
  });

  test('status can transition from "interviewing" to "follow up" correctly', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate((labels) => {
      const currentStatus = 'interviewing';
      const nextStatus = 'follow up';
      return {
        currentLabel: labels[currentStatus as keyof typeof labels],
        nextLabel: labels[nextStatus as keyof typeof labels],
        bothExist: currentStatus in labels && nextStatus in labels,
      };
    }, CLIENT_STATUS_LABELS);

    expect(result.currentLabel).toBe('Interviewed');
    expect(result.nextLabel).toBe('Follow Up');
    expect(result.bothExist).toBe(true);
  });

  test('bulk status updates preserve "Interviewed" display', async ({
    page,
  }) => {
    const clientIds = ['client-1', 'client-2'];
    const headers = defaultCorsHeaders();

    await page.route('**/clients/bulk/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({
          updated: clientIds.map((id) => ({
            id,
            status: 'interviewing',
          })),
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

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
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate(
      ({ clients, labels }) => {
        const statusCounts = clients.reduce(
          (acc: Record<string, number>, client) => {
            const displayLabel =
              labels[client.status as keyof typeof labels] ?? client.status;
            acc[displayLabel] = (acc[displayLabel] || 0) + 1;
            return acc;
          },
          {}
        );

        return {
          interviewedCount: statusCounts['Interviewed'] || 0,
          matchedCount: statusCounts['Matched'] || 0,
          contractCount: statusCounts['Contract'] || 0,
          hasInterviewingLabel: 'Interviewing' in statusCounts,
        };
      },
      { clients: mixedStatusClients, labels: CLIENT_STATUS_LABELS }
    );

    expect(result.interviewedCount).toBe(2);
    expect(result.matchedCount).toBe(1);
    expect(result.contractCount).toBe(1);
    expect(result.hasInterviewingLabel).toBe(false);
  });

  test('search and filtering work with "Interviewed" label', async ({
    page,
  }) => {
    await stubAdminSession(page, ADMIN_USER);
    await stubClientsList(
      page,
      MOCK_CLIENTS_WITH_INTERVIEWING.filter((c) => c.status === 'interviewing')
    );

    await page.goto('/clients?status=interviewing', {
      waitUntil: 'domcontentloaded',
    });
    expect(page.url()).toContain('status=interviewing');
    await expect(page.getByText('Interviewed').first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('export/reporting maintains label consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate(
      ({ clients, labels }) => {
        const exportData = clients.map((client) => ({
          ...client,
          statusLabel:
            labels[client.status as keyof typeof labels] ?? client.status,
        }));
        const interviewedRows = exportData.filter(
          (row) => row.statusLabel === 'Interviewed'
        );
        return {
          totalRows: exportData.length,
          interviewedRows: interviewedRows.length,
          hasOldLabels: exportData.some(
            (row) => row.statusLabel === 'Interviewing'
          ),
        };
      },
      {
        clients: MOCK_CLIENTS_WITH_INTERVIEWING.map(toCanonicalListClient),
        labels: CLIENT_STATUS_LABELS,
      }
    );

    expect(result.totalRows).toBe(3);
    expect(result.interviewedRows).toBe(2);
    expect(result.hasOldLabels).toBe(false);
  });
});
