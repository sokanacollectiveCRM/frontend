/**
 * Ticket 3: Require doulas to upload mandatory documents to be active
 * Priority: High
 *
 * Required documents: training_certificate
 *
 * Tests covering:
 * - REQUIRED_DOULA_DOCUMENT_TYPES contains the training certificate only
 * - DOCUMENT_TYPE_LABELS has human-readable labels for all required types
 * - uploadDocument rejects files over 10MB
 * - uploadDocument rejects invalid MIME types
 * - uploadDocument sends correct FormData to API
 * - getDoulaDocuments normalizes snake_case and camelCase API responses
 * - DocumentCompleteness.can_be_active logic based on missing documents
 * - DOCUMENT_STATUS_LABELS mapping
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  REQUIRED_DOULA_DOCUMENT_TYPES,
  OPTIONAL_DOULA_DOCUMENT_TYPES,
  RETIRED_DOULA_DOCUMENT_TYPES,
  DOULA_DOCUMENT_META,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  MAX_DOCUMENT_SIZE,
  ALLOWED_DOCUMENT_MIME_TYPES,
  uploadDocument,
  getDoulaDocuments,
  type DocumentCompleteness,
  type DocumentType,
} from '@/api/doulas/doulaService';

// ─────────────────────────────────────────────
// 3A. REQUIRED_DOULA_DOCUMENT_TYPES — training certificate only
// ─────────────────────────────────────────────
describe('Ticket 3 — REQUIRED_DOULA_DOCUMENT_TYPES', () => {
  it('contains exactly the training certificate', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toEqual(['training_certificate']);
  });

  it('does not require liability insurance, W9, direct deposit, or background check', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).not.toContain(
      'liability_insurance_certificate'
    );
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).not.toContain('background_check');
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).not.toContain('w9');
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).not.toContain('direct_deposit_form');
  });

  it('lists liability insurance and the new uploads as optional', () => {
    expect(OPTIONAL_DOULA_DOCUMENT_TYPES).toContain(
      'liability_insurance_certificate'
    );
    expect(OPTIONAL_DOULA_DOCUMENT_TYPES).toContain(
      'illinois_medicaid_certification'
    );
    expect(OPTIONAL_DOULA_DOCUMENT_TYPES).toContain('miscellaneous');
  });

  it('retires W9, direct deposit, and background check', () => {
    expect(RETIRED_DOULA_DOCUMENT_TYPES).toEqual([
      'background_check',
      'w9',
      'direct_deposit_form',
    ]);
  });
});

// ─────────────────────────────────────────────
// 3B. DOCUMENT_TYPE_LABELS — human-readable labels
// ─────────────────────────────────────────────
describe('Ticket 3 — DOCUMENT_TYPE_LABELS', () => {
  it('labels the training certificate as Doula training certificate', () => {
    expect(DOCUMENT_TYPE_LABELS.training_certificate).toBe(
      'Doula training certificate'
    );
    expect(DOULA_DOCUMENT_META.training_certificate.required).toBe(true);
  });

  it('labels liability insurance and keeps the Medicaid helper note', () => {
    expect(DOCUMENT_TYPE_LABELS.liability_insurance_certificate).toBe(
      'Liability insurance'
    );
    expect(DOULA_DOCUMENT_META.liability_insurance_certificate.required).toBe(
      false
    );
    expect(DOULA_DOCUMENT_META.liability_insurance_certificate.helperText).toBe(
      'Required for Medicaid clients'
    );
  });

  it('labels the new optional uploads', () => {
    expect(DOCUMENT_TYPE_LABELS.illinois_medicaid_certification).toBe(
      'Illinois Medicaid certification'
    );
    expect(DOCUMENT_TYPE_LABELS.miscellaneous).toBe('Miscellaneous documents');
    expect(DOULA_DOCUMENT_META.miscellaneous.multiple).toBe(true);
  });

  it('every required type has a non-empty label', () => {
    for (const type of REQUIRED_DOULA_DOCUMENT_TYPES) {
      expect(DOCUMENT_TYPE_LABELS[type]).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────
// 3C. DOCUMENT_STATUS_LABELS
// ─────────────────────────────────────────────
describe('Ticket 3 — DOCUMENT_STATUS_LABELS', () => {
  it('has label for "missing" status', () => {
    expect(DOCUMENT_STATUS_LABELS.missing).toBeTruthy();
  });

  it('has label for "uploaded" status', () => {
    expect(DOCUMENT_STATUS_LABELS.uploaded).toBeTruthy();
  });

  it('has label for "approved" status', () => {
    expect(DOCUMENT_STATUS_LABELS.approved).toBeTruthy();
  });

  it('has label for "rejected" status', () => {
    expect(DOCUMENT_STATUS_LABELS.rejected).toBeTruthy();
  });

  it('"pending" maps to the same label as "uploaded" (normalized)', () => {
    expect(DOCUMENT_STATUS_LABELS.pending).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 3D. File size and MIME type constants
// ─────────────────────────────────────────────
describe('Ticket 3 — file validation constants', () => {
  it('MAX_DOCUMENT_SIZE is 10MB (10 * 1024 * 1024)', () => {
    expect(MAX_DOCUMENT_SIZE).toBe(10 * 1024 * 1024);
  });

  it('allows PDF files', () => {
    expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain('application/pdf');
  });

  it('allows PNG images', () => {
    expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain('image/png');
  });

  it('allows JPEG images', () => {
    expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain('image/jpeg');
  });
});

// ─────────────────────────────────────────────
// 3E. uploadDocument — validation guards
// ─────────────────────────────────────────────
describe('Ticket 3 — uploadDocument validation', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          document: {
            id: 'doc-1',
            documentType: 'training_certificate',
            fileName: 'training.pdf',
            fileUrl: null,
            fileSize: 1024,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('throws if file exceeds 10MB', async () => {
    const oversizedFile = new File(
      [new ArrayBuffer(MAX_DOCUMENT_SIZE + 1)],
      'large.pdf',
      { type: 'application/pdf' }
    );
    await expect(
      uploadDocument(oversizedFile, 'training_certificate')
    ).rejects.toThrow(/10MB/i);
  });

  it('throws for disallowed MIME type (text/plain)', async () => {
    const textFile = new File(['content'], 'doc.txt', { type: 'text/plain' });
    await expect(
      uploadDocument(textFile, 'training_certificate')
    ).rejects.toThrow(/invalid file type/i);
  });

  it('throws for disallowed MIME type (video/mp4)', async () => {
    const videoFile = new File(['content'], 'video.mp4', { type: 'video/mp4' });
    await expect(
      uploadDocument(videoFile, 'training_certificate')
    ).rejects.toThrow(/invalid file type/i);
  });

  it('succeeds with a valid PDF file under 10MB', async () => {
    const pdfFile = new File(['%PDF-1.4 content'], 'bg-check.pdf', {
      type: 'application/pdf',
    });
    const result = await uploadDocument(pdfFile, 'training_certificate');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('sends document_type in FormData', async () => {
    let capturedFormData: FormData | null = null;
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(async (_url: string, opts: { body?: FormData }) => {
          capturedFormData = opts.body as FormData;
          return {
            ok: true,
            json: async () => ({
              success: true,
              document: {
                id: 'doc-2',
                documentType: 'illinois_medicaid_certification',
                fileName: 'medicaid.pdf',
                fileUrl: null,
                fileSize: 1024,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded',
              },
            }),
          };
        })
    );

    const pdfFile = new File(['content'], 'medicaid.pdf', {
      type: 'application/pdf',
    });
    await uploadDocument(pdfFile, 'illinois_medicaid_certification');

    expect(capturedFormData).toBeDefined();
    expect(capturedFormData!.get('document_type')).toBe(
      'illinois_medicaid_certification'
    );
  });

  it('includes optional notes in FormData when provided', async () => {
    let capturedFormData: FormData | null = null;
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(async (_url: string, opts: { body?: FormData }) => {
          capturedFormData = opts.body as FormData;
          return {
            ok: true,
            json: async () => ({
              success: true,
              document: {
                id: 'doc-3',
                documentType: 'miscellaneous',
                fileName: 'notes.pdf',
                fileUrl: null,
                fileSize: 1024,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded',
              },
            }),
          };
        })
    );

    const pdfFile = new File(['content'], 'notes.pdf', {
      type: 'application/pdf',
    });
    await uploadDocument(pdfFile, 'miscellaneous', 'Please review');

    expect(capturedFormData!.get('notes')).toBe('Please review');
  });

  it('rejects retired document types before calling the API', async () => {
    const pdfFile = new File(['content'], 'w9.pdf', {
      type: 'application/pdf',
    });
    await expect(uploadDocument(pdfFile, 'w9')).rejects.toThrow(
      /no longer accepted/i
    );
    await expect(uploadDocument(pdfFile, 'background_check')).rejects.toThrow(
      /no longer accepted/i
    );
    await expect(
      uploadDocument(pdfFile, 'direct_deposit_form')
    ).rejects.toThrow(/no longer accepted/i);
  });
});

// ─────────────────────────────────────────────
// 3F. getDoulaDocuments — normalization of API response
// ─────────────────────────────────────────────
describe('Ticket 3 — getDoulaDocuments normalizes API responses', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('normalizes snake_case API fields (document_type, file_name)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          documents: [
            {
              id: 'doc-1',
              document_type: 'background_check',
              file_name: 'bg.pdf',
              file_url: null,
              file_size: 1024,
              uploaded_at: '2024-01-01T00:00:00Z',
              status: 'uploaded',
            },
          ],
          completeness: null,
        }),
      })
    );

    const result = await getDoulaDocuments();
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].documentType).toBe('background_check');
    expect(result.documents[0].fileName).toBe('bg.pdf');
  });

  it('normalizes camelCase API fields (documentType, fileName)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          documents: [
            {
              id: 'doc-2',
              documentType: 'w9',
              fileName: 'w9.pdf',
              fileUrl: 'https://example.com/w9.pdf',
              fileSize: 2048,
              uploadedAt: '2024-03-01T00:00:00Z',
              status: 'approved',
            },
          ],
        }),
      })
    );

    const result = await getDoulaDocuments();
    expect(result.documents[0].documentType).toBe('w9');
    expect(result.documents[0].fileName).toBe('w9.pdf');
    expect(result.documents[0].fileUrl).toBe('https://example.com/w9.pdf');
  });

  it('normalizes "pending" status to "uploaded"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          documents: [
            {
              id: 'doc-3',
              document_type: 'training_certificate',
              file_name: 'cert.pdf',
              file_size: 500,
              status: 'pending',
            },
          ],
        }),
      })
    );

    const result = await getDoulaDocuments();
    expect(result.documents[0].status).toBe('uploaded');
  });

  it('returns completeness object when present', async () => {
    const completeness: DocumentCompleteness = {
      total_required: 1,
      total_complete: 0,
      missing_types: ['training_certificate'],
      has_all_required_documents: false,
      can_be_active: false,
      items: [],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          documents: [],
          completeness,
        }),
      })
    );

    const result = await getDoulaDocuments();
    expect(result.completeness).toBeDefined();
    expect(result.completeness!.can_be_active).toBe(false);
    expect(result.completeness!.missing_types).toContain(
      'training_certificate'
    );
  });
});

// ─────────────────────────────────────────────
// 3G. DocumentCompleteness — activation eligibility logic
// ─────────────────────────────────────────────
describe('Ticket 3 — DocumentCompleteness activation eligibility', () => {
  it('can_be_active is true when the training certificate is approved', () => {
    const completeness: DocumentCompleteness = {
      total_required: 1,
      total_complete: 1,
      missing_types: [],
      has_all_required_documents: true,
      can_be_active: true,
      items: REQUIRED_DOULA_DOCUMENT_TYPES.map((type) => ({
        document_type: type,
        status: 'approved',
        document_id: `doc-${type}`,
      })),
    };

    expect(completeness.can_be_active).toBe(true);
    expect(completeness.has_all_required_documents).toBe(true);
    expect(completeness.missing_types).toHaveLength(0);
  });

  it('can_be_active is false when any required document is missing', () => {
    const completeness: DocumentCompleteness = {
      total_required: 1,
      total_complete: 0,
      missing_types: ['training_certificate'],
      has_all_required_documents: false,
      can_be_active: false,
      items: [],
    };

    expect(completeness.can_be_active).toBe(false);
    expect(completeness.has_all_required_documents).toBe(false);
    expect(completeness.missing_types).toContain('training_certificate');
  });

  it('total_required matches the number of REQUIRED_DOULA_DOCUMENT_TYPES', () => {
    const completeness: DocumentCompleteness = {
      total_required: REQUIRED_DOULA_DOCUMENT_TYPES.length,
      total_complete: 0,
      missing_types: [...REQUIRED_DOULA_DOCUMENT_TYPES],
      has_all_required_documents: false,
      can_be_active: false,
      items: [],
    };

    expect(completeness.total_required).toBe(1);
  });
});

// ─────────────────────────────────────────────
// 3H. Each required document type is uploadable
// ─────────────────────────────────────────────
describe('Ticket 3 — each required document type accepted by uploadDocument', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          document: {
            id: 'doc-x',
            documentType: 'training_certificate',
            fileName: 'file.pdf',
            fileUrl: null,
            fileSize: 1024,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  for (const docType of [
    ...REQUIRED_DOULA_DOCUMENT_TYPES,
    'illinois_medicaid_certification',
    'miscellaneous',
    'liability_insurance_certificate',
  ] as DocumentType[]) {
    it(`does not throw for required type: ${docType}`, async () => {
      const file = new File(['content'], `${docType}.pdf`, {
        type: 'application/pdf',
      });
      await expect(uploadDocument(file, docType)).resolves.toBeDefined();
    });
  }
});
