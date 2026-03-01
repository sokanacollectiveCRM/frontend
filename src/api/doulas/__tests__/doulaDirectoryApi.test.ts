import { beforeEach, describe, expect, it, vi } from 'vitest';

const { buildUrlMock, fetchWithAuthMock } = vi.hoisted(() => ({
  buildUrlMock: vi.fn((path: string) => `http://localhost:5050${path}`),
  fetchWithAuthMock: vi.fn(),
}));

vi.mock('@/api/http', () => ({
  buildUrl: buildUrlMock,
  fetchWithAuth: fetchWithAuthMock,
}));

import {
  patchDoulaAssignmentRoleUrl,
  updateDoulaAssignmentRole,
} from '@/api/doulas/doulaDirectoryApi';

function makeResponse(input: {
  ok: boolean;
  status: number;
  statusText?: string;
  contentType?: string;
  jsonData?: Record<string, unknown>;
  textData?: string;
}): Response {
  return {
    ok: input.ok,
    status: input.status,
    statusText: input.statusText || '',
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type'
          ? input.contentType || 'application/json'
          : null,
    },
    json: vi.fn().mockResolvedValue(input.jsonData || {}),
    text: vi.fn().mockResolvedValue(input.textData || ''),
  } as unknown as Response;
}

describe('doulaDirectoryApi route contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the role update endpoint with /api prefix', () => {
    const result = patchDoulaAssignmentRoleUrl(
      'client-123',
      'doula-456'
    );

    expect(buildUrlMock).toHaveBeenCalledWith(
      '/api/doula-assignments/client-123/doula-456'
    );
    expect(result).toBe(
      'http://localhost:5050/api/doula-assignments/client-123/doula-456'
    );
  });

  it('sends PATCH to the role update endpoint', async () => {
    fetchWithAuthMock.mockResolvedValueOnce(
      makeResponse({
        ok: true,
        status: 200,
        jsonData: { success: true },
      })
    );

    await updateDoulaAssignmentRole('client-123', 'doula-456', {
      role: 'primary',
    });

    expect(fetchWithAuthMock).toHaveBeenCalledWith(
      'http://localhost:5050/api/doula-assignments/client-123/doula-456',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'primary' }),
      })
    );
  });

  it('throws a clear endpoint mismatch message for HTML 404 route misses', async () => {
    fetchWithAuthMock.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 404,
        contentType: 'text/html',
        textData:
          '<!DOCTYPE html><html><body><pre>Cannot PATCH /doula-assignments/client-123/doula-456</pre></body></html>',
      })
    );

    await expect(
      updateDoulaAssignmentRole('client-123', 'doula-456', { role: 'backup' })
    ).rejects.toThrow(
      'Role update endpoint mismatch (client/backend route contract).'
    );
  });
});
