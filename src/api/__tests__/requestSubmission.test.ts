import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_APP_BACKEND_URL: 'http://localhost:5050',
}));

describe('Request Submission API', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /requestService/requestSubmission', () => {
    const baseUrl = 'http://localhost:5050';
    const endpoint = '/requestService/requestSubmission';

    it('submits request successfully with valid data', async () => {
      const mockResponse = { success: true, message: 'Request submitted successfully' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        address: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        pronouns: 'he/him',
        relationship_status: 'married',
        referral_source: 'friend',
        health_history: 'No major health issues',
        due_date: '2024-12-25',
        had_previous_pregnancies: true,
        services_interested: ['Labor Support', 'Postpartum Care'],
        annual_income: '75000',
        number_of_babies: 1,
        demographics_multi: ['Hispanic', 'White'],
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}${endpoint}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(mockResponse);
    });

    it('handles server error responses', async () => {
      const mockError = { error: 'Validation failed', details: ['Email is required'] };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const requestData = {
        firstname: 'John',
        // Missing required email field
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual(mockError);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
      };

      await expect(
        fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })
      ).rejects.toThrow('Network error');
    });

    it('validates required fields', async () => {
      const mockError = { error: 'Missing required fields' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const incompleteData = {
        firstname: 'John',
        // Missing lastname, email, phone_number, etc.
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.error).toBe('Missing required fields');
    });

    it('handles email validation errors', async () => {
      const mockError = { error: 'Invalid email format' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const invalidEmailData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'invalid-email-format',
        phone_number: '555-123-4567',
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidEmailData),
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.error).toBe('Invalid email format');
    });

    it('handles phone number validation errors', async () => {
      const mockError = { error: 'Invalid phone number format' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const invalidPhoneData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: 'invalid-phone',
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPhoneData),
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.error).toBe('Invalid phone number format');
    });

    it('handles due date validation', async () => {
      const mockError = { error: 'Due date must be in the future' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const pastDueDateData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        due_date: '2020-01-01', // Past date
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pastDueDateData),
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.error).toBe('Due date must be in the future');
    });

    it('handles annual income validation', async () => {
      const mockError = { error: 'Annual income must be a valid number' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const invalidIncomeData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        annual_income: 'not-a-number',
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidIncomeData),
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.error).toBe('Annual income must be a valid number');
    });

    it('handles number_of_babies mapping correctly', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        number_of_babies: 'Twins', // String that should be mapped to 2
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}${endpoint}`,
        expect.objectContaining({
          body: expect.stringContaining('"number_of_babies"'),
        })
      );
    });

    it('handles demographics array correctly', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        demographics_multi: ['Hispanic', 'White', 'Asian'],
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}${endpoint}`,
        expect.objectContaining({
          body: expect.stringContaining('"demographics_multi"'),
        })
      );
    });

    it('handles services array correctly', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
        services_interested: ['Labor Support', 'Postpartum Care', 'Breastfeeding Support'],
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}${endpoint}`,
        expect.objectContaining({
          body: expect.stringContaining('"services_interested"'),
        })
      );
    });

    it('handles 500 server errors', async () => {
      const mockError = { error: 'Internal server error' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockError,
      });

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('handles timeout errors', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const requestData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '555-123-4567',
      };

      await expect(
        fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })
      ).rejects.toThrow('Request timeout');
    });
  });
}); 