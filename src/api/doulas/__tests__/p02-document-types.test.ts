import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadDocument, type DocumentType } from '@/api/doulas/doulaService';
import { uploadInsuranceCard } from '@/api/clients/clientDocuments';
import { fetchWithAuth } from '@/api/http';
import { fictionalFile, formats } from '@/test/fixtures/makeDocumentFile';
import { DOCUMENT_TYPE_ERROR } from '@/common/utils/documentUpload';
vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => path,
  fetchWithAuth: vi.fn(),
}));
const fields = [
  'training_certificate',
  'w9',
  'direct_deposit_form',
  'cpr',
  'hipaa',
  'liability_insurance_certificate',
  'illinois_medicaid_certification',
  'miscellaneous',
  'license',
  'other',
  'insurance_front',
  'insurance_back',
];
function upload(field: string, file: File) {
  return field.startsWith('insurance_')
    ? uploadInsuranceCard(file, field === 'insurance_back' ? 'back' : 'front')
    : uploadDocument(file, field as DocumentType);
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchWithAuth).mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({
      id: 'fictional-document',
      document_type: 'insurance_card',
    }),
    text: async () =>
      JSON.stringify({
        id: 'fictional-document',
        document_type: 'insurance_card',
      }),
  } as Response);
});
describe.each(fields)('P-02 upload field %s', (field) => {
  it.each(Object.keys(formats) as (keyof typeof formats)[])(
    'uploads %s in both extension cases',
    async (extension) => {
      await upload(field, fictionalFile(extension));
      await upload(field, fictionalFile(extension, true));
      expect(fetchWithAuth).toHaveBeenCalledTimes(2);
    }
  );
  it.each(['exe', 'docx', 'gif', 'pdf'])(
    'rejects unsupported/disguised %s before API calls',
    async (extension) => {
      await expect(
        upload(
          field,
          new File(['fictional text'], `fictional.${extension}`, {
            type: 'application/pdf',
          })
        )
      ).rejects.toThrow(DOCUMENT_TYPE_ERROR);
      expect(fetchWithAuth).not.toHaveBeenCalled();
    }
  );
});
