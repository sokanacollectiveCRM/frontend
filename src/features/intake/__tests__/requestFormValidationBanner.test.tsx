import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import {
  RequestFormProvider,
  useRequestFormContext,
} from 'features/intake/contexts/RequestFormContext';
import { DUMMY_TEST_LEAD } from 'features/intake/dummyTestLead';
import RequestForm from 'features/intake/RequestForm';
import type { RequestFormInput } from 'features/intake/useRequestForm';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('import.meta.env', () => ({
  VITE_APP_BACKEND_URL: 'http://localhost:5050',
}));

vi.mock('features/intake/application/usePublicIntakeBranding', () => ({
  usePublicIntakeBranding: () => ({
    status: 'ready',
    data: {
      slug: 'sokana360',
      name: 'Sokana360',
      branding: {
        displayName: 'Sokana360',
        logoPath: '/sokana360-logo.png',
        markPath: null,
        pageTitle: 'Request for Service Form',
        primaryColor: '#0A3147',
        accentColor: '#D6704D',
      },
    },
  }),
}));

global.fetch = vi.fn();

const BANNER_PATTERN = /Some required information is missing or invalid/i;

function FinalStepInvalidSubmitHarness() {
  const { form, setStep, handleNextStep, stepGateMessage } =
    useRequestFormContext();

  useEffect(() => {
    form.reset(DUMMY_TEST_LEAD as Partial<RequestFormInput>);
    form.setValue('service_support_details', '', { shouldValidate: false });
    setStep(8);
  }, [form, setStep]);

  return (
    <div>
      {stepGateMessage ? <div role='alert'>{stepGateMessage}</div> : null}
      <button type='button' onClick={() => void handleNextStep()}>
        Submit
      </button>
    </div>
  );
}

describe('Request form validation banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('shows the banner when Next is clicked on step 0 without required fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/request/sokana360']}>
        <RequestForm />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(BANNER_PATTERN);
    });
  });

  it('shows the banner when final submit fails full-form validation (e.g. missing why-doula)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <RequestFormProvider onSubmit={onSubmit}>
        <FinalStepInvalidSubmitHarness />
      </RequestFormProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^submit$/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(BANNER_PATTERN);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
