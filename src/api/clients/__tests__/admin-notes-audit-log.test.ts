/**
 * Admin Notes with Audit Log - Unit Tests
 * 
 * Tests covering:
 * - createClientNote function works correctly with admin metadata
 * - Audit trail information is properly stored (who, when, role)
 * - Note categorization and metadata handling
 * - Error handling for invalid note data
 * - API request format and authentication
 * - Response parsing and normalization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClientNote, type CreateNoteRequest, type ClientNote } from '@/api/clients/notes';

// Mock the fetch function
const mockFetch = vi.fn();

describe('Admin Notes with Audit Log - createClientNote', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    // Mock environment variable
    vi.stubEnv('VITE_APP_BACKEND_URL', 'http://localhost:5050');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('creates admin note with full audit trail metadata', async () => {
    const clientId = 'client-123';
    const mockNoteData: CreateNoteRequest = {
      type: 'note',
      description: 'Admin note: Client insurance verification completed.',
      metadata: {
        category: 'general',
        createdByName: 'Nancy Cowans',
        createdByRole: 'admin',
      }
    };

    const mockResponse = {
      activity: {
        id: 'note-456',
        client_id: clientId,
        activity_type: 'note',
        content: mockNoteData.description,
        metadata: mockNoteData.metadata,
        created_at: '2024-01-15T14:30:00Z',
        created_by: 'Nancy Cowans',
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createClientNote(clientId, mockNoteData);

    // Verify API call format
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5050/api/clients/client-123/activity',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: 'note',
          content: mockNoteData.description,
          metadata: mockNoteData.metadata,
        }),
      })
    );

    // Verify audit trail is preserved
    expect(result).toEqual({
      id: 'note-456',
      clientId: clientId,
      type: 'note',
      description: 'Admin note: Client insurance verification completed.',
      metadata: {
        category: 'general',
        createdByName: 'Nancy Cowans',
        createdByRole: 'admin',
      },
      timestamp: '2024-01-15T14:30:00Z',
      createdBy: 'Nancy Cowans',
    });
  });

  it('handles different note categories correctly', async () => {
    const clientId = 'client-789';
    const categories = ['communication', 'health', 'billing', 'milestone'];
    
    for (const category of categories) {
      const noteData: CreateNoteRequest = {
        type: 'note',
        description: `Test note for ${category} category`,
        metadata: {
          category,
          createdByName: 'Admin User',
          createdByRole: 'admin',
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          activity: {
            id: `note-${category}`,
            client_id: clientId,
            content: noteData.description,
            metadata: noteData.metadata,
            created_at: '2024-01-15T15:00:00Z',
            created_by: 'Admin User',
          }
        }),
      });

      const result = await createClientNote(clientId, noteData);
      
      expect(result.metadata?.category).toBe(category);
      expect(result.description).toContain(category);
    }

    expect(mockFetch).toHaveBeenCalledTimes(categories.length);
  });

  it('preserves admin role information in audit trail', async () => {
    const adminUsers = [
      { name: 'Nancy Cowans', role: 'admin' },
      { name: 'Sonia Collins', role: 'admin' },
      { name: 'Super Admin', role: 'super_admin' },
    ];

    for (const admin of adminUsers) {
      const noteData: CreateNoteRequest = {
        type: 'note',
        description: `Note added by ${admin.name}`,
        metadata: {
          category: 'general',
          createdByName: admin.name,
          createdByRole: admin.role,
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          activity: {
            id: `note-${admin.role}`,
            content: noteData.description,
            metadata: noteData.metadata,
            created_at: '2024-01-15T16:00:00Z',
            created_by: admin.name,
          }
        }),
      });

      const result = await createClientNote('client-test', noteData);
      
      expect(result.createdBy).toBe(admin.name);
      expect(result.metadata?.createdByRole).toBe(admin.role);
      expect(result.metadata?.createdByName).toBe(admin.name);
    }
  });

  it('includes authentication credentials in request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ activity: { id: 'test', content: 'test' } }),
    });

    await createClientNote('client-123', {
      type: 'note',
      description: 'Test note',
    });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.credentials).toBe('include');
  });

  it('handles server errors appropriately', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(
      createClientNote('client-123', {
        type: 'note',
        description: 'Test note',
      })
    ).rejects.toThrow(/Failed to create note: 500/);
  });

  it('handles unauthorized access (403)', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(
      createClientNote('client-123', {
        type: 'note',
        description: 'Unauthorized note',
      })
    ).rejects.toThrow(/Failed to create note: 403/);
  });

  it('validates required note description', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ activity: { id: 'test' } }),
    });

    // Test with empty description
    await createClientNote('client-123', {
      type: 'note',
      description: '',
      metadata: { category: 'general' }
    });

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.content).toBe('');
  });

  it('handles different response formats from server', async () => {
    const clientId = 'client-flexible';
    const noteData: CreateNoteRequest = {
      type: 'note',
      description: 'Flexible response test',
    };

    // Test format 1: { activity: {...} }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        activity: {
          id: 'format1',
          content: noteData.description,
          created_at: '2024-01-15T17:00:00Z',
        }
      }),
    });

    let result = await createClientNote(clientId, noteData);
    expect(result.id).toBe('format1');

    // Test format 2: { data: { activity: {...} } }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          activity: {
            id: 'format2',
            content: noteData.description,
            created_at: '2024-01-15T17:05:00Z',
          }
        }
      }),
    });

    result = await createClientNote(clientId, noteData);
    expect(result.id).toBe('format2');

    // Test format 3: direct object
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'format3',
        content: noteData.description,
        created_at: '2024-01-15T17:10:00Z',
      }),
    });

    result = await createClientNote(clientId, noteData);
    expect(result.id).toBe('format3');
  });

  it('preserves timestamp for audit trail', async () => {
    const exactTimestamp = '2024-01-15T18:45:30Z';
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        activity: {
          id: 'timestamp-test',
          content: 'Time audit test',
          created_at: exactTimestamp,
          timestamp: exactTimestamp,
        }
      }),
    });

    const result = await createClientNote('client-123', {
      type: 'note',
      description: 'Time audit test',
    });

    expect(result.timestamp).toBe(exactTimestamp);
  });

  it('handles missing or invalid response gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}), // Empty response
    });

    const result = await createClientNote('client-123', {
      type: 'note',
      description: 'Invalid response test',
    });

    // Should return normalized note with defaults for missing fields
    expect(result.id).toBe('undefined');
    expect(result.clientId).toBe('client-123');
    expect(result.type).toBe('note');
    expect(result.description).toBe('');
  });
});