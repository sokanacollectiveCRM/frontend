import { test, expect } from '@playwright/test';
test('P-22 owner uploads all restored/new fields, sees required styles and read-only HR clearance', async ({
  page,
}) => {
  const documents: Record<string, unknown>[] = [];
  const headers = {
    'access-control-allow-origin': 'http://127.0.0.1:3022',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  const profile = {
    id: 'fictional-doula',
    role: 'doula',
    emailVerified: true,
    firstname: 'Maya',
    lastname: 'Rivers',
    email: 'maya@example.com',
    phone_number: '5555550100',
    address: '1 Fictional Way',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    country: 'US',
    bio: 'Fictional doula',
    certifications: [],
    account_status: 'active',
    profile_review_status: 'draft',
  };
  await page.route('http://localhost:5052/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers, body: '' });
    let data: unknown = {
      success: true,
      data: [],
      records: [],
      activities: [],
    };
    if (path === '/auth/me') data = profile;
    else if (path.endsWith('/doulas/profile'))
      data = { success: true, profile };
    else if (path.endsWith('/doulas/availability'))
      data = { records: [], availabilityStatus: { status: 'available' } };
    else if (path.endsWith('/doulas/documents')) {
      if (request.method() === 'POST') {
        const payload = request.postDataBuffer()!.toString();
        const type = payload.match(/name="document_type"\r\n\r\n([^\r]+)/)?.[1];
        expect(type).toBeTruthy();
        documents.push({
          id: type,
          documentType: type,
          fileName: `fictional-${type}.pdf`,
          fileSize: 32,
          status: 'uploaded',
          uploadedAt: '2026-10-26T12:00:00Z',
        });
      }
      data = {
        documents,
        backgroundCheck: { status: 'not_cleared', setAt: null, setBy: null },
      };
    }
    await route.fulfill({ status: 200, headers, json: data });
  });
  await page.goto('/doula-dashboard/profile?step=documents');
  const grid = page.getByTestId('profile-documents-grid');
  await expect(grid).toBeVisible();
  for (const type of ['training_certificate', 'w9', 'direct_deposit_form']) {
    const slot = page.getByTestId(`document-slot-${type}`);
    await expect(slot.getByText('Required', { exact: true })).toBeVisible();
    await expect(slot).toHaveClass(/border-l-amber-500/);
  }
  for (const type of [
    'liability_insurance_certificate',
    'illinois_medicaid_certification',
    'cpr',
    'hipaa',
    'miscellaneous',
  ]) {
    const slot = page.getByTestId(`document-slot-${type}`);
    await expect(slot.getByText('Optional', { exact: true })).toBeVisible();
    await expect(slot).not.toHaveClass(/border-l-amber-500/);
  }
  await expect(
    page.getByRole('region', { name: 'Background check' })
  ).toContainText('Not cleared');
  await expect(
    page.getByRole('region', { name: 'Background check' }).getByRole('button')
  ).toHaveCount(0);
  await expect(page.getByTestId('document-slot-background_check')).toHaveCount(
    0
  );
  for (const type of ['w9', 'direct_deposit_form', 'cpr', 'hipaa']) {
    const slot = page.getByTestId(`document-slot-${type}`);
    await slot.getByRole('button', { name: 'Upload', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type=file]').setInputFiles({
      name: `fictional-${type}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 fictional fixture'),
    });
    await dialog.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(slot).toContainText(`fictional-${type}.pdf`);
  }
  await page.reload();
  for (const type of ['w9', 'direct_deposit_form', 'cpr', 'hipaa'])
    await expect(page.getByTestId(`document-slot-${type}`)).toContainText(
      `fictional-${type}.pdf`
    );
});
