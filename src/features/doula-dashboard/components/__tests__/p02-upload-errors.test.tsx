import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DocumentsTab from '@/features/doula-dashboard/components/DocumentsTab';
import { DOCUMENT_TYPE_ERROR } from '@/common/utils/documentUpload';
import { fictionalFile } from '@/test/fixtures/makeDocumentFile';
import { fetchWithAuth } from '@/api/http';
vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => path,
  fetchWithAuth: vi.fn(),
}));
vi.mock('@/api/doulas/doulaService', async () => {
  const actual = await vi.importActual<
    typeof import('@/api/doulas/doulaService')
  >('@/api/doulas/doulaService');
  return {
    ...actual,
    getDoulaDocuments: vi.fn().mockResolvedValue({ documents: [] }),
  };
});
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());
const fields = [
  'training_certificate',
  'liability_insurance_certificate',
  'illinois_medicaid_certification',
  'miscellaneous',
];
describe.each(fields)('P-02 inline error for %s', (field) => {
  it.each(['exe', 'docx', 'gif', 'pdf'])(
    'shows a plain-language error for unsupported/disguised %s',
    async (extension) => {
      render(<DocumentsTab />);
      const slot = await screen.findByTestId(`document-slot-${field}`);
      fireEvent.click(within(slot).getByRole('button', { name: 'Upload' }));
      const input = document.getElementById('file') as HTMLInputElement;
      fireEvent.change(input, {
        target: {
          files: [
            new File(['fictional text'], `fictional.${extension}`, {
              type: 'application/pdf',
            }),
          ],
        },
      });
      fireEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Upload',
        })
      );
      expect(await screen.findByRole('alert')).toHaveTextContent(
        DOCUMENT_TYPE_ERROR
      );
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(fetchWithAuth).not.toHaveBeenCalled();
    }
  );
  it('also displays a backend validation rejection inline', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: DOCUMENT_TYPE_ERROR }),
    } as Response);
    render(<DocumentsTab />);
    fireEvent.click(
      within(await screen.findByTestId(`document-slot-${field}`)).getByRole(
        'button',
        { name: 'Upload' }
      )
    );
    fireEvent.change(document.getElementById('file')!, {
      target: { files: [fictionalFile('pdf')] },
    });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Upload' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      DOCUMENT_TYPE_ERROR
    );
  });
});
