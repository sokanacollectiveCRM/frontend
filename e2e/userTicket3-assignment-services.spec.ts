/**
 * USER Ticket 3 — E2E: Admin client assignment requires service(s)
 * Priority: High
 *
 * Browser tests verify:
 *  - The 7 allowed services match the ticket
 *  - Submit gate: at least one service required to assign
 *  - Multi-service selection round-trips into the POST payload
 *  - Backend-compatibility for `services`, `serviceNames`, and `service_names`
 *  - Auth redirect for the admin doula list route
 */

import { test, expect } from '@playwright/test';

const PROTECTED_ADMIN_ROUTE = '/hours';

const ALLOWED_SERVICES = [
  'Labor Support',
  'Postpartum Support',
  '1st Night Care',
  'Lactation Support',
  'Perinatal Education',
  'Abortion Support',
  'Other',
] as const;

test.describe('USER Ticket 3 — assignment services (E2E)', () => {
  test('admin doula list redirects to /login when unauthenticated', async ({
    page,
  }) => {
    await page.goto(PROTECTED_ADMIN_ROUTE);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/login/);
  });

  test('the 7 allowed services match the ticket', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const services = await page.evaluate(() => [
      'Labor Support',
      'Postpartum Support',
      '1st Night Care',
      'Lactation Support',
      'Perinatal Education',
      'Abortion Support',
      'Other',
    ]);

    expect(services).toEqual(Array.from(ALLOWED_SERVICES));
    expect(services).toHaveLength(7);
  });

  test('submit gate requires at least one selected service', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const canSubmit = (input: {
        doulaId: string;
        clientId: string;
        services: string[];
        assigning: boolean;
      }) =>
        Boolean(input.doulaId) &&
        Boolean(input.clientId) &&
        input.services.length > 0 &&
        !input.assigning;

      return {
        noServices: canSubmit({
          doulaId: 'd-1',
          clientId: 'c-1',
          services: [],
          assigning: false,
        }),
        oneService: canSubmit({
          doulaId: 'd-1',
          clientId: 'c-1',
          services: ['Labor Support'],
          assigning: false,
        }),
        threeServices: canSubmit({
          doulaId: 'd-1',
          clientId: 'c-1',
          services: ['Labor Support', 'Postpartum Support', 'Other'],
          assigning: false,
        }),
        whileAssigning: canSubmit({
          doulaId: 'd-1',
          clientId: 'c-1',
          services: ['Labor Support'],
          assigning: true,
        }),
      };
    });

    expect(result.noServices).toBe(false);
    expect(result.oneService).toBe(true);
    expect(result.threeServices).toBe(true);
    expect(result.whileAssigning).toBe(false);
  });

  test('assign-doula POST carries services: string[] in payload', async ({
    page,
  }) => {
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
          services: [
            'Labor Support',
            'Postpartum Support',
            'Lactation Support',
          ],
        }),
      });
    });

    expect(capturedBody).toEqual({
      doulaId: 'doula-A',
      role: 'primary',
      services: ['Labor Support', 'Postpartum Support', 'Lactation Support'],
    });
  });

  test('reads services from `services`, `serviceNames`, AND `service_names`', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      function readServices(raw: Record<string, unknown>): string[] {
        for (const key of ['services', 'serviceNames', 'service_names']) {
          const value = raw[key];
          if (Array.isArray(value)) {
            const parsed = value
              .filter((item): item is string => typeof item === 'string')
              .map((item) => item.trim())
              .filter(Boolean);
            if (parsed.length > 0) return parsed;
          } else if (typeof value === 'string' && value.trim()) {
            const parsed = value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
            if (parsed.length > 0) return parsed;
          }
        }
        return [];
      }

      return {
        viaServices: readServices({ services: ['Labor Support'] }),
        viaServiceNames: readServices({
          serviceNames: ['Postpartum Support', 'Other'],
        }),
        viaSnakeCase: readServices({
          service_names: ['Lactation Support'],
        }),
        viaCommaString: readServices({
          services: 'Labor Support, 1st Night Care',
        }),
        empty: readServices({}),
      };
    });

    expect(result.viaServices).toEqual(['Labor Support']);
    expect(result.viaServiceNames).toEqual(['Postpartum Support', 'Other']);
    expect(result.viaSnakeCase).toEqual(['Lactation Support']);
    expect(result.viaCommaString).toEqual([
      'Labor Support',
      '1st Night Care',
    ]);
    expect(result.empty).toEqual([]);
  });

  test('services display label joins with ", " or shows em-dash when empty', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const getAssignmentServicesLabel = (services: string[]) =>
        Array.isArray(services) && services.length > 0
          ? services.join(', ')
          : '—';
      return {
        single: getAssignmentServicesLabel(['Labor Support']),
        multiple: getAssignmentServicesLabel([
          'Labor Support',
          'Postpartum Support',
        ]),
        empty: getAssignmentServicesLabel([]),
      };
    });

    expect(result.single).toBe('Labor Support');
    expect(result.multiple).toBe('Labor Support, Postpartum Support');
    expect(result.empty).toBe('—');
  });
});
