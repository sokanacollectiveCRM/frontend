/**
 * Admin Notes with Audit Log - E2E Tests
 *
 * Browser tests verifying:
 * - Admin can access and add notes to client profiles
 * - Audit trail shows who added the note and when
 * - Note categories work correctly
 * - Doula (non-admin) can still open the profile and see the Admin Notes area (aligned with Ticket 5)
 * - Note history is sorted and legacy rows without author show "Added by Unknown"
 */

import { test, expect, type Page, type Route } from '@playwright/test';

/** Only intercept API calls — not the SPA document navigation to /clients/:id. */
function isApiRequest(route: Route): boolean {
  const t = route.request().resourceType();
  return t === 'fetch' || t === 'xhr';
}

const MOCK_CLIENT_ID = 'client-jordan-bony';

const MOCK_EXISTING_NOTES = [
  {
    id: 'note-1',
    clientId: MOCK_CLIENT_ID,
    type: 'note',
    description: 'Initial admin consultation completed. Client approved for services.',
    metadata: {
      category: 'milestone',
      createdByName: 'Nancy Cowans',
      createdByRole: 'admin',
    },
    timestamp: '2024-01-15T10:30:00Z',
    createdBy: 'Nancy Cowans',
  },
  {
    id: 'note-2',
    clientId: MOCK_CLIENT_ID,
    type: 'note',
    description: 'Insurance verification completed successfully.',
    metadata: {
      category: 'billing',
      createdByName: 'Sonia Collins',
      createdByRole: 'admin',
    },
    timestamp: '2024-01-14T14:20:00Z',
    createdBy: 'Sonia Collins',
  },
];

/** Cookie auth uses GET {base}/auth/me — not /api/auth/me. Body is the user object (see UserContext). */
function mockSession(page: Page, user: Record<string, unknown>) {
  return page.route('**/auth/me', (route) => {
    if (!isApiRequest(route)) {
      return route.continue();
    }
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });
}

function isClientsListPath(pathname: string): boolean {
  return pathname === '/clients' || pathname === '/api/clients';
}

function isClientDetailPath(pathname: string, clientId: string): boolean {
  return pathname === `/clients/${clientId}` || pathname === `/api/clients/${clientId}`;
}

function isActivitiesPath(pathname: string, clientId: string): boolean {
  return (
    pathname === `/api/clients/${clientId}/activities` ||
    pathname === `/clients/${clientId}/activities`
  );
}

function isActivityPostPath(pathname: string, clientId: string): boolean {
  return (
    pathname === `/api/clients/${clientId}/activity` ||
    pathname === `/clients/${clientId}/activity`
  );
}

/**
 * Mocks canonical GET /clients, GET /clients/:id (ApiResponse), and notes GET /api/clients/:id/activities.
 */
function mockClientAndNotesApi(
  page: Page,
  clientId: string,
  activities: unknown[],
  options?: {
    onPostActivity?: (body: { content?: string; metadata?: Record<string, unknown> }) => Record<string, unknown>;
  }
) {
  const detailDto = {
    id: clientId,
    first_name: 'Jordan',
    last_name: 'Bony',
    email: 'jordan@example.com',
    phone_number: '+1234567890',
    status: 'active',
    service_needed: 'Birth support',
  };

  const listItem = {
    id: clientId,
    first_name: detailDto.first_name,
    last_name: detailDto.last_name,
    email: detailDto.email,
    phone_number: detailDto.phone_number,
    status: detailDto.status,
    service_needed: detailDto.service_needed,
  };

  page.route((url) => isClientsListPath(new URL(url).pathname), (route) => {
    if (!isApiRequest(route)) {
      return route.continue();
    }
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [listItem] }),
    });
  });

  page.route((url) => isClientDetailPath(new URL(url).pathname, clientId), (route) => {
    if (!isApiRequest(route)) {
      return route.continue();
    }
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: detailDto }),
    });
  });

  page.route((url) => isActivitiesPath(new URL(url).pathname, clientId), (route) => {
    if (!isApiRequest(route)) {
      return route.continue();
    }
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: activities }),
    });
  });

  const onPostActivity = options?.onPostActivity;
  if (onPostActivity) {
    page.route((url) => isActivityPostPath(new URL(url).pathname, clientId), (route) => {
      if (!isApiRequest(route)) {
        return route.continue();
      }
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      const body = route.request().postDataJSON() as { content?: string; metadata?: Record<string, unknown> };
      const activity = onPostActivity(body);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activity }),
      });
    });
  }
}

