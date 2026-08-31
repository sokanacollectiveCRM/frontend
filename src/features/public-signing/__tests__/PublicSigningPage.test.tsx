import PublicSigningPage from '@/features/public-signing/PublicSigningPage';
import type { SigningSession } from '@/features/public-signing/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/public-signing/SigningPdf', () => ({
  SigningPdf: ({
    onFieldActivate,
    guidedMode,
  }: {
    onFieldActivate: (fieldId: string) => void;
    guidedMode: boolean;
  }) => (
    <div data-testid='signing-pdf' data-guided={guidedMode ? 'true' : 'false'}>
      <button type='button' onClick={() => onFieldActivate('initials-1')}>
        Apply initials-1
      </button>
    </div>
  ),
}));

const session: SigningSession = {
  contractId: 'contract-1',
  title: 'Labor Support Agreement',
  signerName: 'Jane Doe',
  status: 'pending_signature',
  pdfUrl: '/signing/session/document',
  signingManifest: [
    {
      id: 'initials-1',
      kind: 'initials',
      page: 2,
      coordinates: { x: 0.45, y: 0.8, width: 0.09, height: 0.025 },
      required: true,
    },
    {
      id: 'signature-1',
      kind: 'signature',
      page: 3,
      coordinates: { x: 0.6, y: 0.3, width: 0.2, height: 0.04 },
      required: true,
    },
    {
      id: 'date-1',
      kind: 'signing_date',
      page: 3,
      coordinates: { x: 0.15, y: 0.35, width: 0.2, height: 0.04 },
      required: true,
    },
  ],
  progress: [],
  consent: {
    language: 'I agree to sign electronically.',
    version: '1',
  },
  expiresAt: '2026-12-31T00:00:00.000Z',
  canContinue: true,
};

const getSigningSession = vi.fn();
const saveSigningProgress = vi.fn();
const completeSigning = vi.fn();

vi.mock('@/features/public-signing/signingApi', () => ({
  getSigningSession: (...args: unknown[]) => getSigningSession(...args),
  saveSigningProgress: (...args: unknown[]) => saveSigningProgress(...args),
  completeSigning: (...args: unknown[]) => completeSigning(...args),
  SigningApiError: class SigningApiError extends Error {
    constructor(
      message: string,
      readonly status: number,
      readonly retryAfterSeconds: number | null
    ) {
      super(message);
      this.name = 'SigningApiError';
    }
  },
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/signing']}>
      <Routes>
        <Route path='/signing' element={<PublicSigningPage />} />
        <Route
          path='/contract-signed'
          element={<div>Signed confirmation</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicSigningPage guided flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSigningSession.mockResolvedValue(session);
    saveSigningProgress.mockImplementation(async (_completedFieldIds) => ({
      ...session,
      progress: _completedFieldIds.map((fieldId: string) => ({
        fieldId,
        completedAt: '2026-08-29T00:00:00.000Z',
      })),
    }));
    completeSigning.mockResolvedValue({
      contractId: 'contract-1',
      status: 'signed',
      signature: {
        id: 'sig-1',
        signerId: 'signer-1',
        signerName: 'Jane Doe',
        type: 'typed',
        signedAt: '2026-08-29T00:00:00.000Z',
        completedFieldIds: ['initials-1', 'signature-1', 'date-1'],
      },
      signedAt: '2026-08-29T00:00:00.000Z',
    });
  });

  it('shows initial progress and opens adoption before guided mode begins', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByRole('region', { name: 'Start signing' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/0 of 3 required fields completed/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'START' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'START' }));
    expect(
      await screen.findByRole('heading', { name: 'Adopt your signature' })
    ).toBeInTheDocument();
  });

  it('allows the signer to dismiss the adoption modal', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'START' }));
    expect(
      await screen.findByRole('heading', { name: 'Adopt your signature' })
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Adopt your signature' })
      ).not.toBeInTheDocument()
    );
  });

  it('warns before closing a continuable signing session', async () => {
    renderPage();
    await screen.findByRole('button', { name: 'START' });

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('gates FINISH until every required field is individually applied', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('button', { name: 'START' });

    await user.click(screen.getByRole('button', { name: 'START' }));
    await user.type(screen.getByLabelText('Typed signature'), 'Jane Doe');
    await user.type(screen.getByLabelText('Initials'), 'JD');
    await user.click(screen.getByRole('checkbox'));
    await user.click(
      screen.getByRole('button', { name: 'Adopt and continue' })
    );

    expect(
      await screen.findByRole('toolbar', { name: 'Signing navigation' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FINISH' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Apply initials-1' }));
    await waitFor(() =>
      expect(saveSigningProgress).toHaveBeenCalledWith(['initials-1'])
    );

    expect(screen.getByRole('button', { name: 'FINISH' })).toBeDisabled();
  });
});
