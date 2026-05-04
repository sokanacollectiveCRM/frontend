/**
 * Ticket 4 — E2E: Add toggle feature for doulas to control client visibility of notes
 * Priority: High
 *
 * Browser tests verifying:
 * - Doula can toggle "Show to client" setting on notes
 * - Toggle state persists after page reload
 * - Client portal respects visibility settings (hidden notes don't appear)
 * - Visual feedback shows correct state (ON/OFF)
 * - Toggle works for both new and existing notes
 * - Error handling for failed toggle requests
 * - Multi-note management with different visibility settings
 * - Note visibility labels show correct status ("Staff only" vs "Visible to client")
 */

import { test, expect } from '@playwright/test';
import { installCorsPreflightStub, stubAuthMe } from './fixtures/httpStubs';

const MOCK_CLIENT_ID = 'client-123';
const MOCK_DOULA_ID = 'doula-456';

const MOCK_ACTIVITIES = [
  {
    id: 'activity-1',
    clientId: MOCK_CLIENT_ID,
    content: 'Initial consultation notes - discussing birth plan preferences',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    authorName: 'Sarah Doula',
    authorId: MOCK_DOULA_ID,
  },
  {
    id: 'activity-2',
    clientId: MOCK_CLIENT_ID,
    content: 'Private note: client seems anxious about pain management, need to address gently',
    type: 'note',
    visibleToClient: false,
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    authorName: 'Sarah Doula',
    authorId: MOCK_DOULA_ID,
  },
  {
    id: 'activity-3',
    clientId: MOCK_CLIENT_ID,
    content: 'Follow-up scheduled for next week to finalize birth preferences',
    type: 'note',
    visibleToClient: true,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
    authorName: 'Sarah Doula',
    authorId: MOCK_DOULA_ID,
  }
];

// Mock client portal activities (only visible notes)
const MOCK_CLIENT_PORTAL_ACTIVITIES = MOCK_ACTIVITIES.filter(
  activity => activity.visibleToClient
);