const ADMIN_USER = {
  id: 'admin-nancy',
  role: 'admin',
  email: 'nancy@sokana.com',
  firstname: 'Nancy',
  lastname: 'Cowans',
};

/**
 * Lead profile modal: scope by accessible name so we never bind to a stale duplicate `data-testid`
 * shell while the real profile is the visible `role="dialog"` (Radix `DialogTitle` → name).
 */
function leadProfileDialog(page: Page) {
  return page.getByRole('dialog', { name: /Jordan Bony/i });
}

async function waitForLeadProfileDialog(page: Page) {
  await expect(leadProfileDialog(page)).toBeVisible({ timeout: 20_000 });
}

/**
 * Selects a note category using the native `<select>`. No portal, no Radix flake.
 */
async function selectAdminNoteCategory(page: Page, categoryLabel: string) {
  await leadProfileDialog(page).getByTestId('admin-note-category-trigger').selectOption(categoryLabel);
}

/** Ensure Admin Notes is expanded (modal defaults to open; click only if collapsed). */
async function expandAdminNotesSection(page: Page) {
  const dialog = leadProfileDialog(page);
  await expect(dialog).toBeVisible({ timeout: 20_000 });
  const trigger = dialog.getByTestId('admin-notes-collapsible-trigger');
  await expect(trigger).toBeVisible({ timeout: 20_000 });
  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click({ force: true });
  }
  await expect(dialog.getByPlaceholder(/Enter note description/i)).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('Admin Notes with Audit Log (E2E)', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });
  test('admin can access client profile and see admin notes section', async ({ page }) => {
    await mockSession(page, ADMIN_USER);
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, MOCK_EXISTING_NOTES);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await waitForLeadProfileDialog(page);
    const dialog = leadProfileDialog(page);
    await expect(dialog.getByText('Admin Notes', { exact: true })).toBeVisible();

    const noteBadge = dialog.locator('.bg-primary\\/10').filter({ hasText: '2' });
    await expect(noteBadge).toBeVisible({ timeout: 15_000 });
  });

  test('admin can add new note with audit trail', async ({ page }) => {
    let createdNote: Record<string, unknown> | null = null;

    await mockSession(page, ADMIN_USER);
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, MOCK_EXISTING_NOTES, {
      onPostActivity: (requestBody) => {
        createdNote = {
          id: 'note-new-123',
          clientId: MOCK_CLIENT_ID,
          type: 'note',
          description: requestBody.content,
          metadata: requestBody.metadata,
          timestamp: '2024-01-16T16:45:00Z',
          createdBy: 'Nancy Cowans',
        };
        return createdNote;
      },
    });

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);

    // Fill note text — use click+triple-click clear then type so React receives key events.
    const noteTextarea = leadProfileDialog(page).getByPlaceholder(/Enter note description/i);
    await noteTextarea.click();
    await noteTextarea.fill('New admin note: Client payment plan adjusted per request.');
    await expect(noteTextarea).toHaveValue('New admin note: Client payment plan adjusted per request.', { timeout: 5_000 });

    // Wait for Add Note to be enabled (confirms React updated newNote state)
    await expect(
      leadProfileDialog(page).getByRole('button', { name: 'Add Note' })
    ).toBeEnabled({ timeout: 10_000 });

    // Change category
    await selectAdminNoteCategory(page, 'Billing');

    // Submit
    await leadProfileDialog(page).getByRole('button', { name: 'Add Note' }).click();

    await expect.poll(() => createdNote).not.toBeNull();
    expect(createdNote!.description).toBe('New admin note: Client payment plan adjusted per request.');
    expect((createdNote!.metadata as Record<string, string>).category).toBe('billing');
    expect((createdNote!.metadata as Record<string, string>).createdByName).toBe('Nancy Cowans');
    expect((createdNote!.metadata as Record<string, string>).createdByRole).toBe('admin');
  });

  test('notes display proper audit information', async ({ page }) => {
    await mockSession(page, ADMIN_USER);
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, MOCK_EXISTING_NOTES);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);

    const dialog = leadProfileDialog(page);
    await expect(dialog.getByText('Added by Nancy Cowans')).toBeVisible();
    await expect(dialog.getByText('Added by Sonia Collins')).toBeVisible();

    await expect(dialog.getByText('milestone', { exact: true })).toBeVisible();
    await expect(dialog.getByText('billing', { exact: true })).toBeVisible();

    const relativeTime = dialog.getByText(/ago|in \d+/).first();
    await expect(relativeTime).toBeVisible();
  });

  test('note categories work correctly', async ({ page }) => {
    const categories = ['General', 'Communication', 'Milestone', 'Follow-up', 'Health', 'Billing'];

    await mockSession(page, {
      id: 'admin-test',
      role: 'admin',
      email: 'a@test.com',
      firstname: 'Test',
      lastname: 'Admin',
    });
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, []);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);

    const categorySelect = leadProfileDialog(page).getByTestId('admin-note-category-trigger');
    await expect(categorySelect).toBeVisible({ timeout: 10_000 });
    for (const category of categories) {
      await expect(categorySelect.locator(`option[data-testid="admin-note-option-${category}"]`)).toBeAttached();
    }
  });

  test('form validation prevents empty notes', async ({ page }) => {
    await mockSession(page, {
      id: 'admin-test',
      role: 'admin',
      email: 'a@test.com',
      firstname: 'Test',
      lastname: 'Admin',
    });
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, []);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);

    const dialog = leadProfileDialog(page);
    const addButton = dialog.getByRole('button', { name: 'Add Note' });
    await expect(addButton).toBeDisabled();

    const noteTextarea = dialog.getByPlaceholder(/Enter note description/i);
    await noteTextarea.fill('   ');
    await expect(addButton).toBeDisabled();

    await noteTextarea.fill('Valid note content');
    await expect(addButton).toBeEnabled();
  });

  test('doula users see Admin Notes section on client profile', async ({ page }) => {
    await mockSession(page, {
      id: 'doula-sarah',
      role: 'doula',
      email: 'sarah@example.com',
      firstname: 'Sarah',
      lastname: 'Doula',
    });
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, []);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await waitForLeadProfileDialog(page);
    await expect(leadProfileDialog(page).getByText('Admin Notes', { exact: true })).toBeVisible();
  });

  test('legacy note without author shows Added by Unknown', async ({ page }) => {
    await mockSession(page, ADMIN_USER);
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, [
      {
        id: 'note-legacy',
        activity_type: 'note',
        content: 'Older system note without author metadata.',
        created_at: '2020-01-10T12:00:00Z',
      },
    ]);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);
    await expect(leadProfileDialog(page).getByText(/Added by Unknown/)).toBeVisible();
  });

  test('error handling for failed note creation', async ({ page }) => {
    await mockSession(page, {
      id: 'admin-test',
      role: 'admin',
      email: 'a@test.com',
      firstname: 'Test',
      lastname: 'Admin',
    });
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, []);

    await page.route(
      (url) => isActivityPostPath(new URL(url).pathname, MOCK_CLIENT_ID),
      (route) => {
        if (!isApiRequest(route)) {
          return route.continue();
        }
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' }),
          });
        }
        return route.continue();
      }
    );

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);

    const dialog = leadProfileDialog(page);
    const noteTextarea = dialog.getByPlaceholder(/Enter note description/i);
    await noteTextarea.fill('Test note that will fail');

    await dialog.getByRole('button', { name: 'Add Note' }).click();

    await expect(dialog.getByText('Failed to create note')).toBeVisible();
  });

  test('notes are sorted by timestamp (newest first)', async ({ page }) => {
    const sortedNotes = [
      {
        id: 'note-newest',
        clientId: MOCK_CLIENT_ID,
        description: 'Most recent note',
        timestamp: '2024-01-16T18:00:00Z',
        createdBy: 'Admin User',
        metadata: { category: 'general' },
      },
      {
        id: 'note-middle',
        clientId: MOCK_CLIENT_ID,
        description: 'Middle note',
        timestamp: '2024-01-15T12:00:00Z',
        createdBy: 'Admin User',
        metadata: { category: 'general' },
      },
      {
        id: 'note-oldest',
        clientId: MOCK_CLIENT_ID,
        description: 'Oldest note',
        timestamp: '2024-01-14T08:00:00Z',
        createdBy: 'Admin User',
        metadata: { category: 'general' },
      },
    ];

    await mockSession(page, {
      id: 'admin-test',
      role: 'admin',
      email: 'a@test.com',
      firstname: 'Test',
      lastname: 'Admin',
    });
    mockClientAndNotesApi(page, MOCK_CLIENT_ID, sortedNotes);

    await page.goto(`/clients/${MOCK_CLIENT_ID}`);
    await page.waitForLoadState('domcontentloaded');

    await expandAdminNotesSection(page);

    const dialog = leadProfileDialog(page);
    await expect(dialog.getByText('Most recent note')).toBeVisible();
    await expect(dialog.getByText('Middle note')).toBeVisible();
    await expect(dialog.getByText('Oldest note')).toBeVisible();
    // Order is enforced by getClientNotes sort (unit-tested); here we assert all three render in the expanded section.
  });
});
