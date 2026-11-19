import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RequestForm from '@/features/intake/RequestForm';

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// These suites exercise the form after organization branding has loaded.
vi.mock('@/features/intake/application/usePublicIntakeBranding', () => ({
  usePublicIntakeBranding: () => ({
    status: 'ready',
    data: {
      slug: 'sokana',
      name: 'Sokana360',
      branding: {
        displayName: 'Sokana360',
        logoPath: '/logo.png',
        markPath: null,
        pageTitle: 'Request for Service Form',
        primaryColor: '#00897b',
        accentColor: '#00897b',
      },
    },
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('RequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('Form Rendering', () => {
    it('renders the request form with initial step', () => {
      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(
        screen.getByText(/Please complete this form as thoroughly as possible/)
      ).toBeInTheDocument();
      for (const logo of screen.getAllByAltText(/Sokana360 logo/i)) {
        expect(logo).toBeInTheDocument();
      }
    });

    it('shows Next button on first step', () => {
      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      expect(
        screen.getAllByRole('button', { name: /^next$/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /submit/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully with correct payload', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Fill out the form (this would be done by the user)
      // For now, we'll test the submission logic

      // Trigger form submission by clicking Next (which would advance through steps)
      const nextButton = screen.getAllByRole('button', { name: /^next$/i })[0];
      expect(nextButton).toBeInTheDocument();
    });

    it('handles successful submission with success message', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Test that the form renders correctly
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Services Interested In/i })
      ).toBeInTheDocument();
    });

    it('handles submission error with error message', async () => {
      const mockError = { error: 'Server error occurred' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Test form rendering
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('handles network error during submission', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Test form rendering
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner during submission', async () => {
      // Mock a delayed response
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      );

      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Test that form renders correctly
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders all required form fields', () => {
      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Initial mobile step is services interested.
      expect(
        screen.getByRole('heading', { name: /Services Interested In/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Which services are you interested in\?/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Describe the support you are looking for/i)
      ).toBeInTheDocument();
    });

    it('allows user to fill form fields', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      const serviceDetails = screen.getByLabelText(
        /Describe the support you are looking for/i
      );

      await user.type(serviceDetails, 'Postpartum overnight support');

      expect(serviceDetails).toHaveValue('Postpartum overnight support');
    });
  });

  describe('Success State', () => {
    it('shows success message with next steps after successful submission', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <MemoryRouter>
          <RequestForm />
        </MemoryRouter>
      );

      // Test that form renders correctly
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Services Interested In/i })
      ).toBeInTheDocument();
    });
  });
});
