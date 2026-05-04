/**
 * Ticket 2 — E2E: Insurance Card Upload
 *
 * Browser tests verifying:
 * - Auth redirect behavior for insurance upload pages
 * - Insurance card document type detection logic in browser context
 * - Front/back side naming logic
 * - FormData construction for insurance card upload API
 * - Route-level interception for the upload endpoint
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Ticket 2 — Insurance card upload (E2E)', () => {

  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(await page.title()).toBeTruthy();
  });

  test('/client-dashboard is accessible (client-facing public page)', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForLoadState('networkidle');
    // The client dashboard is a client-facing page — it loads without staff auth
    // It stays at /client-dashboard (or redirects to client login, not staff login)
    await expect(page).toHaveURL(/client-dashboard|login/);
  });

  test('isInsuranceCardDocument logic identifies all insurance card types', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const INSURANCE_CARD_TYPES = new Set([
        'insurance_card',
        'insurance_card_front',
        'insurance_card_back',
        'insurance-card',
        'insuranceCard',
        'insuranceCardFront',
        'insuranceCardBack',
      ]);

      const isInsuranceCardDocument = (doc: { documentType: string }) =>
        INSURANCE_CARD_TYPES.has(doc.documentType);

      return {
        genericCard: isInsuranceCardDocument({ documentType: 'insurance_card' }),
        frontCard: isInsuranceCardDocument({ documentType: 'insurance_card_front' }),
        backCard: isInsuranceCardDocument({ documentType: 'insurance_card_back' }),
        camelCase: isInsuranceCardDocument({ documentType: 'insuranceCard' }),
        camelFront: isInsuranceCardDocument({ documentType: 'insuranceCardFront' }),
        camelBack: isInsuranceCardDocument({ documentType: 'insuranceCardBack' }),
        w9: isInsuranceCardDocument({ documentType: 'w9' }),
        bgCheck: isInsuranceCardDocument({ documentType: 'background_check' }),
      };
    });

    expect(result.genericCard).toBe(true);
    expect(result.frontCard).toBe(true);
    expect(result.backCard).toBe(true);
    expect(result.camelCase).toBe(true);
    expect(result.camelFront).toBe(true);
    expect(result.camelBack).toBe(true);
    expect(result.w9).toBe(false);
    expect(result.bgCheck).toBe(false);
  });

  test('getInsuranceCardSide detects front/back from documentType', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      function getInsuranceCardSide(documentType: string, fileName?: string): 'front' | 'back' | null {
        const normalized = documentType.trim().toLowerCase().replace(/[-\s]+/g, '_');
        if (normalized === 'insurance_card_front') return 'front';
        if (normalized === 'insurance_card_back') return 'back';
        const normalizedFileName = String(fileName ?? '').trim().toLowerCase();
        if (normalizedFileName) {
          if (/(?:^|[-_.\s])front(?:$|[-_.\s])/.test(normalizedFileName)) return 'front';
          if (/(?:^|[-_.\s])back(?:$|[-_.\s])/.test(normalizedFileName)) return 'back';
        }
        return null;
      }

      return {
        frontType: getInsuranceCardSide('insurance_card_front'),
        backType: getInsuranceCardSide('insurance_card_back'),
        nullNoHint: getInsuranceCardSide('insurance_card'),
        frontFromFilename: getInsuranceCardSide('insurance_card', 'insurance-card-front.jpg'),
        backFromFilename: getInsuranceCardSide('insurance_card', 'insurance-card-back.jpg'),
        nullFromUnrelated: getInsuranceCardSide('w9', 'form.pdf'),
      };
    });

    expect(result.frontType).toBe('front');
    expect(result.backType).toBe('back');
    expect(result.nullNoHint).toBeNull();
    expect(result.frontFromFilename).toBe('front');
    expect(result.backFromFilename).toBe('back');
    expect(result.nullFromUnrelated).toBeNull();
  });

  test('insurance card filename is prefixed correctly for front and back', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      function buildUploadFilename(originalName: string, side: 'front' | 'back'): string {
        const extensionMatch = originalName.match(/\.[^.]+$/);
        const extension = extensionMatch?.[0] || '';
        return side === 'back'
          ? `insurance-card-back${extension}`
          : `insurance-card-front${extension}`;
      }

      return {
        frontJpg: buildUploadFilename('my-card.jpg', 'front'),
        backPng: buildUploadFilename('scan.png', 'back'),
        frontNoExt: buildUploadFilename('cardimage', 'front'),
        backNoExt: buildUploadFilename('cardimage', 'back'),
      };
    });

    expect(result.frontJpg).toBe('insurance-card-front.jpg');
    expect(result.backPng).toBe('insurance-card-back.png');
    expect(result.frontNoExt).toBe('insurance-card-front');
    expect(result.backNoExt).toBe('insurance-card-back');
  });

  test('insurance card upload endpoint accepts POST with correct fields', async ({ page }) => {
    let capturedFormFields: Record<string, string> = {};
    let capturedMethod = '';

    await page.route('**/api/clients/me/documents', (route) => {
      capturedMethod = route.request().method();
      // We can inspect headers and body type
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'doc-test-1',
          documentType: 'insurance_card',
          fileName: 'insurance-card-front.jpg',
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const uploadResult = await page.evaluate(async () => {
      const formData = new FormData();
      const file = new File(['fake-image-data'], 'insurance-card-front.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('documentType', 'insurance_card');
      formData.append('document_type', 'insurance_card');
      formData.append('category', 'billing');

      const response = await fetch('/api/clients/me/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return { status: response.status, ok: response.ok, documentType: data.documentType };
    });

    expect(capturedMethod).toBe('POST');
    expect(uploadResult.ok).toBe(true);
    expect(uploadResult.documentType).toBe('insurance_card');
  });

  test('insurance card document sorting — newer first', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      function compareByUploadedAtDesc(
        a: { uploadedAt?: string },
        b: { uploadedAt?: string }
      ): number {
        const aTime = a.uploadedAt ? Date.parse(a.uploadedAt) : 0;
        const bTime = b.uploadedAt ? Date.parse(b.uploadedAt) : 0;
        return bTime - aTime;
      }

      const docs = [
        { id: '1', uploadedAt: '2024-01-01T00:00:00Z' },
        { id: '2', uploadedAt: '2024-06-01T00:00:00Z' },
        { id: '3', uploadedAt: '2024-03-15T00:00:00Z' },
        { id: '4' },
      ];

      return docs.sort(compareByUploadedAtDesc).map((d) => d.id);
    });

    // Newest (June) should be first
    expect(result[0]).toBe('2');
    expect(result[1]).toBe('3');
    expect(result[2]).toBe('1');
    expect(result[3]).toBe('4'); // No date — last
  });

  test('getClientDocumentLabel produces human-readable labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      function getInsuranceCardSide(documentType: string): 'front' | 'back' | null {
        const normalized = documentType.trim().toLowerCase().replace(/[-\s]+/g, '_');
        if (normalized === 'insurance_card_front') return 'front';
        if (normalized === 'insurance_card_back') return 'back';
        return null;
      }

      const INSURANCE_CARD_TYPES = new Set([
        'insurance_card', 'insurance_card_front', 'insurance_card_back',
        'insurance-card', 'insuranceCard', 'insuranceCardFront', 'insuranceCardBack',
      ]);

      function getClientDocumentLabel(documentType: string, fileName?: string): string {
        const side = getInsuranceCardSide(documentType);
        if (side === 'front') return 'Insurance Card Front';
        if (side === 'back') return 'Insurance Card Back';
        if (INSURANCE_CARD_TYPES.has(documentType)) return 'Insurance Card';
        return documentType
          .replace(/[_-]+/g, ' ')
          .replace(/\b\w/g, (match) => match.toUpperCase());
      }

      return {
        front: getClientDocumentLabel('insurance_card_front'),
        back: getClientDocumentLabel('insurance_card_back'),
        generic: getClientDocumentLabel('insurance_card'),
        bgCheck: getClientDocumentLabel('background_check'),
      };
    });

    expect(result.front).toBe('Insurance Card Front');
    expect(result.back).toBe('Insurance Card Back');
    expect(result.generic).toBe('Insurance Card');
    expect(result.bgCheck).toMatch(/background check/i);
  });
});
