/**
 * Ticket 3 — Rename client status "Interviewing" to "Interviewed" in the Sokana CRM
 * Priority: Medium
 *
 * Tests covering:
 * - CLIENT_STATUS_LABELS maps 'interviewing' status to 'Interviewed' label
 * - CLIENT_STATUSES array includes 'interviewing' as valid status value
 * - Status mapping is consistent across client domain types
 * - Existing records with 'interviewing' status display as 'Interviewed'
 * - Internal API value remains 'interviewing' for compatibility
 * - Label display logic works in all UI contexts
 */

import { describe, it, expect } from 'vitest';
import { 
  CLIENT_STATUSES, 
  CLIENT_STATUS_LABELS, 
  type ClientStatus,
  type ClientLite,
  type ClientDetail 
} from '@/domain/client';

describe('Ticket 3 — Client status "Interviewed": Status definition and mapping', () => {
  it('includes "interviewing" as a valid client status', () => {
    expect(CLIENT_STATUSES).toContain('interviewing');
    expect(CLIENT_STATUSES).toEqual([
      'lead',
      'contacted', 
      'matched',
      'interviewing',
      'follow up',
      'contract',
      'active',
      'complete',
      'not hired',
    ]);
  });

  it('maps "interviewing" status to "Interviewed" label', () => {
    expect(CLIENT_STATUS_LABELS.interviewing).toBe('Interviewed');
  });

  it('maintains internal API value as "interviewing" while displaying "Interviewed"', () => {
    const clientStatus: ClientStatus = 'interviewing';
    const displayLabel = CLIENT_STATUS_LABELS[clientStatus];
    
    // Internal value is still 'interviewing' for API compatibility
    expect(clientStatus).toBe('interviewing');
    // But displayed as 'Interviewed' to users
    expect(displayLabel).toBe('Interviewed');
  });

  it('all client statuses have corresponding labels', () => {
    CLIENT_STATUSES.forEach((status) => {
      expect(CLIENT_STATUS_LABELS[status]).toBeDefined();
      expect(typeof CLIENT_STATUS_LABELS[status]).toBe('string');
      expect(CLIENT_STATUS_LABELS[status].length).toBeGreaterThan(0);
    });
  });

  it('interviewing status is not accidentally duplicated', () => {
    const interviewingCount = CLIENT_STATUSES.filter(status => 
      status === 'interviewing' || status === 'interviewed'
    ).length;
    expect(interviewingCount).toBe(1);
  });
});

describe('Ticket 3 — Client status "Interviewed": UI display scenarios', () => {
  it('displays "Interviewed" for ClientLite objects with interviewing status', () => {
    const mockClient: ClientLite = {
      id: 'client-123',
      firstname: 'Jane',
      lastname: 'Doe',
      status: 'interviewing',
      serviceNeeded: 'Birth support',
      requestedAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      profilePicture: null,
    };

    const displayLabel = CLIENT_STATUS_LABELS[mockClient.status];
    expect(displayLabel).toBe('Interviewed');
  });

  it('displays "Interviewed" for ClientDetail objects with interviewing status', () => {
    const mockClientDetail: ClientDetail = {
      id: 'client-456',
      firstName: 'John',
      lastName: 'Smith',
      status: 'interviewing',
      serviceNeeded: 'Postpartum support',
    };

    const displayLabel = CLIENT_STATUS_LABELS[mockClientDetail.status];
    expect(displayLabel).toBe('Interviewed');
  });

  it('status dropdown options show "Interviewed" instead of "Interviewing"', () => {
    // Simulate dropdown options generation
    const statusOptions = CLIENT_STATUSES.map(status => ({
      value: status,
      label: CLIENT_STATUS_LABELS[status],
    }));

    const interviewingOption = statusOptions.find(opt => opt.value === 'interviewing');
    expect(interviewingOption).toBeDefined();
    expect(interviewingOption?.label).toBe('Interviewed');
    
    // Ensure no option shows "Interviewing"
    const hasInterviewingLabel = statusOptions.some(opt => opt.label === 'Interviewing');
    expect(hasInterviewingLabel).toBe(false);
  });

  it('filter components display "Interviewed" option', () => {
    // Simulate filter generation for status filtering
    const filterOptions = Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    }));

    const interviewedFilter = filterOptions.find(opt => opt.value === 'interviewing');
    expect(interviewedFilter?.label).toBe('Interviewed');
    
    // No filter should show old "Interviewing" text
    const hasOldLabel = filterOptions.some(opt => opt.label === 'Interviewing');
    expect(hasOldLabel).toBe(false);
  });

  it('status badge components show "Interviewed" text', () => {
    const status: ClientStatus = 'interviewing';
    const badgeText = CLIENT_STATUS_LABELS[status];
    
    expect(badgeText).toBe('Interviewed');
    expect(badgeText).not.toBe('Interviewing');
  });
});

