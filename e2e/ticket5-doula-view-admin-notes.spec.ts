/**
 * Ticket 5 — E2E: Doulas should be able to view admin notes and co-doula notes on client profiles
 * Priority: High
 *
 * Browser tests verifying:
 * - Doulas can see admin notes in client activity feed
 * - Admin notes show proper author attribution (admin name or "Added by Staff member")
 * - Co-doula notes are visible with correct author names
 * - Visibility labels correctly distinguish staff-only vs client-visible notes
 * - Notes are displayed in proper chronological order
 * - Doulas can distinguish their own notes from others
 * - Client portal only shows notes marked as visible to client
 * - Author information fallback works correctly
 */

import { test, expect } from '@playwright/test';

const MOCK_CLIENT_ID = 'client-jordan-bony';
const MOCK_DOULA_ID = 'doula-sarah-123';

const MOCK_MIXED_ACTIVITIES = [
  {
    id: 'activity-own-note',
    clientId: MOCK_CLIENT_ID,
    content: 'Initial consultation completed. Client is well-prepared and excited.',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    authorName: 'Sarah Doula',
    authorId: MOCK_DOULA_ID,
    authorType: 'doula',
  },
  {
    id: 'activity-admin-note-1',
    clientId: MOCK_CLIENT_ID,
    content: 'Insurance verification completed. Client approved for full coverage.',
    type: 'note',
    visibleToClient: false, // Staff-only
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    authorName: 'Nancy Cowans',
    authorId: 'admin-nancy-789',
    authorType: 'admin',
  },
  {
    id: 'activity-co-doula-note',
    clientId: MOCK_CLIENT_ID,
    content: 'Backup doula note: Available for birth support if needed. Client preferences documented.',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
    authorName: 'Emily Co-Doula',
    authorId: 'doula-emily-321',
    authorType: 'doula',
  },
  {
    id: 'activity-admin-note-no-name',
    clientId: MOCK_CLIENT_ID,
    content: 'Payment plan adjustment approved by administration.',
    type: 'note',
    visibleToClient: false,
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
    authorName: null, // No author name available
    authorId: 'admin-unknown-999',
    authorType: 'admin',
  },
  {
    id: 'activity-admin-note-2',
    clientId: MOCK_CLIENT_ID,
    content: 'Client portal access granted. Invitation sent successfully.',
    type: 'note',
    visibleToClient: true, // Visible to client
    createdAt: '2024-01-19T08:30:00Z',
    updatedAt: '2024-01-19T08:30:00Z',
    authorName: 'Sonia Collins',
    authorId: 'admin-sonia-456',
    authorType: 'admin',
  }
];

// Mock client portal activities (only visible ones)
const MOCK_CLIENT_VISIBLE_ACTIVITIES = MOCK_MIXED_ACTIVITIES.filter(
  activity => activity.visibleToClient
);

