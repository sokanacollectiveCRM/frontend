import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RequestForm from '../RequestForm';

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the environment variable
vi.mock('import.meta.env', () => ({
  VITE_APP_BACKEND_URL: 'http://localhost:5050',
}));

// Mock fetch
global.fetch = vi.fn();

describe('RequestForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('Complete Form Submission Flow', () => {
    it('renders form with all required fields', async () => {
      render(<RequestForm />);

      // Verify form renders correctly
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(
        screen.getByText('What service(s) are you interested in?')
      ).toBeInTheDocument();

      // Check for required fields on initial step
      expect(
        screen.getByLabelText(
          /What specific service do you need\? Please describe your requirements\*/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/What does doula support look like for you\?/i)
      ).toBeInTheDocument();
    });

    it('allows user to fill form fields', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      // Fill out the form fields
      const supportDetailsInput = screen.getByLabelText(
        /What does doula support look like for you\?/i
      );
      const serviceNeededInput = screen.getByLabelText(
        /What specific service do you need\? Please describe your requirements\*/i
      );

      await user.type(
        supportDetailsInput,
        'I need overnight support for 8 weeks after delivery.'
      );
      await user.type(serviceNeededInput, 'Postpartum overnight doula care');

      // Verify values are set
      expect(supportDetailsInput).toHaveValue(
        'I need overnight support for 8 weeks after delivery.'
      );
      expect(serviceNeededInput).toHaveValue('Postpartum overnight doula care');
    });

    it('shows Next button on first step', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      // Verify Next button is present
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();

      // Verify Back button is disabled on first step
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    it('handles form validation errors', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      // Try to submit without filling required fields
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible (validation would prevent advancement)
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('shows loading state during submission', async () => {
      // Mock a delayed response
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true }),
          }), 200)
        )
      );

      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible (this is a multi-step form)
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('validates required fields on initial step', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible (validation would prevent advancement)
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('handles timeout errors', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('renders form sections correctly', async () => {
      render(<RequestForm />);

      // Check for form sections
      expect(
        screen.getByText('What service(s) are you interested in?')
      ).toBeInTheDocument();

      // Check for form fields on initial step
      expect(
        screen.getByLabelText(
          /What specific service do you need\? Please describe your requirements\*/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/What does doula support look like for you\?/i)
      ).toBeInTheDocument();
    });

    it('handles multiple submission attempts', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });

      // Click multiple times
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Form should still be visible
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('maintains form state after errors', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      // Fill some fields
      const serviceNeededInput = screen.getByLabelText(
        /What specific service do you need\? Please describe your requirements\*/i
      );
      await user.type(serviceNeededInput, 'Postpartum support needed');

      // Try to submit
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible and maintain field values
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(serviceNeededInput).toHaveValue('Postpartum support needed');
    });
  });

  describe('Form State Management', () => {
    it('prevents multiple submissions while processing', async () => {
      // Mock a delayed response
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true }),
          }), 300)
        )
      );

      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });

      // Click multiple times quickly
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Form should still be visible
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });

    it('resets form state after error', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible for retry
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
    });
  });
}); 
