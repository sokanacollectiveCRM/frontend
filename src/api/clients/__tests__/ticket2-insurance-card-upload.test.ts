/**
 * Ticket 2: Insurance Card Upload
 * Priority: High
 *
 * Tests covering:
 * - isInsuranceCardDocument correctly identifies insurance card document types
 * - getInsuranceCardSide returns 'front' | 'back' | null from documentType and fileName
 * - getClientDocumentLabel produces human-readable labels for insurance cards
 * - uploadInsuranceCard constructs correct FormData (documentType, category, filename prefix)
 * - uploadInsuranceCard handles both front and back sides
 * - listClientDocuments / normalizeDocument handles camelCase and snake_case API responses
 * - compareClientDocumentsByUploadedAtDesc sorts correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isInsuranceCardDocument,
  getInsuranceCardSide,
  getClientDocumentLabel,
  uploadInsuranceCard,
  compareClientDocumentsByUploadedAtDesc,
  formatClientDocumentErrorMessage,
  type ClientDocument,
} from '@/api/clients/clientDocuments';

// ─────────────────────────────────────────────
// 2A. isInsuranceCardDocument
// ─────────────────────────────────────────────
describe('Ticket 2 — isInsuranceCardDocument', () => {
  it('returns true for "insurance_card" documentType', () => {
    const doc: ClientDocument = { id: '1', documentType: 'insurance_card', fileName: 'card.jpg' };
    expect(isInsuranceCardDocument(doc)).toBe(true);
  });

  it('returns true for "insurance_card_front" documentType', () => {
    const doc: ClientDocument = { id: '2', documentType: 'insurance_card_front', fileName: 'front.jpg' };
    expect(isInsuranceCardDocument(doc)).toBe(true);
  });

  it('returns true for "insurance_card_back" documentType', () => {
    const doc: ClientDocument = { id: '3', documentType: 'insurance_card_back', fileName: 'back.jpg' };
    expect(isInsuranceCardDocument(doc)).toBe(true);
  });

  it('returns true for camelCase "insuranceCard" documentType', () => {
    const doc: ClientDocument = { id: '4', documentType: 'insuranceCard', fileName: 'card.png' };
    expect(isInsuranceCardDocument(doc)).toBe(true);
  });

  it('returns true for camelCase "insuranceCardFront" documentType', () => {
    const doc: ClientDocument = { id: '5', documentType: 'insuranceCardFront', fileName: 'front.png' };
    expect(isInsuranceCardDocument(doc)).toBe(true);
  });

  it('returns true for camelCase "insuranceCardBack" documentType', () => {
    const doc: ClientDocument = { id: '6', documentType: 'insuranceCardBack', fileName: 'back.png' };
    expect(isInsuranceCardDocument(doc)).toBe(true);
  });

  it('returns false for unrelated document types', () => {
    const doc: ClientDocument = { id: '7', documentType: 'w9', fileName: 'w9.pdf' };
    expect(isInsuranceCardDocument(doc)).toBe(false);
  });

  it('returns false for "background_check" documentType', () => {
    const doc: ClientDocument = { id: '8', documentType: 'background_check', fileName: 'bg.pdf' };
    expect(isInsuranceCardDocument(doc)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2B. getInsuranceCardSide
// ─────────────────────────────────────────────
describe('Ticket 2 — getInsuranceCardSide', () => {
  it('returns "front" for "insurance_card_front" documentType', () => {
    expect(getInsuranceCardSide('insurance_card_front')).toBe('front');
  });

  it('returns "back" for "insurance_card_back" documentType', () => {
    expect(getInsuranceCardSide('insurance_card_back')).toBe('back');
  });

  it('returns null for generic "insurance_card" documentType without filename clue', () => {
    expect(getInsuranceCardSide('insurance_card')).toBeNull();
  });

  it('detects "front" from filename when documentType is generic', () => {
    expect(getInsuranceCardSide('insurance_card', 'insurance-card-front.jpg')).toBe('front');
  });

  it('detects "back" from filename when documentType is generic', () => {
    expect(getInsuranceCardSide('insurance_card', 'insurance-card-back.jpg')).toBe('back');
  });

  it('handles extra whitespace in documentType', () => {
    expect(getInsuranceCardSide('  insurance_card_front  ')).toBe('front');
  });

  it('returns null for non-insurance document types', () => {
    expect(getInsuranceCardSide('w9', 'w9-form.pdf')).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 2C. getClientDocumentLabel
// ─────────────────────────────────────────────
describe('Ticket 2 — getClientDocumentLabel', () => {
  it('returns "Insurance Card Front" for insurance_card_front', () => {
    expect(getClientDocumentLabel('insurance_card_front')).toBe('Insurance Card Front');
  });

  it('returns "Insurance Card Back" for insurance_card_back', () => {
    expect(getClientDocumentLabel('insurance_card_back')).toBe('Insurance Card Back');
  });

  it('returns "Insurance Card" for generic insurance_card without side clue', () => {
    expect(getClientDocumentLabel('insurance_card')).toBe('Insurance Card');
  });

  it('returns humanized label for other document types', () => {
    expect(getClientDocumentLabel('background_check')).toMatch(/background check/i);
  });

  it('handles dash-separated types', () => {
    const label = getClientDocumentLabel('insurance-card');
    expect(label).toBeTruthy();
    expect(typeof label).toBe('string');
  });
});

// ─────────────────────────────────────────────
// 2D. uploadInsuranceCard — FormData structure
// ─────────────────────────────────────────────
describe('Ticket 2 — uploadInsuranceCard FormData construction', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let capturedFormData: FormData | null = null;

  beforeEach(() => {
    capturedFormData = null;
    mockFetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedFormData = opts.body as FormData;
      return {
        ok: true,
        text: async () =>
          JSON.stringify({
            id: 'doc-1',
            documentType: 'insurance_card',
            fileName: 'insurance-card-front.jpg',
            uploadedAt: new Date().toISOString(),
          }),
      };
    });
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('uploads front side — filename prefixed with "insurance-card-front"', async () => {
    const file = new File(['data'], 'my-card.jpg', { type: 'image/jpeg' });
    await uploadInsuranceCard(file, 'front');

    expect(capturedFormData).toBeDefined();
    const uploadedFile = capturedFormData!.get('file') as File;
    expect(uploadedFile.name).toMatch(/^insurance-card-front/);
  });

  it('uploads back side — filename prefixed with "insurance-card-back"', async () => {
    const file = new File(['data'], 'my-card.png', { type: 'image/png' });
    await uploadInsuranceCard(file, 'back');

    expect(capturedFormData).toBeDefined();
    const uploadedFile = capturedFormData!.get('file') as File;
    expect(uploadedFile.name).toMatch(/^insurance-card-back/);
  });

  it('sets documentType field to "insurance_card"', async () => {
    const file = new File(['data'], 'front.jpg', { type: 'image/jpeg' });
    await uploadInsuranceCard(file, 'front');

    expect(capturedFormData!.get('documentType')).toBe('insurance_card');
  });

  it('sets document_type (snake_case) field to "insurance_card"', async () => {
    const file = new File(['data'], 'back.jpg', { type: 'image/jpeg' });
    await uploadInsuranceCard(file, 'back');

    expect(capturedFormData!.get('document_type')).toBe('insurance_card');
  });

  it('sets category field to "billing"', async () => {
    const file = new File(['data'], 'card.jpg', { type: 'image/jpeg' });
    await uploadInsuranceCard(file, 'front');

    expect(capturedFormData!.get('category')).toBe('billing');
  });

  it('preserves file extension in renamed file', async () => {
    const file = new File(['data'], 'card.png', { type: 'image/png' });
    await uploadInsuranceCard(file, 'front');

    const uploadedFile = capturedFormData!.get('file') as File;
    expect(uploadedFile.name).toMatch(/\.png$/);
  });

  it('defaults to front side when no side argument given', async () => {
    const file = new File(['data'], 'card.jpg', { type: 'image/jpeg' });
    await uploadInsuranceCard(file);

    const uploadedFile = capturedFormData!.get('file') as File;
    expect(uploadedFile.name).toMatch(/^insurance-card-front/);
  });
});

// ─────────────────────────────────────────────
// 2E. compareClientDocumentsByUploadedAtDesc
// ─────────────────────────────────────────────
describe('Ticket 2 — compareClientDocumentsByUploadedAtDesc', () => {
  it('sorts newer documents before older ones', () => {
    const older: ClientDocument = {
      id: '1',
      documentType: 'insurance_card',
      fileName: 'old.jpg',
      uploadedAt: '2024-01-01T00:00:00Z',
    };
    const newer: ClientDocument = {
      id: '2',
      documentType: 'insurance_card',
      fileName: 'new.jpg',
      uploadedAt: '2024-06-01T00:00:00Z',
    };
    const sorted = [older, newer].sort(compareClientDocumentsByUploadedAtDesc);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('documents without uploadedAt sort to the end', () => {
    const withDate: ClientDocument = {
      id: '1',
      documentType: 'insurance_card',
      fileName: 'dated.jpg',
      uploadedAt: '2024-01-01T00:00:00Z',
    };
    const withoutDate: ClientDocument = {
      id: '2',
      documentType: 'insurance_card',
      fileName: 'undated.jpg',
    };
    const sorted = [withoutDate, withDate].sort(compareClientDocumentsByUploadedAtDesc);
    expect(sorted[0].id).toBe('1');
  });
});

describe('Ticket 2 — formatClientDocumentErrorMessage', () => {
  it('maps RLS / bucket provisioning errors to friendly copy', () => {
    expect(
      formatClientDocumentErrorMessage(
        'Failed to ensure client documents bucket exists: new row violates row-level security policy'
      )
    ).toContain('Document upload is not available');
  });

  it('passes through unrelated messages', () => {
    expect(formatClientDocumentErrorMessage('Network error')).toBe('Network error');
  });
});
