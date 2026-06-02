import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { vi } from 'vitest';
import { RequestFormProvider, useRequestFormContext } from '../contexts/RequestFormContext';
import { DUMMY_TEST_LEAD } from '../dummyTestLead';
import RequestForm from '../RequestForm';
import type { RequestFormInput } from '../useRequestForm';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('import.meta.env', () => ({
  VITE_APP_BACKEND_URL: 'http://localhost:5050',
}));

global.fetch = vi.fn();

const BANNER_PATTERN = /Some required information is missing or invalid/i;

function FinalStepInvalidSubmitHarness() {
  const { form, setStep, handleNextStep, stepGateMessage } =
    useRequestFormContext();

  useEffect(() => {
    form.reset(DUMMY_TEST_LEAD as Partial<RequestFormInput>);
    form.setValue('payment_method', '', { shouldValidate: false });
    setStep(8);
  }, [form, setStep]);

  return (
    <div>
      {stepGateMessage ? (
        <div role='alert'>{stepGateMessage}</div>
      ) : null}
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
    render(<RequestForm />);

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(BANNER_PATTERN);
    });
  });

  it('shows the banner when final submit fails full-form validation (e.g. missing payment)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <RequestFormProvider onSubmit={onSubmit}>
        <FinalStepInvalidSubmitHarness />
      </RequestFormProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^submit$/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(BANNER_PATTERN);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
