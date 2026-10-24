import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AdminDoulaDocumentsSection } from '@/features/hours/components/AdminDoulaDocumentsSection';
import {
  getDoulaDocumentUrl,
  partitionDoulaDocuments,
} from '@/api/doulas/doulaService';
vi.mock('@/api/doulas/doulaService', async () => {
  const actual = await vi.importActual<
    typeof import('@/api/doulas/doulaService')
  >('@/api/doulas/doulaService');
  return {
    ...actual,
    getAdminDoulaDocuments: vi.fn().mockResolvedValue({}),
    partitionDoulaDocuments: vi.fn(),
    getDoulaDocumentUrl: vi.fn(),
  };
});
afterEach(cleanup);
it.each(['JPEG', 'PNG', 'PDF'])('admin preview opens %s', async (extension) => {
  vi.mocked(partitionDoulaDocuments).mockReturnValue({
    active: [
      {
        document_type: 'training_certificate',
        document_id: 'fictional-doc',
        status: 'uploaded',
        file_name: `fictional.${extension}`,
      },
    ],
    archived: [],
    canBeActive: false,
    totalComplete: 0,
    totalRequired: 1,
  });
  vi.mocked(getDoulaDocumentUrl).mockResolvedValue(
    'https://example.test/signed-document'
  );
  render(<AdminDoulaDocumentsSection doulaId='fictional-doula' />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'View', exact: true })
  );
  const preview =
    extension === 'PDF'
      ? await screen.findByTitle('PDF document preview')
      : await screen.findByAltText(`fictional.${extension}`);
  expect(preview).toHaveAttribute(
    'src',
    'https://example.test/signed-document'
  );
});
