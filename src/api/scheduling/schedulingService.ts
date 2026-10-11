import { buildUrl, fetchWithAuth } from '@/api/http';
import { logHttpFailure } from '@/utils/safeLog';

export const SCHEDULING_VISIT_MINUTES = 60;
export const SCHEDULING_MAX_RANGE_DAYS = 14;

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface SchedulingSlot {
  startAt: string;
  endAt: string;
}

export interface SchedulingBooking {
  id: string;
  clientId: string;
  doulaId: string;
  requestedBy: string | null;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  doulaName: string | null;
  clientNumber: string | null;
  clientFirstName: string | null;
}

export interface AdminAvailabilityRecord {
  id: string;
  doulaId: string;
  startAt: string;
  endAt: string;
  availabilityStatus: 'available' | 'unavailable';
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  doulaId: string;
  startAt: string;
  endAt: string;
  notes?: string;
  clientId?: string;
}

export interface ListBookingsQuery {
  from?: string;
  to?: string;
  doulaId?: string;
  clientId?: string;
  status?: BookingStatus | '';
}

export class SchedulingApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'SchedulingApiError';
  }
}

const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function firstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function firstNullableString(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}

export function unwrapSchedulingPayload(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  const root = asRecord(raw);
  const nested = root.data;
  if (Array.isArray(nested)) return nested;
  if (nested && typeof nested === 'object') {
    const nestedRecord = asRecord(nested);
    for (const key of ['slots', 'bookings', 'records', 'items']) {
      if (Array.isArray(nestedRecord[key])) return nestedRecord[key];
    }
    return nested;
  }
  for (const key of ['slots', 'bookings', 'records', 'items']) {
    if (Array.isArray(root[key])) return root[key];
  }
  return raw;
}

export function unwrapSchedulingList(raw: unknown): unknown[] {
  const payload = unwrapSchedulingPayload(raw);
  return Array.isArray(payload) ? payload : [];
}

export function normalizeBookingStatus(value: unknown): BookingStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (normalized === 'declined') return 'rejected';
  if (BOOKING_STATUSES.includes(normalized as BookingStatus)) {
    return normalized as BookingStatus;
  }
  return 'pending';
}

export function mapSchedulingSlot(input: unknown): SchedulingSlot | null {
  const record = asRecord(input);
  const startAt = firstString(record, ['startAt', 'start_at', 'start']);
  const endAt = firstString(record, ['endAt', 'end_at', 'end']);
  if (!startAt || !endAt) return null;
  return { startAt, endAt };
}

export function mapSchedulingBooking(input: unknown): SchedulingBooking {
  const record = asRecord(input);
  const nestedDoula = asRecord(record.doula);
  const nestedClient = asRecord(record.client);
  return {
    id: firstString(record, ['id', 'bookingId', 'booking_id']),
    clientId: firstString(record, ['clientId', 'client_id']),
    doulaId: firstString(record, ['doulaId', 'doula_id']),
    requestedBy: firstNullableString(record, ['requestedBy', 'requested_by']),
    startAt: firstString(record, ['startAt', 'start_at']),
    endAt: firstString(record, ['endAt', 'end_at']),
    status: normalizeBookingStatus(record.status),
    notes: firstNullableString(record, ['notes', 'note']),
    createdAt: firstString(record, ['createdAt', 'created_at']),
    updatedAt: firstString(record, ['updatedAt', 'updated_at']),
    doulaName:
      firstNullableString(record, [
        'doulaName',
        'doula_name',
        'doulaFullName',
        'doula_full_name',
      ]) ||
      [nestedDoula.firstname, nestedDoula.lastname]
        .filter((part) => typeof part === 'string' && part.trim())
        .join(' ')
        .trim() ||
      null,
    clientNumber: firstNullableString(record, [
      'clientNumber',
      'client_number',
      'clientNo',
    ]),
    clientFirstName:
      firstNullableString(record, [
        'clientFirstName',
        'client_first_name',
        'clientFirstname',
      ]) ||
      (typeof nestedClient.firstname === 'string'
        ? nestedClient.firstname
        : null),
  };
}

export function mapAdminAvailabilityRecord(
  input: unknown
): AdminAvailabilityRecord {
  const record = asRecord(input);
  return {
    id: firstString(record, ['id']),
    doulaId: firstString(record, ['doulaId', 'doula_id']),
    startAt: firstString(record, ['startAt', 'start_at']),
    endAt: firstString(record, ['endAt', 'end_at']),
    availabilityStatus:
      String(
        record.availabilityStatus ?? record.availability_status ?? 'available'
      ).toLowerCase() === 'unavailable'
        ? 'unavailable'
        : 'available',
    reason: firstNullableString(record, ['reason']),
    createdAt: firstString(record, ['createdAt', 'created_at']),
    updatedAt: firstString(record, ['updatedAt', 'updated_at']),
  };
}

function parseErrorBody(raw: unknown): { message: string; code?: string } {
  if (typeof raw === 'string' && raw.trim()) {
    return { message: raw.trim() };
  }
  const record = asRecord(raw);
  const nested = asRecord(record.error);
  const message =
    firstString(record, ['error', 'message']) ||
    firstString(nested, ['message', 'error']) ||
    'Scheduling request failed';
  const code =
    firstString(record, ['code', 'errorCode', 'error_code']) ||
    firstString(nested, ['code']) ||
    undefined;
  return { message, code };
}

