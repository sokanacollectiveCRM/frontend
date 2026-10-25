import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DocumentsTab from '@/features/doula-dashboard/components/DocumentsTab';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@/api/doulas/doulaService', async () => {
  const actual = await vi.importActual<
    typeof import('@/api/doulas/doulaService')
  >('@/api/doulas/doulaService');
  return {
    ...actual,
    getDoulaDocuments: vi.fn(),
    uploadDocument: vi.fn(),
    deleteDoulaDocument: vi.fn(),
    updateDoulaDocumentMetadata: vi.fn(),
  };
});

import { getDoulaDocuments } from '@/api/doulas/doulaService';

const mockGetDoulaDocuments = vi.mocked(getDoulaDocuments);

describe('DocumentsTab Oct 21 document set', () => {
  beforeEach(() => {
    mockGetDoulaDocuments.mockResolvedValue({
      documents: [],
      completeness: {
        total_required: 1,
        total_complete: 0,
        missing_types: ['training_certificate'],
        has_all_required_documents: false,
        can_be_active: false,
        items: [
          {
            document_type: 'training_certificate',
            status: 'missing',
          },
        ],
      },
    });
  });

  it('shows the training certificate, optional uploads, and the Medicaid note', async () => {
    render(<DocumentsTab />);

    expect(
      await screen.findByText('Doula training certificate')
    ).toBeInTheDocument();
    expect(screen.getByText('Liability insurance')).toBeInTheDocument();
    expect(
      screen.getByText('Required for Medicaid clients')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Illinois Medicaid certification')
    ).toBeInTheDocument();
    expect(screen.getByText('Miscellaneous documents')).toBeInTheDocument();

    expect(screen.getByTestId('profile-documents-grid')).toHaveClass(
      'grid',
      'md:grid-cols-2'
    );
    expect(
      screen
        .getAllByRole('button', { name: 'Upload', exact: true })
        .every((button) => button.getAttribute('type') === 'button')
    ).toBe(true);
    expect(screen.getAllByText('Required')).toHaveLength(1);
    expect(screen.getAllByText('Optional')).toHaveLength(3);
    const training = screen.getByTestId('document-slot-training_certificate');
    expect(
      within(training).getByText('Doula training certificate')
    ).toHaveClass('text-red-600');
    expect(training).toHaveClass('border-l-amber-500');
    for (const label of [
      'Liability insurance',
      'Illinois Medicaid certification',
      'Miscellaneous documents',
    ]) {
      const title = screen.getByText(label);
      expect(title).not.toHaveClass('text-red-600');
      const slot = title.closest('[data-testid]')! as HTMLElement;
      expect(slot).not.toHaveClass('border-l-amber-500');
      expect(
        within(slot).queryByText('Required', { exact: true })
      ).not.toBeInTheDocument();
    }

    expect(screen.queryByText(/W9/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Direct Deposit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Background Check/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Background check')).not.toBeInTheDocument();
  });
});
