import { beforeEach, expect, it, vi } from 'vitest';
import { buildUrl, fetchWithAuth } from '@/api/http';
import { staffRequest } from './staffPermissionsApi';
vi.mock('@/api/http', () => ({
  buildUrl: vi.fn((path) => `https://dev.example.test${path}`),
  fetchWithAuth: vi.fn(),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchWithAuth).mockResolvedValue({
    ok: true,
    json: async () => ({ allowed: true }),
  } as Response);
});
it('uses the mounted API prefix for access, roster and capability updates', async () => {
  await staffRequest('/access');
  expect(buildUrl).toHaveBeenLastCalledWith(
    '/api/admin/staff-permissions/access'
  );
  await staffRequest();
  expect(buildUrl).toHaveBeenLastCalledWith('/api/admin/staff-permissions');
  await staffRequest('/existing-admin', { capability: 'hr', enabled: true });
  expect(fetchWithAuth).toHaveBeenLastCalledWith(
    'https://dev.example.test/api/admin/staff-permissions/existing-admin',
    expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ capability: 'hr', enabled: true }),
    })
  );
});
