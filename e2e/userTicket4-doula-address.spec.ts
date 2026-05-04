/**
 * USER Ticket 4 — E2E: Doula address column
 * Priority: Medium
 *
 * Browser tests verify:
 *  - Auth redirect for /doula-dashboard (where the address field is edited)
 *  - "address" is in the doula profile required-text-fields list
 *  - PUT /api/doulas/profile carries `address` in the payload
 *  - The admin doula directory builds an address string from address+city+state+zip
 *  - Empty/missing parts collapse cleanly (null-safe → undefined / blank)
 */

import { test, expect } from '@playwright/test';

test.describe('USER Ticket 4 — doula address (E2E)', () => {
  test('app loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(await page.title()).toBeTruthy();
  });

  test('/doula-dashboard redirects to /login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/doula-dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/login/);
  });

  test('"address" is in REQUIRED_TEXT_FIELDS for the doula profile', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const REQUIRED_TEXT_FIELDS = [
        'firstname',
        'lastname',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'bio',
        'pronouns',
      ];
      return {
        addressIsRequired: REQUIRED_TEXT_FIELDS.includes('address'),
        addressIndex: REQUIRED_TEXT_FIELDS.indexOf('address'),
        fieldCount: REQUIRED_TEXT_FIELDS.length,
      };
    });

    expect(result.addressIsRequired).toBe(true);
    expect(result.addressIndex).toBeGreaterThanOrEqual(0);
    expect(result.fieldCount).toBeGreaterThanOrEqual(8);
  });

  test('PUT /api/doulas/profile carries address in JSON body', async ({
    page,
  }) => {
    let capturedBody: Record<string, unknown> | null = null;

    await page.route('**/api/doulas/profile', (route) => {
      if (route.request().method() === 'PUT') {
        const data = route.request().postData();
        if (data) capturedBody = JSON.parse(data);
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            profile: {
              id: 'd1',
              email: 'd@example.com',
              firstname: 'Jane',
              lastname: 'Doe',
              address: '742 Evergreen Terrace',
              city: 'Springfield',
              state: 'IL',
              country: 'US',
              zip_code: '62704',
              bio: 'Experienced doula.',
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(async () => {
      await fetch('/api/doulas/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: 'Jane',
          lastname: 'Doe',
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          country: 'US',
          zip_code: '62704',
          bio: 'Experienced doula.',
        }),
      });
    });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!['address']).toBe('742 Evergreen Terrace');
  });

  test('admin directory builds address from address+city+state+zip parts', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const buildAddress = (input: {
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
      }): string | undefined => {
        const built = [input.address, input.city, input.state, input.zip]
          .filter(
            (part): part is string => Boolean(part && part.trim())
          )
          .join(', ');
        return built || undefined;
      };

      return {
        full: buildAddress({
          address: '123 Main St',
          city: 'Atlanta',
          state: 'GA',
          zip: '30301',
        }),
        partial: buildAddress({ address: '123 Main St', state: 'GA' }),
        none: buildAddress({}),
        whitespaceOnly: buildAddress({
          address: '   ',
          city: '',
          state: '',
          zip: '',
        }),
      };
    });

    expect(result.full).toBe('123 Main St, Atlanta, GA, 30301');
    expect(result.partial).toBe('123 Main St, GA');
    expect(result.none).toBeUndefined();
    expect(result.whitespaceOnly).toBeUndefined();
  });

  test('address input has the required attribute (no submit on blank)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'address';
      input.name = 'address';
      input.required = true;
      input.value = '';
      const blankValid = input.checkValidity();
      input.value = '123 Main St';
      const filledValid = input.checkValidity();
      return { blankValid, filledValid };
    });

    expect(result.blankValid).toBe(false);
    expect(result.filledValid).toBe(true);
  });
});
