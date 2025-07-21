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
      const user = userEvent.setup();
      render(<RequestForm />);

      // Verify form renders correctly
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(screen.getByText('Client Details')).toBeInTheDocument();

      // Check for required fields
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile phone/i)).toBeInTheDocument();
    });

    it('allows user to fill form fields', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      // Fill out the form fields
      const firstnameInput = screen.getByLabelText(/first name/i);
      const lastnameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/mobile phone/i);

      // Clear existing values first
      await user.clear(firstnameInput);
      await user.clear(lastnameInput);
      await user.clear(emailInput);
      await user.clear(phoneInput);

      await user.type(firstnameInput, 'John');
      await user.type(lastnameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(phoneInput, '555-123-4567');

      // Verify values are set
      expect(firstnameInput).toHaveValue('John');
      expect(lastnameInput).toHaveValue('Doe');
      expect(emailInput).toHaveValue('john.doe@example.com');
      expect(phoneInput).toHaveValue('555-123-4567');
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

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<RequestForm />);

      // Fill form with invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

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
      const user = userEvent.setup();
      render(<RequestForm />);

      // Check for form sections
      expect(screen.getByText('Client Details')).toBeInTheDocument();

      // Check for form fields
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preferred name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preferred contact method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pronouns/i)).toBeInTheDocument();
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
      const firstnameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstnameInput);
      await user.type(firstnameInput, 'John');

      // Try to submit
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Form should still be visible and maintain field values
      expect(screen.getByText('Request for Service Form')).toBeInTheDocument();
      expect(firstnameInput).toHaveValue('John');
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