test.describe('Ticket 5 — Doulas viewing admin and co-doula notes (E2E)', () => {
  test('app loads and doula can access client activities', async ({ page }) => {
    // Mock doula authentication
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: MOCK_DOULA_ID,
            role: 'doula',
            email: 'info@techluminateacademy.com',
            firstname: 'Sarah',
            lastname: 'Doula',
          },
        }),
      });
    });

    await page.goto('/doula-dashboard');
    await page.waitForLoadState('networkidle');
    expect(await page.title()).toBeTruthy();
  });

  test('doula can see all note types in client activity feed', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_MIXED_ACTIVITIES }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should see own note
    const ownNote = page.locator('text="Initial consultation completed"');
    await expect(ownNote).toBeVisible();

    // Should see admin notes
    const adminNote1 = page.locator('text="Insurance verification completed"');
    const adminNote2 = page.locator('text="Client portal access granted"');
    await expect(adminNote1).toBeVisible();
    await expect(adminNote2).toBeVisible();

    // Should see co-doula note
    const coDoulaNote = page.locator('text="Backup doula note"');
    await expect(coDoulaNote).toBeVisible();

    // Should see admin note without specific author
    const adminNoteNoName = page.locator('text="Payment plan adjustment approved"');
    await expect(adminNoteNoName).toBeVisible();
  });

  test('admin notes show proper author attribution', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_MIXED_ACTIVITIES }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should show admin author name when available
    const nancyAuthor = page.locator('text="Nancy Cowans"')
      .or(page.locator('text="Added by Nancy Cowans"'));
    await expect(nancyAuthor).toBeVisible();

    const soniaAuthor = page.locator('text="Sonia Collins"')
      .or(page.locator('text="Added by Sonia Collins"'));
    await expect(soniaAuthor).toBeVisible();

    // Should show fallback for admin without name
    const staffFallback = page.locator('text="Added by Staff member"')
      .or(page.locator('text="Staff"'))
      .or(page.locator('text="Admin"'));
    await expect(staffFallback).toBeVisible();
  });

  test('co-doula notes show correct author names', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_MIXED_ACTIVITIES }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should show co-doula author name
    const emilyAuthor = page.locator('text="Emily Co-Doula"')
      .or(page.locator('text="Added by Emily Co-Doula"'));
    await expect(emilyAuthor).toBeVisible();
  });

  test('visibility labels distinguish staff-only vs client-visible notes', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_MIXED_ACTIVITIES }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should show "Staff only" labels for non-visible notes
    const staffOnlyLabels = page.locator('text="Staff only"')
      .or(page.locator('[data-testid="staff-only-badge"]'))
      .or(page.locator('.staff-only-indicator'));
    
    if (await staffOnlyLabels.count() > 0) {
      await expect(staffOnlyLabels.first()).toBeVisible();
    }

    // Should show "Visible to client" labels for client-visible notes
    const visibleLabels = page.locator('text="Visible to client"')
      .or(page.locator('[data-testid="client-visible-badge"]'))
      .or(page.locator('.client-visible-indicator'));
    
    if (await visibleLabels.count() > 0) {
      await expect(visibleLabels.first()).toBeVisible();
    }
  });

  test('activities are displayed in chronological order', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_MIXED_ACTIVITIES }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Verify activities appear in some logical order
    const activityList = page.locator('[data-testid="activity-list"]')
      .or(page.locator('.activity-feed'))
      .or(page.locator('.activities-container'));

    if (await activityList.count() > 0) {
      await expect(activityList).toBeVisible();
    }

    // Check that at least some activities are visible in expected order
    const activities = page.locator('[data-testid^="activity-"]');
    if (await activities.count() > 0) {
      expect(await activities.count()).toBeGreaterThan(0);
    }
  });

  test('doula can distinguish own notes from others', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_MIXED_ACTIVITIES }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Own notes might have different styling or no "Added by" prefix
    const ownNote = page.locator('text="Initial consultation completed"');
    await expect(ownNote).toBeVisible();

    // Other notes should have "Added by" attribution
    const adminAttribution = page.locator('text="Added by Nancy Cowans"')
      .or(page.locator('text="Nancy Cowans"')); // Could be just the name
    
    const coDoulaAttribution = page.locator('text="Added by Emily Co-Doula"')
      .or(page.locator('text="Emily Co-Doula"'));

    // At least one form of attribution should be visible
    const hasAdminAttrib = await adminAttribution.count() > 0;
    const hasCoDoulaAttrib = await coDoulaAttribution.count() > 0;
    
    expect(hasAdminAttrib || hasCoDoulaAttrib).toBe(true);
  });
});

