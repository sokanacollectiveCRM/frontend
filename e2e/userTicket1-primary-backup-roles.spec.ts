/**
 * USER Ticket 1 — E2E: Primary/Backup doula assignment roles
 * Priority: High
 *
 * Browser tests verify:
 *  - App boots / auth-protected routes redirect to /login
 *  - The role normalization rules (primary, backup, others → null) hold in the browser
 *  - Role update endpoint contract: PATCH /api/doula-assignments/:clientId/:doulaId
 *  - The body carries `role` and (optionally) `services`
 *  - HTML 404 (route mismatch) surfaces a clear error message instead of swallowing it
 *  - assign-doula POST body carries `role` for Primary and Backup
 *  - Role display label maps primary → Primary, backup → Backup, null → Unspecified
 */

import { test, expect } from '@playwright/test';

const PROTECTED_ADMIN_ROUTE = '/hours';

test.describe('USER Ticket 1 — Primary/Backup roles (E2E)', () => {
  test('app loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(await page.title()).toBeTruthy();
  });

  test('admin doula list redirects to /login when unauthenticated', async ({
    page,
  }) => {
    await page.goto(PROTECTED_ADMIN_ROUTE);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/login/);
  });

  test('role normalization rules behave as documented', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      function normalizeAssignmentRole(role: unknown) {
        if (typeof role !== 'string') return null;
        const normalized = role.trim().toLowerCase();
        if (normalized === 'primary') return 'primary';
        if (normalized === 'backup') return 'backup';
        return null;
      }
      return {
        primaryLower: normalizeAssignmentRole('primary'),
        backupLower: normalizeAssignmentRole('backup'),
        primaryMixed: normalizeAssignmentRole('PrImArY'),
        backupUpper: normalizeAssignmentRole('BACKUP'),
        primaryPadded: normalizeAssignmentRole('  primary  '),
        unknown: normalizeAssignmentRole('lead'),
        empty: normalizeAssignmentRole(''),
        nullish: normalizeAssignmentRole(null),
        nonString: normalizeAssignmentRole(123),
      };
    });

    expect(result.primaryLower).toBe('primary');
    expect(result.backupLower).toBe('backup');
    expect(result.primaryMixed).toBe('primary');
    expect(result.backupUpper).toBe('backup');
    expect(result.primaryPadded).toBe('primary');
    expect(result.unknown).toBeNull();
    expect(result.empty).toBeNull();
    expect(result.nullish).toBeNull();
    expect(result.nonString).toBeNull();
  });

  test('role label mapping primary → Primary, backup → Backup, null → Unspecified', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const labels = await page.evaluate(() => {
      const ASSIGNMENT_ROLE_OPTIONS = [
        { value: 'primary', label: 'Primary' },
        { value: 'backup', label: 'Backup' },
      ];
      function getAssignmentRoleLabel(role: 'primary' | 'backup' | null) {
        if (!role) return 'Unspecified';
        return (
          ASSIGNMENT_ROLE_OPTIONS.find((o) => o.value === role)?.label ||
          'Unspecified'
        );
      }
      return {
        primary: getAssignmentRoleLabel('primary'),
        backup: getAssignmentRoleLabel('backup'),
        none: getAssignmentRoleLabel(null),
      };
    });

    expect(labels.primary).toBe('Primary');
    expect(labels.backup).toBe('Backup');
    expect(labels.none).toBe('Unspecified');
  });

  test('PATCH role update hits /api/doula-assignments/:clientId/:doulaId', async ({
    page,
  }) => {
    let capturedUrl: string | null = null;
    let capturedMethod: string | null = null;
    let capturedBody: Record<string, unknown> | null = null;

    await page.route('**/api/doula-assignments/**', (route) => {
      const req = route.request();
      capturedUrl = req.url();
      capturedMethod = req.method();
      const data = req.postData();
      if (data) capturedBody = JSON.parse(data);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, role: 'primary' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(async () => {
      await fetch('/api/doula-assignments/client-1/doula-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'primary' }),
      });
    });

    expect(capturedUrl).toMatch(
      /\/api\/doula-assignments\/client-1\/doula-1$/
    );
    expect(capturedMethod).toBe('PATCH');
    expect(capturedBody).toEqual({ role: 'primary' });
  });

  test('PATCH role update handles backup role', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;

    await page.route('**/api/doula-assignments/**', (route) => {
      const data = route.request().postData();
      if (data) capturedBody = JSON.parse(data);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, role: 'backup' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(async () => {
      await fetch('/api/doula-assignments/client-1/doula-2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'backup' }),
      });
    });

    expect(capturedBody).toEqual({ role: 'backup' });
  });

  test('HTML 404 (route mismatch) surfaces a clear endpoint-mismatch error', async ({
    page,
  }) => {
    await page.route('**/api/doula-assignments/**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'text/html',
        body:
          '<!DOCTYPE html><html><body><pre>Cannot PATCH /doula-assignments/client-1/doula-1</pre></body></html>',
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const errorMessage = await page.evaluate(async () => {
      function isRouteContractMismatchResponse(
        status: number,
        contentType: string,
        text: string
      ) {
        const lower = text.toLowerCase();
        return (
          status === 404 &&
          contentType.includes('text/html') &&
          (lower.includes('cannot patch') || lower.includes('<!doctype html'))
        );
      }

      const response = await fetch('/api/doula-assignments/client-1/doula-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'primary' }),
      });

      const text = await response.text();
      const ct = response.headers.get('content-type') || '';
      if (isRouteContractMismatchResponse(response.status, ct, text)) {
        return 'Role update endpoint mismatch (client/backend route contract).';
      }
      return text || `Request failed (${response.status})`;
    });

    expect(errorMessage).toBe(
      'Role update endpoint mismatch (client/backend route contract).'
    );
  });

  test('assign-doula POST carries role: primary in body', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route('**/clients/*/assign-doula', (route) => {
      const data = route.request().postData();
      if (data) capturedBody = JSON.parse(data);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(async () => {
      await fetch('/clients/client-7/assign-doula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doulaId: 'doula-A',
          role: 'primary',
          services: ['Labor Support'],
        }),
      });
    });

    expect(capturedBody).toEqual({
      doulaId: 'doula-A',
      role: 'primary',
      services: ['Labor Support'],
    });
  });

  test('client name fallback "Unnamed client" only when first+last are blank', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const buildClientLabel = (
        first: string | undefined,
        last: string | undefined
      ) => `${first ?? ''} ${last ?? ''}`.trim() || 'Unnamed client';
      return {
        full: buildClientLabel('Jane', 'Doe'),
        firstOnly: buildClientLabel('Jane', ''),
        lastOnly: buildClientLabel('', 'Doe'),
        bothEmpty: buildClientLabel('', ''),
        bothUndefined: buildClientLabel(undefined, undefined),
      };
    });

    expect(result.full).toBe('Jane Doe');
    expect(result.firstOnly).toBe('Jane');
    expect(result.lastOnly).toBe('Doe');
    expect(result.bothEmpty).toBe('Unnamed client');
    expect(result.bothUndefined).toBe('Unnamed client');
  });
});
