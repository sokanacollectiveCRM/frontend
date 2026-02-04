import useSaveUser from '@/common/hooks/user/useSaveUser';
import { ROLE, User } from '@/common/utils/User';
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

describe('useSaveUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('Successful User Update', () => {
    it('should save user data successfully', async () => {
      const mockUserData: User = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      };

      const mockResponse = { success: true, user: mockUserData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await useSaveUser(mockUserData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5050/users/update',
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockUserData),
        }
      );
    });

    it('should handle user data with all fields', async () => {
      const mockUserData: User = {
        id: '2',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane@example.com',
        role: ROLE.CLIENT,
        zip_code: 12345,
      };

      const mockResponse = { success: true, user: mockUserData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await useSaveUser(mockUserData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5050/users/update',
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockUserData),
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API returns error', async () => {
      const mockUserData: User = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(useSaveUser(mockUserData)).rejects.toThrow('Failed to save user');
    });

    it('should throw error on network failure', async () => {
      const mockUserData: User = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      };

      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(useSaveUser(mockUserData)).rejects.toThrow('Network error');
    });

    it('should throw error when user ID is missing', async () => {
      const mockUserData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      } as User;

      // This should trigger the console.assert in the hook
      const consoleSpy = vi.spyOn(console, 'assert').mockImplementation(() => { });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await useSaveUser(mockUserData);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Authentication', () => {
    it('should include auth token in request', async () => {
      const mockUserData: User = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await useSaveUser(mockUserData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should handle missing auth token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockUserData: User = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await useSaveUser(mockUserData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer null',
          }),
        })
      );
    });
  });

  describe('Request Format', () => {
    it('should send correct request format', async () => {
      const mockUserData: User = {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: ROLE.CLIENT,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await useSaveUser(mockUserData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5050/users/update',
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockUserData),
        }
      );
    });

    it('should handle special characters in user data', async () => {
      const mockUserData: User = {
        id: '1',
        firstname: 'José',
        lastname: 'García-López',
        email: 'jose.garcia@example.com',
        role: ROLE.CLIENT,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await useSaveUser(mockUserData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5050/users/update',
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockUserData),
        }
      );
    });
  });
}); 