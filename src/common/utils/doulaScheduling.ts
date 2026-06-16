import { format, isValid, parseISO } from 'date-fns';

type AnyRecord = Record<string, unknown>;

export type DoulaAvailabilityStatus = 'available' | 'unavailable' | 'unknown';

export interface DoulaSchedulingInfo {
  schedulingUrl: string | null;
  availabilityStatus: DoulaAvailabilityStatus;
  availabilityLabel: string;
  availabilityMessage: string | null;
  unavailableFrom: string | null;
  unavailableUntil: string | null;
}

function asRecord(input: unknown): AnyRecord {
  return typeof input === 'object' && input !== null
    ? (input as AnyRecord)
    : {};
}

function getNestedCandidates(input: unknown): AnyRecord[] {
  const root = asRecord(input);
  const doula = asRecord(root.doula);
  const user = asRecord(root.user);
  const profile = asRecord(root.profile);
  return [root, doula, user, profile];
}

function getFirstString(candidates: AnyRecord[], keys: string[]): string {
  for (const candidate of candidates) {
    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return '';
}

function getFirstBoolean(
  candidates: AnyRecord[],
  keys: string[]
): boolean | null {
  for (const candidate of candidates) {
    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
      }
      if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
      }
    }
  }
  return null;
}

function normalizeAvailabilityStatus(value: string): DoulaAvailabilityStatus {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'unknown';
  if (
    normalized.includes('unavailable') ||
    normalized.includes('vacation') ||
    normalized.includes('leave') ||
    normalized.includes('away') ||
    normalized.includes('sick') ||
    normalized.includes('inactive')
  ) {
    return 'unavailable';
  }
  if (
    normalized.includes('available') ||
    normalized.includes('active') ||
    normalized.includes('open')
  ) {
    return 'available';
  }
  return 'unknown';
}

function formatAvailabilityDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;
  return format(parsed, 'MMM d, yyyy');
}

export function getDoulaSchedulingInfo(input: unknown): DoulaSchedulingInfo {
  const candidates = getNestedCandidates(input);
  const schedulingUrl =
    getFirstString(candidates, [
      'scheduling_url',
      'schedulingUrl',
      'calendar_url',
      'calendarUrl',
      'booking_url',
      'bookingUrl',
      'calendly_url',
      'calendlyUrl',
    ]) || null;

  const explicitBoolean = getFirstBoolean(candidates, [
    'is_available',
    'isAvailable',
    'available',
  ]);
  const explicitStatus = getFirstString(candidates, [
    'availability_status',
    'availabilityStatus',
    'current_availability',
    'currentAvailability',
    'status_label',
  ]);
  const unavailableFrom =
    getFirstString(candidates, [
      'unavailable_from',
      'unavailableFrom',
      'time_away_start',
      'timeAwayStart',
      'availability_start',
      'availabilityStart',
    ]) || null;
  const unavailableUntil =
    getFirstString(candidates, [
      'unavailable_until',
      'unavailableUntil',
      'time_away_end',
      'timeAwayEnd',
      'availability_end',
      'availabilityEnd',
    ]) || null;
  const explicitMessage =
    getFirstString(candidates, [
      'availability_message',
      'availabilityMessage',
      'unavailability_reason',
      'unavailabilityReason',
      'time_away_reason',
      'timeAwayReason',
      'availability_note',
      'availabilityNote',
    ]) || null;

  let availabilityStatus: DoulaAvailabilityStatus = 'unknown';
  if (explicitBoolean === true) availabilityStatus = 'available';
  if (explicitBoolean === false) availabilityStatus = 'unavailable';
  if (availabilityStatus === 'unknown' && explicitStatus) {
    availabilityStatus = normalizeAvailabilityStatus(explicitStatus);
  }

  const fromLabel = formatAvailabilityDate(unavailableFrom);
  const untilLabel = formatAvailabilityDate(unavailableUntil);

  let availabilityMessage = explicitMessage;
  if (!availabilityMessage && availabilityStatus === 'unavailable') {
    if (fromLabel && untilLabel) {
      availabilityMessage = `Unavailable from ${fromLabel} to ${untilLabel}.`;
    } else if (untilLabel) {
      availabilityMessage = `Unavailable until ${untilLabel}.`;
    } else if (fromLabel) {
      availabilityMessage = `Unavailable starting ${fromLabel}.`;
    } else {
      availabilityMessage = 'This doula is currently unavailable.';
    }
  }

  return {
    schedulingUrl,
    availabilityStatus,
    availabilityLabel:
      availabilityStatus === 'available'
        ? 'Available'
        : availabilityStatus === 'unavailable'
          ? 'Unavailable'
          : 'Availability unknown',
    availabilityMessage,
    unavailableFrom,
    unavailableUntil,
  };
}

export function canClientViewDoulaScheduling(input: unknown): boolean {
  const candidates = getNestedCandidates(input);
  const hasSignedContract = getFirstBoolean(candidates, [
    'has_signed_contract',
    'hasSignedContract',
  ]);
  if (hasSignedContract === true) return true;

  const contractStatus = getFirstString(candidates, [
    'contract_status',
    'contractStatus',
  ]).toLowerCase();
  if (
    ['contract', 'pending', 'not_sent', 'sent', 'signed', 'active'].includes(
      contractStatus
    )
  ) {
    return true;
  }

  const clientStatus = getFirstString(candidates, ['status']).toLowerCase();
  return clientStatus === 'contract';
}
