import type { Page } from '@playwright/test';
import { defaultCorsHeaders } from '../fixtures/httpStubs';

export const JORDAN_CLIENT_ID = '1d981375-beeb-46e7-bf22-5d7a750eb391';

export type PortalReadinessOverrides = Record<string, unknown>;

const JORDAN_BASE: Record<string, unknown> = {
  id: JORDAN_CLIENT_ID,
  first_name: 'Jordan',
  last_name: 'Bony',
  email: 'jbony@icstars.org',
  status: 'matched',
  portal_status: 'not_invited',
  payment_method: 'Medicaid',
  qbo_customer_id: '90',
  service_needed: 'Labor Support',
  requested_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

/** Base Jordan fixture merged with portal readiness fields per matrix scenario. */
export function buildJordanClient(overrides: PortalReadinessOverrides = {}) {
  return { ...JORDAN_BASE, ...overrides };
}

export const SCENARIOS = {
  selfPayMissingCard: buildJordanClient({
    billing_path: 'self_pay',
    is_eligible: false,
    portal_blockers: ['missing_card_on_file'],
    primary_portal_blocker: 'missing_card_on_file',
    payment_authorization_required: true,
    payment_authorization_satisfied: false,
    card_on_file: false,
    contract_signed: true,
    deposit_paid: true,
    allowed_actions: {
      can_invite_to_portal: false,
      can_send_verification_invoice: true,
      can_mark_contract_signed: false,
      can_mark_deposit_paid: false,
    },
  }),
  selfPayEligibleWithCard: buildJordanClient({
    billing_path: 'self_pay',
    is_eligible: true,
    portal_blockers: [],
    primary_portal_blocker: null,
    card_on_file: true,
    allowed_actions: {
      can_invite_to_portal: true,
      can_send_verification_invoice: false,
      can_mark_contract_signed: false,
      can_mark_deposit_paid: false,
    },
  }),
  medicaidEligibleNoCard: buildJordanClient({
    billing_path: 'medicaid',
    is_eligible: true,
    portal_blockers: [],
    primary_portal_blocker: null,
    card_on_file: false,
    allowed_actions: {
      can_invite_to_portal: true,
      can_send_verification_invoice: false,
      can_mark_contract_signed: false,
      can_mark_deposit_paid: false,
    },
  }),
  unsignedContract: buildJordanClient({
    billing_path: 'self_pay',
    is_eligible: false,
    portal_blockers: ['contract_unsigned', 'deposit_unpaid', 'missing_card_on_file'],
    primary_portal_blocker: 'contract_unsigned',
    card_on_file: false,
    contract_signed: false,
    deposit_paid: false,
    allowed_actions: {
      can_invite_to_portal: false,
      can_send_verification_invoice: false,
      can_mark_contract_signed: true,
      can_mark_deposit_paid: false,
    },
  }),
  billingPathUnknown: buildJordanClient({
    billing_path: 'unknown',
    is_eligible: false,
    portal_blockers: ['billing_path_unknown'],
    primary_portal_blocker: 'billing_path_unknown',
    card_on_file: true,
    contract_signed: true,
    deposit_paid: true,
    allowed_actions: {
      can_invite_to_portal: false,
      can_send_verification_invoice: false,
      can_mark_contract_signed: false,
      can_mark_deposit_paid: false,
    },
  }),
} as const;

type CorsHeaders = ReturnType<typeof defaultCorsHeaders>;

const BACKEND_ORIGIN = 'http://localhost:5050';

function apiEnvelope(data: unknown) {
  return JSON.stringify({
    success: true,
    data,
    meta: { count: Array.isArray(data) ? data.length : 1 },
  });
}

/** Stub GET /clients list (canonical ApiResponse wrapper). */
export async function stubClientsList(
  page: Page,
  clients: Record<string, unknown>[],
  headers: CorsHeaders = defaultCorsHeaders()
) {
  await page.route(`${BACKEND_ORIGIN}/clients`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: apiEnvelope(clients),
    });
  });
}

/** Stub GET /clients/:id for profile modal detail fetch. */
export async function stubClientDetail(
  page: Page,
  client: Record<string, unknown>,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const clientId = String(client.id);
  await page.route(`${BACKEND_ORIGIN}/clients/${clientId}`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: apiEnvelope(client),
    });
  });
}

/** Empty stubs for ancillary modal requests (documents, activities). */
export async function stubAuxiliaryClientRoutes(
  page: Page,
  clientId: string = JORDAN_CLIENT_ID,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  await page.route(`${BACKEND_ORIGIN}/api/clients/${clientId}/documents**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route(`${BACKEND_ORIGIN}/clients/${clientId}/activities**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route(`${BACKEND_ORIGIN}/api/clients/${clientId}/activities**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route(`${BACKEND_ORIGIN}/api/clients/${clientId}/activity**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

/** Register list + detail + ancillary stubs for a single Jordan scenario. */
export async function stubJordanScenario(
  page: Page,
  client: Record<string, unknown>,
  headers: CorsHeaders = defaultCorsHeaders()
) {
  const clientId = String(client.id ?? JORDAN_CLIENT_ID);
  await stubClientDetail(page, client, headers);
  await stubAuxiliaryClientRoutes(page, clientId, headers);
  await stubClientsList(page, [client], headers);
}