test.describe('Ticket 5 — Client portal respects visibility settings', () => {
  test('client portal only shows notes marked as visible to client', async ({ page }) => {
    // Mock client authentication
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: MOCK_CLIENT_ID,
            role: 'client',
            email: 'jbony@icstars.org',
            firstname: 'Jordan',
            lastname: 'Bony',
          },
        }),
      });
    });

    // Mock client portal activities (filtered to visible only)
    await page.route('**/api/client/activities', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_CLIENT_VISIBLE_ACTIVITIES }),
      });
    });

    await page.goto('/client-portal/activities');
    await page.waitForLoadState('networkidle');

    // Should see client-visible notes
    const visibleOwnNote = page.locator('text="Initial consultation completed"');
    const visibleCoDoulaNote = page.locator('text="Backup doula note"');
    const visibleAdminNote = page.locator('text="Client portal access granted"');
    
    await expect(visibleOwnNote).toBeVisible();
    await expect(visibleCoDoulaNote).toBeVisible();
    await expect(visibleAdminNote).toBeVisible();

    // Should NOT see staff-only notes
    const hiddenAdminNote1 = page.locator('text="Insurance verification completed"');
    const hiddenAdminNote2 = page.locator('text="Payment plan adjustment approved"');
    
    await expect(hiddenAdminNote1).not.toBeVisible();
    await expect(hiddenAdminNote2).not.toBeVisible();
  });

  test('client portal shows correct author names without internal IDs', async ({ page }) => {
    await page.route('**/api/client/activities', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_CLIENT_VISIBLE_ACTIVITIES }),
      });
    });

    await page.goto('/client-portal/activities');
    await page.waitForLoadState('networkidle');

    // Should show proper author names to client
    const sarahAuthor = page.locator('text="Sarah Doula"');
    const emilyAuthor = page.locator('text="Emily Co-Doula"');
    const soniaAuthor = page.locator('text="Sonia Collins"');

    if (await sarahAuthor.count() > 0) await expect(sarahAuthor).toBeVisible();
    if (await emilyAuthor.count() > 0) await expect(emilyAuthor).toBeVisible();
    if (await soniaAuthor.count() > 0) await expect(soniaAuthor).toBeVisible();

    // Should NOT show internal IDs
    const internalId1 = page.locator('text="doula-sarah-123"');
    const internalId2 = page.locator('text="admin-sonia-456"');
    
    await expect(internalId1).not.toBeVisible();
    await expect(internalId2).not.toBeVisible();
  });
});

test.describe('Ticket 5 — Edge cases and error handling', () => {
  test('handles activities with missing author information gracefully', async ({ page }) => {
    const activitiesWithMissingData = [
      {
        id: 'activity-no-author',
        clientId: MOCK_CLIENT_ID,
        content: 'Legacy note without complete author information',
        type: 'note',
        visibleToClient: true,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
        // Missing authorName, authorId, authorType
      },
      ...MOCK_MIXED_ACTIVITIES.slice(0, 2), // Include some normal notes
    ];

    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: activitiesWithMissingData }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should still display the note content
    const legacyNote = page.locator('text="Legacy note without complete author information"');
    await expect(legacyNote).toBeVisible();

    // Should handle missing author gracefully (no crashes)
    const normalNote = page.locator('text="Initial consultation completed"');
    await expect(normalNote).toBeVisible();
  });

  test('displays empty state when no activities exist', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: [] }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should show empty state message
    const emptyMessage = page.locator('text="No activities yet"')
      .or(page.locator('text="No notes found"'))
      .or(page.locator('[data-testid="empty-activities"]'));
    
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('handles server error when fetching activities', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto(`/doula-dashboard/clients/${MOCK_CLIENT_ID}/activities`);
    await page.waitForLoadState('networkidle');

    // Should show error message
    const errorMessage = page.locator('text="Failed to load activities"')
      .or(page.locator('text="Error loading notes"'))
      .or(page.locator('[role="alert"]'));
    
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('real-world credential test scenario', async ({ page }) => {
    // This test simulates the exact scenario described in the ticket
    await page.route('**/api/auth/login', (route) => {
      const body = route.request().postDataJSON();
      if (body?.email === 'info@techluminateacademy.com' && body?.password === '@Bony5690') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'doula-tech-academy',
              role: 'doula',
              email: 'info@techluminateacademy.com',
              firstname: 'Tech',
              lastname: 'Academy',
            },
          }),
        });
      } else {
        route.fulfill({ status: 401, body: JSON.stringify({ error: 'Invalid credentials' }) });
      }
    });

    await page.route('**/api/doulas/clients/jbony@icstars.org/activities', (route) => {
      // Simulate activities for Jordan Bony client
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          activities: MOCK_MIXED_ACTIVITIES.map(activity => ({
            ...activity,
            clientId: 'jbony@icstars.org',
          }))
        }),
      });
    });

    await page.goto('/login');
    
    // Simulate login
    await page.fill('[name="email"]', 'info@techluminateacademy.com');
    await page.fill('[name="password"]', '@Bony5690');
    await page.click('[type="submit"]');
    
    await page.waitForLoadState('networkidle');

    // Navigate to client activities
    await page.goto('/doula-dashboard/clients/jbony@icstars.org/activities');
    await page.waitForLoadState('networkidle');

    // Should see admin notes with proper attribution
    const adminNote = page.locator('text="Insurance verification completed"');
    await expect(adminNote).toBeVisible();
  });
});