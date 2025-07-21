import { vi } from 'vitest';
import deleteClient from './deleteClient';

global.fetch = vi.fn();

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('deleteClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  it('should call DELETE /clients/delete with client ID in body and return success on 204', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 204,
      ok: true,
      text: async () => '',
    });
    const result = await deleteClient('123');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/clients/delete'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ id: '123' }),
      })
    );
    expect(result).toEqual({ success: true });
  });

  it('should call DELETE /clients/delete and return success on 200 OK', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 200,
      ok: true,
      text: async () => '',
    });
    const result = await deleteClient('456');
    expect(result).toEqual({ success: true });
  });

  it('should handle error response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 400,
      ok: false,
      text: async () => 'Bad Request',
    });
    const result = await deleteClient('789');
    expect(result.success).toBe(false);
    expect(result.error).toContain('400');
  });

  it('should handle network error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    const result = await deleteClient('999');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
}); 