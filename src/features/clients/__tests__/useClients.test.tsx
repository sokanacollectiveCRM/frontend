import { useClients } from '@/common/hooks/clients/useClients';
import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('getClients', () => {
    it('should fetch clients successfully', async () => {
      const mockClients = [
        {
          id: '1',
          user: {
            id: 'user1',
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@example.com',
            role: 'client',
          },
          serviceNeeded: 'Labor Support',
          requestedAt: '2025-01-15T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          status: 'lead',
          phone_number: '555-123-4567',
        },
        {
          id: '2',
          user: {
            id: 'user2',
            firstname: 'Jane',
            lastname: 'Smith',
            email: 'jane@example.com',
            role: 'client',
          },
          serviceNeeded: 'Postpartum Support',
          requestedAt: '2025-01-16T00:00:00.000Z',
          updatedAt: '2025-01-16T00:00:00.000Z',
          status: 'contacted',
          phone_number: '555-987-6543',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ success: true, data: mockClients }),
      });

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.getClients();
      });

      await waitFor(() => {
        expect(result.current.clients).toHaveLength(2);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      // Check that the first client has the expected structure
      expect(result.current.clients[0]).toMatchObject({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        serviceNeeded: 'Labor Support',
        status: 'lead',
        phoneNumber: '555-123-4567',
      });
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.getClients();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Server error');
        expect(result.current.clients).toHaveLength(0);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.getClients();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.clients).toHaveLength(0);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle session expiration errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.getClients();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('session has expired');
        expect(result.current.clients).toHaveLength(0);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getClientById', () => {
    it('should fetch individual client successfully', async () => {
      const mockClient = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_number: '555-123-4567',
        service_needed: 'Labor Support',
        status: 'lead',
        requested_at: '2025-01-15T00:00:00.000Z',
        updated_at: '2025-01-15T00:00:00.000Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ success: true, data: mockClient }),
      });

      const { result } = renderHook(() => useClients());

      const client = await act(async () => {
        return await result.current.getClientById('1');
      });

      expect(client).toMatchObject({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        serviceNeeded: 'Labor Support',
        status: 'lead',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle client not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Client not found',
      });

      const { result } = renderHook(() => useClients());

      const client = await act(async () => {
        return await result.current.getClientById('999');
      });

      expect(client).toBeNull();
      expect(result.current.error).toBe('Client not found');
    });
  });

  describe('Loading States', () => {
    it('should set loading state during fetch', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            text: async () => JSON.stringify({ success: true, data: [] }),
          }), 100)
        )
      );

      const { result } = renderHook(() => useClients());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.getClients();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful fetch', async () => {
      // First, set an error
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.getClients();
      });

      expect(result.current.error).toBe('Server error');
      

      // Then, make a successful request
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ success: true, data: [] }),
      });

      await act(async () => {
        await result.current.getClients();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
}); 
