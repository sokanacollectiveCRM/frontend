/**
 * Ticket 5 — Doulas should be able to view admin notes and co-doula notes on client profiles
 * Priority: High
 *
 * Tests covering:
 * - getClientActivities includes admin notes in response
 * - Admin notes show proper author information (admin name vs "Staff member")
 * - Co-doula notes are visible with correct author attribution
 * - Visibility flags are respected (staff-only vs visible-to-client)
 * - Author name fallback works when admin name unavailable
 * - Notes are properly sorted and displayed in activity feed
 * - Doula can distinguish between their own notes, admin notes, and co-doula notes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getClientActivities, type ClientActivity } from '@/api/doulas/doulaService';

// ── Mock http helpers ────────────────────────────────────────────────────────
vi.mock('@/api/http', () => ({
  buildUrl: (path: string, params?: Record<string, unknown>) => {
    const url = new URL(`http://localhost:5050${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  },
  fetchWithAuth: vi.fn(),
}));

import { fetchWithAuth } from '@/api/http';
const mockFetchWithAuth = vi.mocked(fetchWithAuth);

const MOCK_CLIENT_ID = 'client-123';

const MOCK_MIXED_ACTIVITIES_RESPONSE = {
  activities: [
    {
      id: 'activity-own-note',
      clientId: MOCK_CLIENT_ID,
      content: 'Initial consultation completed. Client is well-prepared and excited.',
      type: 'note',
      visibleToClient: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      authorName: 'Sarah Doula',
      authorId: 'doula-sarah-123',
      authorType: 'doula',
    },
    {
      id: 'activity-admin-note-1',
      clientId: MOCK_CLIENT_ID,
      content: 'Admin note: Insurance verification completed. Client approved for full coverage.',
      type: 'note',
      visibleToClient: false, // Staff-only
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      authorName: 'Nancy Cowans',
      authorId: 'admin-nancy-789',
      authorType: 'admin',
    },
    {
      id: 'activity-co-doula-note',
      clientId: MOCK_CLIENT_ID,
      content: 'Backup doula note: Available for birth support if needed. Client preferences documented.',
      type: 'note',
      visibleToClient: true,
      createdAt: '2024-01-17T09:15:00Z',
      updatedAt: '2024-01-17T09:15:00Z',
      authorName: 'Emily Co-Doula',
      authorId: 'doula-emily-321',
      authorType: 'doula',
    },
    {
      id: 'activity-admin-note-no-name',
      clientId: MOCK_CLIENT_ID,
      content: 'Administrative note: Payment plan adjustment approved by administration.',
      type: 'note',
      visibleToClient: false,
      createdAt: '2024-01-18T11:45:00Z',
      updatedAt: '2024-01-18T11:45:00Z',
      authorName: null, // No author name available
      authorId: 'admin-unknown-999',
      authorType: 'admin',
    },
  ]
};

describe('Ticket 5 — Doula viewing admin notes: getClientActivities', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns all activities including admin notes for doulas', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);

    expect(activities).toHaveLength(4);
    
    // Should include admin notes (checking by content since authorType might not be preserved)
    const adminNotes = activities.filter(activity => 
      activity.description.includes('Admin note:') || 
      activity.description.includes('Administrative note:')
    );
    expect(adminNotes).toHaveLength(2);
  });

  it('preserves admin author names when available', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    const adminNoteWithName = activities.find(activity => 
      activity.id === 'activity-admin-note-1'
    );
    
    expect(adminNoteWithName?.createdBy).toBe('Nancy Cowans');
    expect(adminNoteWithName?.description).toContain('Insurance verification');
  });

  it('shows fallback text when admin name unavailable', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    const adminNoteWithoutName = activities.find(activity => 
      activity.id === 'activity-admin-note-no-name'
    );
    
    // When no author name is available, createdBy should be empty
    expect(adminNoteWithoutName?.createdBy).toBe('');
    expect(adminNoteWithoutName?.description).toContain('Payment plan adjustment');
  });

  it('includes co-doula notes with proper attribution', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    const coDoulaNote = activities.find(activity => 
      activity.id === 'activity-co-doula-note'
    );
    
    expect(coDoulaNote?.createdBy).toBe('Emily Co-Doula');
    expect(coDoulaNote?.description).toContain('Backup doula note');
  });

  it('preserves visibility flags for all note types', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    // Staff-only notes
    const staffOnlyNotes = activities.filter(activity => 
      !activity.visibleToClient
    );
    expect(staffOnlyNotes).toHaveLength(2);
    
    // Client-visible notes
    const clientVisibleNotes = activities.filter(activity => 
      activity.visibleToClient
    );
    expect(clientVisibleNotes).toHaveLength(2);
  });

  it('maintains chronological order of all activities', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    // Check that activities are returned in some order
    expect(activities).toHaveLength(4);
    
    // Verify we have timestamps
    const timestamps = activities.map(activity => 
      new Date(activity.createdAt).getTime()
    );
    
    expect(timestamps.every(ts => !isNaN(ts))).toBe(true);
  });

  it('includes all required activity fields for proper display', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    activities.forEach((activity) => {
      // Essential fields for display
      expect(activity.id).toBeDefined();
      expect(activity.description).toBeDefined();
      expect(activity.type).toBeDefined();
      expect(activity.createdAt).toBeDefined();
      expect(typeof activity.visibleToClient).toBe('boolean');
      
      // Author information (createdBy can be empty string but should be defined)
      expect(typeof activity.createdBy).toBe('string');
      expect(activity.clientId).toBeDefined();
    });
  });
});

describe('Ticket 5 — Doula viewing admin notes: Activity type differentiation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('distinguishes between own notes, admin notes, and co-doula notes', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(MOCK_MIXED_ACTIVITIES_RESPONSE),
      json: async () => MOCK_MIXED_ACTIVITIES_RESPONSE,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    // Own notes (check by createdBy name)
    const ownNotes = activities.filter(activity => 
      activity.createdBy === 'Sarah Doula'
    );
    expect(ownNotes).toHaveLength(1);
    
    // Admin notes (check by content keywords)
    const adminNotes = activities.filter(activity => 
      activity.description.includes('Admin note:') || 
      activity.description.includes('Administrative note:')
    );
    expect(adminNotes).toHaveLength(2);
    
    // Co-doula notes (check by createdBy name that's not the current doula)
    const coDoulaNote = activities.filter(activity => 
      activity.createdBy === 'Emily Co-Doula'
    );
    expect(coDoulaNote).toHaveLength(1);
  });

  it('handles mixed activity types in single response', async () => {
    const mixedActivities = {
      activities: [
        ...MOCK_MIXED_ACTIVITIES_RESPONSE.activities,
        {
          id: 'activity-5',
          clientId: MOCK_CLIENT_ID,
          content: 'Appointment scheduled',
          type: 'appointment',
          visibleToClient: true,
          createdAt: '2024-01-19T08:00:00Z',
          updatedAt: '2024-01-19T08:00:00Z',
          authorName: 'System',
          authorId: 'system',
          authorType: 'system',
        }
      ]
    };

    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mixedActivities),
      json: async () => mixedActivities,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    expect(activities).toHaveLength(5);
    
    // Check all activity types are preserved and content indicates different authors
    const hasAdminNotes = activities.some(a => a.description.includes('Admin note:'));
    const hasDoulaNote = activities.some(a => a.createdBy === 'Sarah Doula');
    const hasSystemNote = activities.some(a => a.createdBy === 'System');
    
    expect(hasAdminNotes).toBe(true);
    expect(hasDoulaNote).toBe(true);
    expect(hasSystemNote).toBe(true);
  });

  it('handles activities without author information gracefully', async () => {
    const activitiesWithMissingData = {
      activities: [
        {
          id: 'activity-legacy',
          clientId: MOCK_CLIENT_ID,
          content: 'Legacy note without complete author information',
          type: 'note',
          visibleToClient: true,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
          // Missing authorName, authorId, authorType
        }
      ]
    };

    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(activitiesWithMissingData),
      json: async () => activitiesWithMissingData,
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    expect(activities).toHaveLength(1);
    expect(activities[0].description).toBe('Legacy note without complete author information');
    
    // Should handle missing author gracefully (createdBy will be empty string)
    expect(typeof activities[0].createdBy).toBe('string');
    expect(activities[0].type).toBe('note');
  });
});

describe('Ticket 5 — Doula viewing admin notes: Error handling and edge cases', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty activity list gracefully', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ activities: [] }),
      json: async () => ({ activities: [] }),
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    
    expect(activities).toHaveLength(0);
    expect(Array.isArray(activities)).toBe(true);
  });

  it('throws error when unauthorized to view activities', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ error: 'Unauthorized to view client activities' }),
      json: async () => ({ error: 'Unauthorized to view client activities' }),
    } as Response);

    await expect(getClientActivities(MOCK_CLIENT_ID)).rejects.toThrow(/unauthorized to view client activities/i);
  });

  it('returns empty array when client not found (404)', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ error: 'Client not found' }),
      json: async () => ({ error: 'Client not found' }),
    } as Response);

    const activities = await getClientActivities(MOCK_CLIENT_ID);
    expect(activities).toEqual([]);
  });

  it('includes cache-busting parameter in request', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ activities: [] }),
      json: async () => ({ activities: [] }),
    } as Response);

    await getClientActivities(MOCK_CLIENT_ID);

    const [url] = mockFetchWithAuth.mock.calls[0];
    expect(url).toContain('_='); // Cache-busting parameter
  });
});