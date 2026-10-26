import { test, expect, type Page } from '@playwright/test';
async function fixture(page: Page, role: 'admin' | 'hr') {
  let status = 'not_cleared';
  let invitedRole = '';
  const headers = {
    'access-control-allow-origin': 'http://127.0.0.1:3023',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  const doula = {
    id: 'fictional-doula',
    full_name: 'Fictional Doula',
    firstname: 'Fictional',
    lastname: 'Doula',
    email: 'doula@example.test',
    role: 'doula',
    certifications: [],
    account_status: 'active',
  };
  await page.route('http://localhost:5053/**', async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    if (req.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers, body: '' });
    let data: unknown = { success: true };
    if (path === '/auth/me')
      data = {
        id: 'fictional-staff',
        email: 'staff@example.test',
        firstname: 'Staff',
        lastname: 'Fixture',
        role,
        emailVerified: true,
      };
    else if (path === '/api/hr/doulas') data = { doulas: [doula] };
    else if (path === '/api/hr/doulas/fictional-doula') data = { doula };
    else if (path.endsWith('/background-check')) {
      status = req.postDataJSON().status;
      data = { success: true };
    } else if (path === '/api/hr/doulas/fictional-doula/documents')
      data = {
        documents: ['w9', 'direct_deposit_form', 'background_check'].map(
          (type) => ({
            id: type,
            documentType: type,
            fileName: `${type}.pdf`,
            fileUrl: `https://files.example.test/${type}`,
            status: 'approved',
          })
        ),
        backgroundCheck: {
          status,
          setAt: '2026-10-26T12:00:00Z',
          setBy: 'fixture-hr',
        },
      };
    else if (path === '/clients/team/all') data = [doula];
    else if (path === '/clients/team/add') {
      invitedRole = req.postDataJSON().role;
      data = { id: 'fictional-new-hr' };
    } else if (path.startsWith('/api/admin/staff-permissions'))
      return route.fulfill({
        status: 403,
        headers,
        json: { error: 'Staff permissions access denied.' },
      });
    await route.fulfill({ status: 200, headers, json: data });
  });
  return { invitedRole: () => invitedRole };
}
test('HR lands in a limited workspace, reads sensitive documents and clears a background check', async ({
  page,
}) => {
  await fixture(page, 'hr');
  await page.goto('/');
  await expect(page).toHaveURL(/\/hr$/);
  await expect(
    page.getByRole('link', { name: 'Doula directory', exact: true })
  ).toBeVisible();
  for (const name of [
    'Leads',
    'Customers',
    'Team',
    'Invoices',
    'Staff permissions',
    'Signed Contracts',
  ])
    await expect(page.getByRole('link', { name, exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /Fictional Doula/ }).click();
  await expect(page.getByRole('link', { name: 'w9.pdf' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'direct_deposit_form.pdf' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'background_check.pdf' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Mark Cleared', exact: true }).click();
  await expect(
    page.getByText('Status: Cleared', { exact: true })
  ).toBeVisible();
  await page.screenshot({
    path: '/tmp/p23-hr-workspace-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: '/tmp/p23-hr-workspace-mobile.png',
    fullPage: true,
  });
  await page.goto('/clients');
  await expect(page.getByText('Access denied', { exact: true })).toBeVisible();
});
test('an ordinary admin can invite HR while staff-permissions management remains denied', async ({
  page,
}) => {
  const f = await fixture(page, 'admin');
  await page.goto('/team');
  await page
    .getByRole('button', { name: /Invite Member/i })
    .first()
    .click();
  await page
    .getByLabel('Email Address', { exact: true })
    .fill('fictional-hr@example.test');
  await page.getByLabel('First Name', { exact: true }).fill('Fictional');
  await page.getByLabel('Last Name', { exact: true }).fill('HR');
  await page.getByLabel('Role', { exact: true }).selectOption('hr');
  await page
    .getByRole('button', { name: 'Send Invitation', exact: true })
    .click();
  await expect.poll(() => f.invitedRole()).toBe('hr');
  await page.goto('/settings/staff-permissions');
  await expect(page.getByRole('alert')).toHaveText(/access denied/i);
});

test('Teams reviews documents with the same preview, rejection reason and approval controls', async ({
  page,
}) => {
  await fixture(page, 'admin');
  let status = 'uploaded';
  let reason = '';
  let fileName = 'fictional-certificate.png';
  const headers = {
    'access-control-allow-origin': 'http://127.0.0.1:3023',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  await page.route(
    'http://localhost:5053/api/admin/doulas/fictional-doula/documents**',
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() === 'OPTIONS')
        return route.fulfill({ status: 204, headers, body: '' });
      if (path.endsWith('/review')) {
        const body = route.request().postDataJSON();
        status = body.status;
        reason = body.rejection_reason || '';
        return route.fulfill({ headers, json: { success: true } });
      }
      if (path.endsWith('/url'))
        return route.fulfill({
          headers,
          json: { url: 'https://files.example.test/fictional-certificate' },
        });
      return route.fulfill({
        headers,
        json: {
          visibleDocumentTypes: ['training_certificate'],
          documents: [
            {
              id: 'training',
              documentType: 'training_certificate',
              fileName,
              status,
              rejectionReason: reason,
              uploadedAt: '2026-10-26T12:00:00Z',
            },
          ],
        },
      });
    }
  );
  await page.route('https://files.example.test/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=',
        'base64'
      ),
    })
  );
  await page.goto('/team');
  await page
    .getByRole('button', { name: 'Review profile & documents' })
    .click();
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await expect(page.getByRole('img', { name: fileName })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open document in a new tab' })
  ).toHaveAttribute('target', '_blank');
  await page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: fileName }) })
    .getByRole('button', { name: 'Close', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Review profile & documents' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Reject document' })
  ).toBeDisabled();
  await page
    .getByLabel('Requested changes / rejection reason')
    .fill('Upload a readable certificate.');
  await page.getByRole('button', { name: 'Reject document' }).click();
  await expect.poll(() => status).toBe('rejected');
  await expect(
    page.getByText('Reason: Upload a readable certificate.')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Approve document' }).click();
  await expect.poll(() => status).toBe('approved');
  await expect(page.getByText('Status: approved')).toBeVisible();
  await page.screenshot({
    path: '/tmp/jerry-teams-documents-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: '/tmp/jerry-teams-documents-mobile.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Close', exact: true }).first().click();
  fileName = 'fictional-certificate.pdf';
  await page
    .getByRole('button', { name: 'Review profile & documents' })
    .click();
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await expect(page.getByTitle('PDF document preview')).toBeVisible();
});