describe('Ticket 3 — Client status "Interviewed": Data consistency', () => {
  it('maintains backward compatibility with existing data', () => {
    // Existing records should still work with 'interviewing' value
    const existingClientData = {
      id: 'legacy-client-789',
      status: 'interviewing' as ClientStatus,
      // ... other fields
    };

    // Should be valid ClientStatus
    expect(CLIENT_STATUSES.includes(existingClientData.status)).toBe(true);
    
    // Should display correctly
    const label = CLIENT_STATUS_LABELS[existingClientData.status];
    expect(label).toBe('Interviewed');
  });

  it('supports type-safe status assignment', () => {
    // TypeScript should accept 'interviewing' as valid ClientStatus
    const validStatuses: ClientStatus[] = [
      'lead',
      'contacted', 
      'matched',
      'interviewing', // This should compile without errors
      'follow up',
      'contract',
      'active',
      'complete',
      'not hired',
    ];

    expect(validStatuses).toContain('interviewing');
  });

  it('ensures label consistency across different contexts', () => {
    const status = 'interviewing';
    
    // All these contexts should show the same label
    const tableLabel = CLIENT_STATUS_LABELS[status];
    const dropdownLabel = CLIENT_STATUS_LABELS[status];
    const badgeLabel = CLIENT_STATUS_LABELS[status];
    const filterLabel = CLIENT_STATUS_LABELS[status];
    
    expect(tableLabel).toBe('Interviewed');
    expect(dropdownLabel).toBe('Interviewed');
    expect(badgeLabel).toBe('Interviewed');
    expect(filterLabel).toBe('Interviewed');
  });

  it('prevents accidental creation of "interviewed" status (typo protection)', () => {
    // Make sure the enum doesn't include both "interviewing" and "interviewed"
    const hasInterviewed = CLIENT_STATUSES.includes('interviewed' as ClientStatus);
    const hasInterviewing = CLIENT_STATUSES.includes('interviewing');
    
    expect(hasInterviewed).toBe(false);
    expect(hasInterviewing).toBe(true);
  });
});

describe('Ticket 3 — Client status "Interviewed": Pipeline integration', () => {
  it('works correctly in pipeline/kanban views', () => {
    // Pipeline components should group clients by status correctly
    const mockClients: ClientLite[] = [
      {
        id: 'client-1',
        firstname: 'Alice',
        lastname: 'Johnson', 
        status: 'interviewing',
        serviceNeeded: 'Birth support',
        requestedAt: new Date(),
        updatedAt: new Date(),
        profilePicture: null,
      },
      {
        id: 'client-2',
        firstname: 'Bob',
        lastname: 'Wilson',
        status: 'matched',
        serviceNeeded: 'Postpartum care',
        requestedAt: new Date(),
        updatedAt: new Date(),
        profilePicture: null,
      }
    ];

    // Group by status for pipeline columns
    const pipelineGroups = mockClients.reduce((acc, client) => {
      const statusLabel = CLIENT_STATUS_LABELS[client.status];
      if (!acc[statusLabel]) {
        acc[statusLabel] = [];
      }
      acc[statusLabel].push(client);
      return acc;
    }, {} as Record<string, ClientLite[]>);

    expect(pipelineGroups['Interviewed']).toBeDefined();
    expect(pipelineGroups['Interviewed']).toHaveLength(1);
    expect(pipelineGroups['Interviewed'][0].id).toBe('client-1');
    
    // Should not create a group called "Interviewing"
    expect(pipelineGroups['Interviewing']).toBeUndefined();
  });

  it('supports status transitions to and from "interviewing"', () => {
    const statusTransitions = {
      from_matched: 'interviewing',
      from_interviewing: 'follow up',
    };

    // Verify both directions work with the status system
    expect(CLIENT_STATUSES).toContain(statusTransitions.from_matched);
    expect(CLIENT_STATUSES).toContain(statusTransitions.from_interviewing);
    
    // Labels should be correct for both
    expect(CLIENT_STATUS_LABELS[statusTransitions.from_matched as ClientStatus]).toBe('Interviewed');
    expect(CLIENT_STATUS_LABELS[statusTransitions.from_interviewing as ClientStatus]).toBe('Follow Up');
  });
});