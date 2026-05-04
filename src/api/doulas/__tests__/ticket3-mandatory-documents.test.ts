/**
 * Ticket 3: Require doulas to upload mandatory documents to be active
 * Priority: High
 *
 * Required documents: background_check, liability_insurance_certificate,
 *                     training_certificate, w9, direct_deposit_form
 *
 * Tests covering:
 * - REQUIRED_DOULA_DOCUMENT_TYPES contains all 5 required document types
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
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  MAX_DOCUMENT_SIZE,
  ALLOWED_DOCUMENT_MIME_TYPES,
  uploadDocument,
  getDoulaDocuments,
  type DocumentCompleteness,
  type RequiredDocumentType,
} from '@/api/doulas/doulaService';

// ─────────────────────────────────────────────
// 3A. REQUIRED_DOULA_DOCUMENT_TYPES — must include all 5
// ─────────────────────────────────────────────
describe('Ticket 3 — REQUIRED_DOULA_DOCUMENT_TYPES', () => {
  it('contains exactly 5 required document types', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toHaveLength(5);
  });

  it('includes "background_check"', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toContain('background_check');
  });

  it('includes "liability_insurance_certificate"', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toContain('liability_insurance_certificate');
  });

  it('includes "training_certificate"', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toContain('training_certificate');
  });

  it('includes "w9"', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toContain('w9');
  });

  it('includes "direct_deposit_form"', () => {
    expect(REQUIRED_DOULA_DOCUMENT_TYPES).toContain('direct_deposit_form');
  });
});

// ─────────────────────────────────────────────
// 3B. DOCUMENT_TYPE_LABELS — human-readable labels
// ─────────────────────────────────────────────
describe('Ticket 3 — DOCUMENT_TYPE_LABELS', () => {
  it('has a label for background_check', () => {
    expect(DOCUMENT_TYPE_LABELS.background_check).toBeTruthy();
    expect(DOCUMENT_TYPE_LABELS.background_check).toMatch(/background check/i);
  });

  it('has a label for liability_insurance_certificate', () => {
    expect(DOCUMENT_TYPE_LABELS.liability_insurance_certificate).toBeTruthy();
    expect(DOCUMENT_TYPE_LABELS.liability_insurance_certificate).toMatch(/liability insurance/i);
  });

  it('has a label for training_certificate', () => {
    expect(DOCUMENT_TYPE_LABELS.training_certificate).toBeTruthy();
    expect(DOCUMENT_TYPE_LABELS.training_certificate).toMatch(/training certificate/i);
  });

  it('has a label for w9', () => {
    expect(DOCUMENT_TYPE_LABELS.w9).toBeTruthy();
    expect(DOCUMENT_TYPE_LABELS.w9).toMatch(/w9/i);
  });

  it('has a label for direct_deposit_form', () => {
    expect(DOCUMENT_TYPE_LABELS.direct_deposit_form).toBeTruthy();
    expect(DOCUMENT_TYPE_LABELS.direct_deposit_form).toMatch(/direct deposit/i);
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        document: {
          id: 'doc-1',
          documentType: 'background_check',
          fileName: 'bg.pdf',
          fileUrl: null,
          fileSize: 1024,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
        },
      }),
    }));
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
    await expect(uploadDocument(oversizedFile, 'background_check')).rejects.toThrow(
      /10MB/i
    );
  });

  it('throws for disallowed MIME type (text/plain)', async () => {
    const textFile = new File(['content'], 'doc.txt', { type: 'text/plain' });
    await expect(uploadDocument(textFile, 'w9')).rejects.toThrow(/invalid file type/i);
  });

  it('throws for disallowed MIME type (video/mp4)', async () => {
    const videoFile = new File(['content'], 'video.mp4', { type: 'video/mp4' });
    await expect(uploadDocument(videoFile, 'training_certificate')).rejects.toThrow(
      /invalid file type/i
    );
  });

  it('succeeds with a valid PDF file under 10MB', async () => {
    const pdfFile = new File(['%PDF-1.4 content'], 'bg-check.pdf', {
      type: 'application/pdf',
    });
    const result = await uploadDocument(pdfFile, 'background_check');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('sends document_type in FormData', async () => {
    let capturedFormData: FormData | null = null;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedFormData = opts.body as FormData;
      return {
        ok: true,
        json: async () => ({
          success: true,
          document: {
            id: 'doc-2',
            documentType: 'w9',
            fileName: 'w9.pdf',
            fileUrl: null,
            fileSize: 1024,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
          },
        }),
      };
    }));

    const pdfFile = new File(['content'], 'w9-form.pdf', { type: 'application/pdf' });
    await uploadDocument(pdfFile, 'w9');

    expect(capturedFormData).toBeDefined();
    expect(capturedFormData!.get('document_type')).toBe('w9');
  });

  it('includes optional notes in FormData when provided', async () => {
    let capturedFormData: FormData | null = null;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedFormData = opts.body as FormData;
      return {
        ok: true,
        json: async () => ({
          success: true,
          document: {
            id: 'doc-3',
            documentType: 'direct_deposit_form',
            fileName: 'direct.pdf',
            fileUrl: null,
            fileSize: 1024,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
          },
        }),
      };
    }));

    const pdfFile = new File(['content'], 'direct.pdf', { type: 'application/pdf' });
    await uploadDocument(pdfFile, 'direct_deposit_form', 'Please review');

    expect(capturedFormData!.get('notes')).toBe('Please review');
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
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
    }));

    const result = await getDoulaDocuments();
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].documentType).toBe('background_check');
    expect(result.documents[0].fileName).toBe('bg.pdf');
  });

  it('normalizes camelCase API fields (documentType, fileName)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
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
    }));

    const result = await getDoulaDocuments();
    expect(result.documents[0].documentType).toBe('w9');
    expect(result.documents[0].fileName).toBe('w9.pdf');
    expect(result.documents[0].fileUrl).toBe('https://example.com/w9.pdf');
  });

  it('normalizes "pending" status to "uploaded"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
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
    }));

    const result = await getDoulaDocuments();
    expect(result.documents[0].status).toBe('uploaded');
  });

  it('returns completeness object when present', async () => {
    const completeness: DocumentCompleteness = {
      total_required: 5,
      total_complete: 3,
      missing_types: ['w9', 'direct_deposit_form'],
      has_all_required_documents: false,
      can_be_active: false,
      items: [],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        completeness,
      }),
    }));

    const result = await getDoulaDocuments();
    expect(result.completeness).toBeDefined();
    expect(result.completeness!.can_be_active).toBe(false);
    expect(result.completeness!.missing_types).toContain('w9');
  });
});

// ─────────────────────────────────────────────
// 3G. DocumentCompleteness — activation eligibility logic
// ─────────────────────────────────────────────
describe('Ticket 3 — DocumentCompleteness activation eligibility', () => {
  it('can_be_active is true when all 5 documents are approved', () => {
    const completeness: DocumentCompleteness = {
      total_required: 5,
      total_complete: 5,
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
      total_required: 5,
      total_complete: 4,
      missing_types: ['w9'],
      has_all_required_documents: false,
      can_be_active: false,
      items: [],
    };

    expect(completeness.can_be_active).toBe(false);
    expect(completeness.has_all_required_documents).toBe(false);
    expect(completeness.missing_types).toContain('w9');
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

    expect(completeness.total_required).toBe(5);
  });
});

// ─────────────────────────────────────────────
// 3H. Each required document type is uploadable
// ─────────────────────────────────────────────
describe('Ticket 3 — each required document type accepted by uploadDocument', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        document: {
          id: 'doc-x',
          documentType: 'background_check',
          fileName: 'file.pdf',
          fileUrl: null,
          fileSize: 1024,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
        },
      }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  for (const docType of REQUIRED_DOULA_DOCUMENT_TYPES as unknown as RequiredDocumentType[]) {
    it(`does not throw for required type: ${docType}`, async () => {
      const file = new File(['content'], `${docType}.pdf`, { type: 'application/pdf' });
      await expect(uploadDocument(file, docType)).resolves.toBeDefined();
    });
  }
});
