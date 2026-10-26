import { test, expect } from '@playwright/test';
test('organization choice isolates uploads and a revoked choice falls back to the remaining organization', async ({
  page,
}) => {
  let removedB = false;
  const headers = {
    'access-control-allow-origin': 'http://127.0.0.1:3024',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  const user = (org: string) => ({
    id: `profile-${org}`,
    firstname: 'Fixture',
    lastname: org,
    email: 'doula@example.test',
    role: 'doula',
    emailVerified: true,
    tenant: { id: org, slug: org, name: org, role: 'doula' },
  });
  await page.route('http://localhost:5054/**', async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname,
      selected = req.headers()['x-tenant-id'];
    if (req.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers, body: '' });
    if (path === '/auth/me' && !selected && !removedB)
      return route.fulfill({
        status: 409,
        headers,
        json: {
          code: 'TENANT_SELECTION_REQUIRED',
          tenants: [
            { id: 'org-a', name: 'Organization A', slug: 'org-a' },
            { id: 'org-b', name: 'Organization B', slug: 'org-b' },
          ],
        },
      });
    if (path === '/auth/me' && selected === 'org-b' && removedB)
      return route.fulfill({
        status: 403,
        headers,
        json: {
          error: 'Organization membership is inactive',
          code: 'FORBIDDEN',
        },
      });
    const org = selected || 'org-a';
    let data: unknown = {
      success: true,
      records: [],
      activities: [],
      data: [],
    };
    if (path === '/auth/me') data = user(org);
    else if (path.endsWith('/doulas/profile'))
      data = {
        success: true,
        profile: {
          ...user(org),
          full_name: `Fixture ${org}`,
          phone_number: '5555550100',
          address: '1 Fictional Street',
          city: 'Chicago',
          state: 'IL',
          zip_code: '60601',
          country: 'US',
          bio: `Bio ${org}`,
          certifications: [],
          account_status: 'active',
          profile_review_status: 'draft',
        },
      };
    else if (path.endsWith('/doulas/availability'))
      data = { records: [], availabilityStatus: { status: 'available' } };
    else if (path.endsWith('/doulas/documents'))
      data = {
        documents: [
          {
            id: `doc-${org}`,
            documentType: 'w9',
            fileName: `${org}-w9.pdf`,
            fileUrl: `https://files.example.test/${org}`,
            status: 'uploaded',
            fileSize: 32,
            uploadedAt: '2026-10-26T12:00:00Z',
          },
        ],
        backgroundCheck: { status: 'not_cleared', setAt: null, setBy: null },
      };
    await route.fulfill({ status: 200, headers, json: data });
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Choose an organization' })
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Organization B', exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        sessionStorage.getItem('sokana-selected-organization')
      )
    )
    .toBe('org-b');
  await page.goto('/doula-dashboard/profile?step=documents');
  await expect(
    page.getByText('File: org-b-w9.pdf', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('File: org-a-w9.pdf', { exact: true })
  ).toHaveCount(0);
  removedB = true;
  await page.reload();
  await expect(
    page.getByText('File: org-a-w9.pdf', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('File: org-b-w9.pdf', { exact: true })
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        sessionStorage.getItem('sokana-selected-organization')
      )
    )
    .toBe(null);
  await page.screenshot({
    path: '/tmp/membership-remaining-org.png',
    fullPage: true,
  });
});
test('a platform account with no active membership sees no organization workspace', async ({
  page,
}) => {
  await page.route('http://localhost:5054/**', async (route) => {
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': 'http://127.0.0.1:3024',
          'access-control-allow-credentials': 'true',
        },
        body: '',
      });
    return route.fulfill({
      status: 200,
      headers: {
        'access-control-allow-origin': 'http://127.0.0.1:3024',
        'access-control-allow-credentials': 'true',
      },
      json: {
        id: 'platform-user',
        email: 'fixture@example.test',
        role: 'platform_member',
        organizationAccess: 'none',
      },
    });
  });
  await page.goto('/clients');
  await expect(
    page.getByRole('heading', {
      name: 'You’re not connected to an organization',
    })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Leads', exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Log out', exact: true })
  ).toBeVisible();
});
