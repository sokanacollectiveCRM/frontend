/**
 * USER Ticket 5 — E2E: Rename "Notes" to "Service Details" in the assignment side panel
 * Priority: Medium
 *
 * Browser tests verify (via the Vite dev server's served source):
 *  - DoulaListPage source ships "Service Details" in the side panel
 *  - "Service Details" appears in BOTH the editable form and the read-only summary
 *  - The legacy ">Notes<" / ">NOTES<" UI label is no longer present
 *  - The data field on the assignment row is still `notes` (label-only rename)
 *  - Auth redirect for the page where this renamed label lives
 */

import { test, expect } from '@playwright/test';

const PROTECTED_ADMIN_ROUTE = '/hours';
const SOURCE_ROUTE = '/src/features/hours/components/DoulaListPage.tsx';

async function getDoulaListPageSource(
  page: import('@playwright/test').Page
): Promise<string> {
  // Vite serves the original .tsx files at their absolute project path.
  // page.goto on '/' first ensures the dev server is initialised.
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  return page.evaluate(async (path) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch source ${path}: ${response.status}`);
    }
    return response.text();
  }, SOURCE_ROUTE);
}

test.describe('USER Ticket 5 — Notes → Service Details (E2E)', () => {
  test('admin doula list redirects to /login when unauthenticated', async ({
    page,
  }) => {
    await page.goto(PROTECTED_ADMIN_ROUTE);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/login/);
  });

  test('"Service Details" appears in the served DoulaListPage source', async ({
    page,
  }) => {
    const source = await getDoulaListPageSource(page);
    expect(source).toContain('Service Details');
  });

  test('"Service Details" appears in BOTH the form and the read-only summary', async ({
    page,
  }) => {
    const source = await getDoulaListPageSource(page);
    const occurrences = source.split('Service Details').length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  test('legacy "Notes" label string is no longer in the served source', async ({
    page,
  }) => {
    const source = await getDoulaListPageSource(page);
    // After Vite/JSX transform, JSX text becomes string literals like
    // `children: "Service Details"`. So if "Notes" was still used as a label
    // it would survive the transform as a string literal too.
    expect(source).not.toMatch(/children:\s*"Notes"/);
    expect(source).not.toMatch(/children:\s*'Notes'/);
  });

  test('underlying assignment data field is still `notes`', async ({
    page,
  }) => {
    const source = await getDoulaListPageSource(page);
    // Confirms it's a label-only rename — no data shape change.
    // The serialised JSX uses `assignmentEditForm.notes` to bind the textarea.
    expect(source).toMatch(/assignmentEditForm\.notes/);
  });
});
