/**
 * Ticket 4 — Add toggle feature for doulas to control client visibility of notes
 * Priority: High
 *
 * Tests covering:
 * - patchClientActivityVisibility updates note visibility correctly
 * - API sends PATCH request to correct endpoint with visibleToClient boolean
 * - Function handles server responses (success/error) appropriately
 * - Client activity normalization works with visibility updates
 * - Error handling for invalid activity IDs
 * - Proper authentication credentials included in request
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { patchClientActivityVisibility } from '@/api/doulas/doulaService';

// ── Mock http helpers ────────────────────────────────────────────────────────
vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => `http://localhost:5050${path}`,
  fetchWithAuth: vi.fn(),
}));

import { fetchWithAuth } from '@/api/http';
const mockFetchWithAuth = vi.mocked(fetchWithAuth);

const MOCK_CLIENT_ID = 'client-123';
const MOCK_ACTIVITY_ID = '550e8400-e29b-41d4-a716-446655440000';

const MOCK_ACTIVITY_RESPONSE = {
  activity: {
    id: MOCK_ACTIVITY_ID,
    clientId: MOCK_CLIENT_ID,
    content: 'Test note content',
    type: 'note',
    visibleToClient: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    authorName: 'Jane Doula',
    authorId: 'doula-123',
  }
};

describe('Ticket 4 — Notes visibility toggle: patchClientActivityVisibility', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends PATCH request to correct endpoint with client and activity IDs', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_ACTIVITY_RESPONSE),
      json: async () => MOCK_ACTIVITY_RESPONSE,
    } as Response);

    await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true);

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining(`/doulas/clients/${MOCK_CLIENT_ID}/activities/${MOCK_ACTIVITY_ID}`),
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibleToClient: true }),
      })
    );
  });

  it('sets visibleToClient to true when making note visible to client', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: true },
      }),
      json: async () => ({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: true },
      }),
    } as Response);

    await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true);

    const [, options] = mockFetchWithAuth.mock.calls[0];
    const requestBody = JSON.parse(options.body as string);
    expect(requestBody.visibleToClient).toBe(true);
  });

  it('sets visibleToClient to false when hiding note from client', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: false },
      }),
      json: async () => ({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: false },
      }),
    } as Response);

    await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, false);

    const [, options] = mockFetchWithAuth.mock.calls[0];
    const requestBody = JSON.parse(options.body as string);
    expect(requestBody.visibleToClient).toBe(false);
  });

  it('returns updated ClientActivity with correct visibility setting', async () => {
    const updatedActivity = {
      ...MOCK_ACTIVITY_RESPONSE.activity,
      visibleToClient: true,
    };

    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ activity: updatedActivity }),
      json: async () => ({ activity: updatedActivity }),
    } as Response);

    const result = await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true);

    expect(result.id).toBe(MOCK_ACTIVITY_ID);
    expect(result.visibleToClient).toBe(true);
    expect(result.description).toBe('Test note content');
    expect(result.createdBy).toBe('Jane Doula');
  });

  it('throws error for invalid activity ID format', async () => {
    const invalidActivityId = 'not-a-valid-uuid';

    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, invalidActivityId, true)
    ).rejects.toThrow(/no valid activity id/i);
  });

  it('throws error when server responds with error', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: 'Internal server error' }),
      json: async () => ({ error: 'Internal server error' }),
    } as Response);

    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true)
    ).rejects.toThrow(/internal server error/i);
  });

  it('throws error when server responds with 404 (activity not found)', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ error: 'Activity not found' }),
      json: async () => ({ error: 'Activity not found' }),
    } as Response);

    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, false)
    ).rejects.toThrow(/activity not found/i);
  });

  it('throws error when server responds with 403 (unauthorized)', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ error: 'Unauthorized to modify this activity' }),
      json: async () => ({ error: 'Unauthorized to modify this activity' }),
    } as Response);

    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true)
    ).rejects.toThrow(/unauthorized to modify this activity/i);
  });

  it('handles server response with nested activity data', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        data: {
          activity: {
            ...MOCK_ACTIVITY_RESPONSE.activity,
            visibleToClient: false,
          },
        },
      }),
      json: async () => ({
        data: {
          activity: {
            ...MOCK_ACTIVITY_RESPONSE.activity,
            visibleToClient: false,
          },
        },
      }),
    } as Response);

    const result = await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, false);

    expect(result.visibleToClient).toBe(false);
    expect(result.id).toBe(MOCK_ACTIVITY_ID);
  });

  it('throws error when server response has no activity data', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
      json: async () => ({}), // Empty response
    } as Response);

    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true)
    ).rejects.toThrow(/invalid response when updating activity/i);
  });

  it('properly encodes special characters in client and activity IDs', async () => {
    const clientIdWithSpaces = 'client with spaces';
    const activityIdWithSpecial = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_ACTIVITY_RESPONSE),
      json: async () => MOCK_ACTIVITY_RESPONSE,
    } as Response);

    await patchClientActivityVisibility(clientIdWithSpaces, activityIdWithSpecial, true);

    const [url] = mockFetchWithAuth.mock.calls[0];
    expect(url).toContain(encodeURIComponent(clientIdWithSpaces));
    expect(url).toContain(encodeURIComponent(activityIdWithSpecial));
  });

  it('handles toggle from visible to hidden and back correctly', async () => {
    // First call: make visible
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: true },
      }),
      json: async () => ({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: true },
      }),
    } as Response);

    const resultVisible = await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, true);
    expect(resultVisible.visibleToClient).toBe(true);

    // Second call: hide again
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: false },
      }),
      json: async () => ({
        activity: { ...MOCK_ACTIVITY_RESPONSE.activity, visibleToClient: false },
      }),
    } as Response);

    const resultHidden = await patchClientActivityVisibility(MOCK_CLIENT_ID, MOCK_ACTIVITY_ID, false);
    expect(resultHidden.visibleToClient).toBe(false);

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);
  });
});

describe('Ticket 4 — Notes visibility toggle: Activity ID validation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects empty activity ID', async () => {
    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, '', true)
    ).rejects.toThrow(/no valid activity id/i);
  });

  it('rejects null activity ID', async () => {
    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, null as any, true)
    ).rejects.toThrow(/no valid activity id/i);
  });

  it('rejects undefined activity ID', async () => {
    await expect(
      patchClientActivityVisibility(MOCK_CLIENT_ID, undefined as any, true)
    ).rejects.toThrow(/no valid activity id/i);
  });

  it('accepts valid UUID format activity ID', async () => {
    const validUuid = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
    
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        activity: {
          ...MOCK_ACTIVITY_RESPONSE.activity,
          id: validUuid,
        },
      }),
      json: async () => ({
        activity: {
          ...MOCK_ACTIVITY_RESPONSE.activity,
          id: validUuid,
        },
      }),
    } as Response);

    const result = await patchClientActivityVisibility(MOCK_CLIENT_ID, validUuid, true);
    expect(result.id).toBe(validUuid);
  });
});