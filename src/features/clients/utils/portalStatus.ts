// TODO: Replace mock portal_status derivation with backend fields
// TODO: Remove temporary eligibility mapping function

import type { User, PortalStatus } from '../data/schema';

/**
 * Temporary helper function to derive portal status from lead data.
 * This will be replaced with actual backend fields once API is ready.
 */
export function derivePortalStatus(lead: User): PortalStatus {
  // If portal_status is already set (from backend or previous UI action), use it
  if ((lead as any).portal_status) {
    return (lead as any).portal_status;
  }

  // Temporary mapping for demo/testing purposes
  const email = lead.email?.toLowerCase() || '';
  const name = `${lead.firstname || ''} ${lead.lastname || ''}`.trim();
  const status = lead.status?.toLowerCase() || '';

  // Check if email includes "hello@" for easy demo
  if (email.includes('hello@')) {
    return 'invited';
  }

  // Check if name is not an email format (e.g., "Nancy Cowans")
  // This is a simple heuristic - if it doesn't contain @, it's likely a name
  if (name && !name.includes('@') && name.length > 2) {
    return 'active';
  }

  // Map based on status
  if (status === 'lead') {
    return 'not_eligible';
  }

  if (status === 'matching') {
    return 'eligible';
  }

  // Default to not_eligible
  return 'not_eligible';
}