export function isContractStageError(error: unknown): boolean {
  if (!(error instanceof SchedulingApiError)) return false;
  const code = (error.code || '').toUpperCase();
  const message = error.message.toLowerCase();
  return (
    code.includes('CONTRACT') ||
    message.includes('contract stage') ||
    message.includes('not in contract') ||
    message.includes('reach the contract')
  );
}

export function isSchedulingConflictError(error: unknown): boolean {
  if (!(error instanceof SchedulingApiError)) return false;
  if (error.status === 409) return true;
  const code = (error.code || '').toUpperCase();
  return (
    code === 'OVERLAP' ||
    code === 'BLACKOUT' ||
    code === 'CONFLICT' ||
    code === 'OUTSIDE_WINDOW'
  );
}

export function conflictMessage(error: unknown): string {
  if (isSchedulingConflictError(error)) {
    const code = error instanceof SchedulingApiError ? error.code : undefined;
    if (code === 'BLACKOUT') {
      return 'That time overlaps a blackout. Please pick another slot.';
    }
    if (code === 'OUTSIDE_WINDOW') {
      return "That time is outside the doula's posted availability. Please pick another slot.";
    }
    return 'That time is no longer available. It may overlap another visit. Please pick a different slot.';
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Unable to complete that scheduling request.';
}

async function requestJson(
  path: string,
  init: {
    method: string;
    headers?: Record<string, string>;
    body?: string;
  },
  options?: { emptyOn404?: boolean }
): Promise<unknown> {
  const response = await fetchWithAuth(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (options?.emptyOn404 && response.status === 404) {
    return [];
  }

  const text = await response.text().catch(() => '');
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const { message, code } = parseErrorBody(parsed);
    logHttpFailure('scheduling-api', path, response.status);
    throw new SchedulingApiError(message, response.status, code);
  }

  return parsed;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export async function getClientSlots(
  doulaId: string,
  query: { from: string; to: string; durationMinutes?: number }
): Promise<SchedulingSlot[]> {
  const payload = await requestJson(
    `/api/scheduling/client/doulas/${encodeURIComponent(doulaId)}/slots${toQuery(
      {
        from: query.from,
        to: query.to,
        durationMinutes: query.durationMinutes ?? SCHEDULING_VISIT_MINUTES,
      }
    )}`,
    { method: 'GET' },
    { emptyOn404: true }
  );
  return unwrapSchedulingList(payload)
    .map(mapSchedulingSlot)
    .filter((slot): slot is SchedulingSlot => slot !== null);
}

export async function createClientBooking(
  input: CreateBookingInput
): Promise<SchedulingBooking> {
  const payload = await requestJson('/api/scheduling/client/bookings', {
    method: 'POST',
    body: JSON.stringify({
      doulaId: input.doulaId,
      startAt: input.startAt,
      endAt: input.endAt,
      ...(input.notes?.trim() ? { notes: input.notes.trim() } : {}),
      ...(input.clientId ? { clientId: input.clientId } : {}),
    }),
  });
  const unwrapped = unwrapSchedulingPayload(payload);
  const record = asRecord(unwrapped);
  const booking = record.booking ?? unwrapped;
  return mapSchedulingBooking(booking);
}

export async function getClientBookings(
  query: ListBookingsQuery = {}
): Promise<SchedulingBooking[]> {
  const payload = await requestJson(
    `/api/scheduling/client/bookings${toQuery({
      from: query.from,
      to: query.to,
      status: query.status,
    })}`,
    { method: 'GET' },
    { emptyOn404: true }
  );
  return unwrapSchedulingList(payload).map(mapSchedulingBooking);
}

export async function getDoulaBookings(
  query: ListBookingsQuery = {}
): Promise<SchedulingBooking[]> {
  const payload = await requestJson(
    `/api/scheduling/doula/bookings${toQuery({
      from: query.from,
      to: query.to,
      status: query.status,
    })}`,
    { method: 'GET' },
    { emptyOn404: true }
  );
  return unwrapSchedulingList(payload).map(mapSchedulingBooking);
}

export async function getAdminBookings(
  query: ListBookingsQuery = {}
): Promise<SchedulingBooking[]> {
  const payload = await requestJson(
    `/api/scheduling/admin/bookings${toQuery({
      from: query.from,
      to: query.to,
      doulaId: query.doulaId,
      clientId: query.clientId,
      status: query.status,
    })}`,
    { method: 'GET' },
    { emptyOn404: true }
  );
  return unwrapSchedulingList(payload).map(mapSchedulingBooking);
}

export async function patchBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<SchedulingBooking> {
  const payload = await requestJson(
    `/api/scheduling/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  );
  const unwrapped = unwrapSchedulingPayload(payload);
  const record = asRecord(unwrapped);
  return mapSchedulingBooking(record.booking ?? unwrapped);
}

export async function getAdminDoulaAvailability(
  doulaId: string
): Promise<AdminAvailabilityRecord[]> {
  const payload = await requestJson(
    `/api/scheduling/admin/doulas/${encodeURIComponent(doulaId)}/availability`,
    { method: 'GET' },
    { emptyOn404: true }
  );
  return unwrapSchedulingList(payload).map(mapAdminAvailabilityRecord);
}