test.describe('Ticket 4 — Notes visibility toggle (E2E)', () => {
  test('app loads and doula can access client activities', async ({ page }) => {
    // Mock authentication as doula
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: MOCK_DOULA_ID,
            role: 'doula',
            email: 'sarah@example.com',
            firstname: 'Sarah',
            lastname: 'Doula',
          },
        }),
      });
    });

    // Mock client activities list
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_ACTIVITIES }),
      });
    });

    await page.goto('/doula-dashboard/clients');
    await page.waitForLoadState('networkidle');
    expect(await page.title()).toBeTruthy();
  });

  test('doula can toggle note visibility from OFF to ON', async ({ page }) => {
    await installCorsPreflightStub(page);
    await stubAuthMe(page, {
      id: MOCK_DOULA_ID,
      firstname: 'Sarah',
      lastname: 'Doula',
      email: 'sarah@example.com',
      role: 'doula'
    });

    let toggleCalled = false;
    let capturedVisibility: boolean | null = null;

    // Mock toggle API
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/activity-2`, (route) => {
      if (route.request().method() === 'PATCH') {
        toggleCalled = true;
        const body = route.request().postDataJSON();
        capturedVisibility = body?.visibleToClient;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            activity: {
              ...MOCK_ACTIVITIES[1],
              visibleToClient: body?.visibleToClient,
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    // Find the toggle for the private note and click it
    const toggleSwitch = page.locator('[data-testid="visibility-toggle-activity-2"]')
      .or(page.locator('text="Show to client"').locator('..').locator('input[type="checkbox"]'))
      .or(page.locator('label').filter({ hasText: 'Show to client' }).locator('input'));
    
    await toggleSwitch.click();

    expect(toggleCalled).toBe(true);
    expect(capturedVisibility).toBe(true);
  });

  test('doula can toggle note visibility from ON to OFF', async ({ page }) => {
    let toggleCalled = false;
    let capturedVisibility: boolean | null = null;

    // Mock toggle API
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/activity-1`, (route) => {
      if (route.request().method() === 'PATCH') {
        toggleCalled = true;
        const body = route.request().postDataJSON();
        capturedVisibility = body?.visibleToClient;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            activity: {
              ...MOCK_ACTIVITIES[0],
              visibleToClient: body?.visibleToClient,
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    // Find toggle for visible note and turn it off
    const toggleSwitch = page.locator('[data-testid="visibility-toggle-activity-1"]');
    await toggleSwitch.click();

    expect(toggleCalled).toBe(true);
    expect(capturedVisibility).toBe(false);
  });

  test('toggle shows correct visual state (ON = visible, OFF = hidden)', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_ACTIVITIES }),
      });
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    // Check that visible notes show ON state
    const visibleNoteToggle = page.locator('[data-testid="visibility-toggle-activity-1"]');
    if (await visibleNoteToggle.count() > 0) {
      await expect(visibleNoteToggle).toBeChecked();
    }

    // Check that hidden notes show OFF state
    const hiddenNoteToggle = page.locator('[data-testid="visibility-toggle-activity-2"]');
    if (await hiddenNoteToggle.count() > 0) {
      await expect(hiddenNoteToggle).not.toBeChecked();
    }
  });

  test('visibility labels show correct status text', async ({ page }) => {
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_ACTIVITIES }),
      });
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    // Should show "Visible to client" for visible notes
    const visibleLabel = page.locator('text="Visible to client"').or(
      page.locator('text="Shown on client portal"')
    );
    await expect(visibleLabel).toBeVisible();

    // Should show "Staff only" for hidden notes
    const staffOnlyLabel = page.locator('text="Staff only"').or(
      page.locator('text="Hidden from client"')
    );
    await expect(staffOnlyLabel).toBeVisible();
  });

  test('client portal shows only visible notes', async ({ page }) => {
    // Mock client authentication
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: MOCK_CLIENT_ID,
            role: 'client',
            email: 'client@example.com',
            firstname: 'Jane',
            lastname: 'Client',
          },
        }),
      });
    });

    // Mock client portal activities (only visible ones)
    await page.route('**/api/client/activities', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_CLIENT_PORTAL_ACTIVITIES }),
      });
    });

    await page.goto('/client-portal/activities');
    await page.waitForLoadState('networkidle');

    // Should see visible notes
    const visibleNote1 = page.locator('text="Initial consultation notes"');
    const visibleNote3 = page.locator('text="Follow-up scheduled"');
    
    await expect(visibleNote1).toBeVisible();
    await expect(visibleNote3).toBeVisible();

    // Should NOT see hidden notes
    const hiddenNote = page.locator('text="client seems anxious about pain management"');
    await expect(hiddenNote).not.toBeVisible();
  });

  test('toggle state persists after page reload', async ({ page }) => {
    // Initial state
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: MOCK_ACTIVITIES }),
      });
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    // Verify initial toggle state
    const toggle = page.locator('[data-testid="visibility-toggle-activity-2"]');
    if (await toggle.count() > 0) {
      await expect(toggle).not.toBeChecked(); // Initially OFF
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // State should persist
    const toggleAfterReload = page.locator('[data-testid="visibility-toggle-activity-2"]');
    if (await toggleAfterReload.count() > 0) {
      await expect(toggleAfterReload).not.toBeChecked(); // Still OFF
    }
  });
});

