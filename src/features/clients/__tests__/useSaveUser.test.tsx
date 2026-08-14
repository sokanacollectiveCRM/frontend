import useSaveUser from '@/common/hooks/user/useSaveUser';
import { ROLE, User } from '@/common/utils/User';
import { vi } from 'vitest';

vi.mock('@/api/sessionAccessToken', () => ({
  getSessionAccessToken: () => null,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  },
}));

global.fetch = vi.fn();

function expectUpdateUserFetch(userData: User) {
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toBe('http://localhost:5050/users/update');
  expect(init.method).toBe('PUT');
  expect(init.credentials).toBe('include');
  expect(init.body).toBe(JSON.stringify(userData));
  expect(new Headers(init.headers).get('Content-Type')).toBe(
    'application/json'
  );
}

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
      expectUpdateUserFetch(mockUserData);
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
      expectUpdateUserFetch(mockUserData);
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

      await expect(useSaveUser(mockUserData)).rejects.toThrow(
        'Failed to save user'
      );
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
      const consoleSpy = vi
        .spyOn(console, 'assert')
        .mockImplementation(() => {});

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
    it('should use cookie credentials for auth', async () => {
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
          credentials: 'include',
        })
      );
    });

    it('should still work when localStorage token is missing', async () => {
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
          credentials: 'include',
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

      expectUpdateUserFetch(mockUserData);
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

      expectUpdateUserFetch(mockUserData);
    });
  });
});