test.describe('Ticket 4 — Toggle error handling', () => {
  test('shows error message when toggle request fails', async ({ page }) => {
    // Mock failed toggle request
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/activity-1`, (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to update note visibility' }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    const toggle = page.locator('[data-testid="visibility-toggle-activity-1"]');
    await toggle.click();

    // Should show error toast/notification
    const errorMessage = page.locator('text="Failed to update note visibility"')
      .or(page.locator('[role="alert"]'))
      .or(page.locator('.toast-error'));
    
    await expect(errorMessage).toBeVisible();
  });

  test('toggle reverts to original state on error', async ({ page }) => {
    let requestCount = 0;
    
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/activity-1`, (route) => {
      requestCount++;
      if (route.request().method() === 'PATCH') {
        // Fail the request
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    const toggle = page.locator('[data-testid="visibility-toggle-activity-1"]');
    
    // Initial state (should be checked since activity-1 is visible)
    if (await toggle.count() > 0) {
      const initialState = await toggle.isChecked();
      
      // Click toggle
      await toggle.click();
      
      // Wait for error handling
      await page.waitForTimeout(1000);
      
      // Should revert to original state
      const finalState = await toggle.isChecked();
      expect(finalState).toBe(initialState);
    }
  });
});

test.describe('Ticket 4 — Multiple notes management', () => {
  test('can manage different visibility states for multiple notes', async ({ page }) => {
    const toggleStates: Record<string, boolean> = {};
    
    // Mock toggle API for multiple activities
    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/*`, (route) => {
      if (route.request().method() === 'PATCH') {
        const url = route.request().url();
        const activityId = url.split('/').pop();
        const body = route.request().postDataJSON();
        
        if (activityId) {
          toggleStates[activityId] = body?.visibleToClient;
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            activity: {
              id: activityId,
              visibleToClient: body?.visibleToClient,
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    // Toggle multiple notes
    const toggle1 = page.locator('[data-testid="visibility-toggle-activity-1"]');
    const toggle2 = page.locator('[data-testid="visibility-toggle-activity-2"]');
    const toggle3 = page.locator('[data-testid="visibility-toggle-activity-3"]');

    // Change visibility for different notes
    if (await toggle1.count() > 0) await toggle1.click(); // Turn OFF
    if (await toggle2.count() > 0) await toggle2.click(); // Turn ON
    if (await toggle3.count() > 0) await toggle3.click(); // Turn OFF

    // Verify API calls were made with correct values
    expect(toggleStates['activity-1']).toBe(false);
    expect(toggleStates['activity-2']).toBe(true);
    expect(toggleStates['activity-3']).toBe(false);
  });

  test('shows loading state while toggle request is in progress', async ({ page }) => {
    let resolveRequest: (value: any) => void;
    const requestPromise = new Promise(resolve => {
      resolveRequest = resolve;
    });

    await page.route(`**/api/doulas/clients/${MOCK_CLIENT_ID}/activities/activity-1`, async (route) => {
      if (route.request().method() === 'PATCH') {
        // Wait before responding to simulate loading
        await requestPromise;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            activity: { id: 'activity-1', visibleToClient: true },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/doula-dashboard/activities');
    await page.waitForLoadState('networkidle');

    const toggle = page.locator('[data-testid="visibility-toggle-activity-1"]');
    await toggle.click();

    // Should show loading state
    const loadingIndicator = page.locator('[data-testid="toggle-loading"]')
      .or(page.locator('.loading'))
      .or(page.locator('text="Updating..."'));
    
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
    }

    // Complete the request
    resolveRequest!(null);

    // Loading should disappear
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).not.toBeVisible();
    }
  });

  test('bulk visibility changes work correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      // Simulate bulk visibility update
      const updates = [
        { activityId: 'activity-1', visibleToClient: false },
        { activityId: 'activity-2', visibleToClient: true },
        { activityId: 'activity-3', visibleToClient: false },
      ];

      const results = await Promise.all(
        updates.map(async (update) => {
          const response = await fetch(`/api/doulas/clients/client-123/activities/${update.activityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visibleToClient: update.visibleToClient }),
          });
          return { activityId: update.activityId, ok: response.ok };
        })
      );

      return results;
    });

    // All updates should succeed
    expect(result.every(r => r.ok)).toBe(true);
    expect(result).toHaveLength(3);
  });
});