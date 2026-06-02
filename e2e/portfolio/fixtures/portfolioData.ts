/**
 * Rich fixture payloads for portfolio-quality CRM screenshots.
 * Values are fictional but realistic for case-study decks.
 */

export const PORTFOLIO_ADMIN = {
  id: 'admin-portfolio',
  firstname: 'Nancy',
  lastname: 'Cowans',
  email: 'admin@sokana-collective.test',
  role: 'admin',
} as const;

export const PORTFOLIO_CLIENT_ID = 'client-portfolio-001';

export const PORTFOLIO_CLIENT_LIST = [
  {
    id: PORTFOLIO_CLIENT_ID,
    first_name: 'Jordan',
    last_name: 'Rivera',
    email: 'jordan.rivera@example.com',
    phone_number: '+1 (312) 555-0142',
    status: 'matched',
    service_needed: 'Labor Support, Postpartum Support',
    requested_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-05-20T09:30:00Z',
    matched_at: '2026-02-01T10:00:00Z',
    qbo_customer_id: 'QB-88421',
    contractStatus: 'signed',
    hasSignedContract: true,
  },
  {
    id: 'client-portfolio-002',
    first_name: 'Avery',
    last_name: 'Chen',
    email: 'avery.chen@example.com',
    phone_number: '+1 (773) 555-0198',
    status: 'lead',
    service_needed: 'Labor Support',
    requested_at: '2026-05-18T11:00:00Z',
    updated_at: '2026-05-22T16:45:00Z',
  },
  {
    id: 'client-portfolio-003',
    first_name: 'Sam',
    last_name: 'Okonkwo',
    email: 'sam.okonkwo@example.com',
    phone_number: '+1 (708) 555-0133',
    status: 'contract',
    service_needed: 'Postpartum Support',
    requested_at: '2026-04-02T08:00:00Z',
    updated_at: '2026-05-21T12:00:00Z',
    contractStatus: 'pending',
  },
];

export const PORTFOLIO_CLIENT_DETAIL = {
  id: PORTFOLIO_CLIENT_ID,
  first_name: 'Jordan',
  last_name: 'Rivera',
  preferred_name: 'Jordy',
  email: 'jordan.rivera@example.com',
  phone_number: '+1 (312) 555-0142',
  pronouns: 'She/Her',
  age: '32',
  status: 'matched',
  service_needed: 'Labor Support, Postpartum Support',
  services_interested: ['Labor Support', 'Postpartum Support'],
  service_support_details:
    'Hospital birth with midwife team; interested in overnight postpartum for first two weeks.',
  address: '742 Evergreen Terrace',
  city: 'Chicago',
  state: 'IL',
  zip_code: '60614',
  home_type: ['Rent, apartment or house'],
  pets: 'One cat (friendly)',
  referral_source: 'Doula referral network',
  health_history: 'Gestational diabetes managed with diet',
  allergies: 'Penicillin',
  due_date: '2026-08-15',
  birth_location: 'Hospital',
  birth_hospital: 'Northwestern Memorial Hospital',
  provider_type: 'Midwife',
  payment_method: 'Private/Commercial Insurance',
  insurance_provider: 'Blue Cross Blue Shield',
  insurance_member_id: 'BCBS-442981',
  race_ethnicity: 'Black/African American',
  primary_language: 'English',
  demographics_annual_income: '$45,000-$64,999',
  admin_notes: 'VIP referral — coordinate backup doula coverage.',
  created_at: '2026-01-10T14:00:00Z',
  updated_at: '2026-05-20T09:30:00Z',
};

export const DASHBOARD_STATS = {
  totalDoulas: 55,
  totalClients: 422,
  pendingContracts: 18,
  overdueNotes: 7,
  upcomingTasks: 31,
  monthlyRevenue: 128_450,
};

export const CALENDAR_EVENTS = [
  {
    id: 'cal-1',
    clientId: PORTFOLIO_CLIENT_ID,
    clientName: 'Jordan Rivera',
    dueDate: '2026-08-15',
    serviceType: 'Labor Support',
  },
  {
    id: 'cal-2',
    clientId: 'client-portfolio-002',
    clientName: 'Avery Chen',
    dueDate: '2026-06-28',
    serviceType: 'Labor Support',
  },
];

export const DOULA_DIRECTORY = [
  {
    id: 'doula-1',
    first_name: 'Dana',
    last_name: 'Morrison',
    email: 'dana.morrison@sokana.test',
    phone: '+1 (312) 555-0101',
    assignment_count: 14,
    status: 'active',
  },
  {
    id: 'doula-2',
    first_name: 'Priya',
    last_name: 'Nair',
    email: 'priya.nair@sokana.test',
    phone: '+1 (773) 555-0102',
    assignment_count: 11,
    status: 'active',
  },
];

export const DOULA_ASSIGNMENTS = [
  {
    id: 'assign-1',
    clientId: PORTFOLIO_CLIENT_ID,
    clientFirstName: 'Jordan',
    clientLastName: 'Rivera',
    clientEmail: 'jordan.rivera@example.com',
    clientPhone: '+1 (312) 555-0142',
    doulaId: 'doula-1',
    doulaFirstName: 'Dana',
    doulaLastName: 'Morrison',
    services: ['Labor Support', 'Postpartum Support'],
    role: 'primary',
    hospital: 'Northwestern Memorial Hospital',
    assignedAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-20T00:00:00Z',
    edd: '2026-08-15',
    birth_outcomes_induction: false,
    birth_outcomes_delivery_type: 'Vaginal (unmedicated)',
    birth_outcomes_medications_used: ['Nitrous oxide'],
  },
  {
    id: 'assign-2',
    clientId: 'client-portfolio-002',
    clientFirstName: 'Avery',
    clientLastName: 'Chen',
    clientEmail: 'avery.chen@example.com',
    clientPhone: '+1 (773) 555-0198',
    doulaId: 'doula-2',
    doulaFirstName: 'Priya',
    doulaLastName: 'Nair',
    services: ['Labor Support'],
    role: 'backup',
    hospital: 'Advocate Illinois Masonic',
    assignedAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    edd: '2026-06-28',
  },
];

export const PAYMENTS = [
  {
    id: 'pay-1',
    client_name: 'Jordan Rivera',
    customer_name: 'Jordan Rivera',
    amount: 2400,
    status: 'succeeded',
    payment_type: 'stripe',
    category: 'deposit',
    created_at: '2026-04-10T12:00:00Z',
  },
  {
    id: 'pay-2',
    client_name: 'Avery Chen',
    customer_name: 'Avery Chen',
    amount: 850,
    status: 'pending',
    payment_type: 'quickbooks',
    category: 'installment',
    created_at: '2026-05-01T09:00:00Z',
  },
];

export const RECONCILIATION_ROWS = [
  {
    invoice_id: 'inv-1001',
    invoice_number: 'INV-1001',
    invoice_customer: 'Jordan Rivera',
    invoice_amount: 2400,
    invoice_status: 'paid',
    invoice_status_raw: 'PAID',
    invoice_created_at: '2026-04-01T00:00:00Z',
    invoice_due_date: '2026-04-15T00:00:00Z',
    match_type: 'amount_and_customer',
    payment_ids: ['pay-1'],
    payment_customers: ['Jordan Rivera'],
    payment_amounts: [2400],
    payment_created_dates: ['2026-04-10T12:00:00Z'],
  },
  {
    invoice_id: 'inv-1002',
    invoice_number: 'INV-1002',
    invoice_customer: 'Avery Chen',
    invoice_amount: 850,
    invoice_status: 'pending',
    invoice_status_raw: 'PENDING',
    invoice_created_at: '2026-05-01T00:00:00Z',
    invoice_due_date: '2026-05-20T00:00:00Z',
    match_type: 'amount_only',
    payment_ids: ['pay-2'],
    payment_customers: ['Avery Chen'],
    payment_amounts: [850],
    payment_created_dates: ['2026-05-01T09:00:00Z'],
  },
];

export const INVOICES = [
  {
    id: 'inv-1001',
    doc_number: 'INV-1001',
    customer_name: 'Jordan Rivera',
    customer_email: 'jordan.rivera@example.com',
    status: 'paid',
    created_at: '2026-04-01T00:00:00Z',
    due_date: '2026-04-15T00:00:00Z',
    total_amount: 2400,
    balance: 0,
    line_items: [],
    memo: 'Labor support package',
  },
  {
    id: 'inv-1002',
    doc_number: 'INV-1002',
    customer_name: 'Avery Chen',
    customer_email: 'avery.chen@example.com',
    status: 'pending',
    created_at: '2026-05-01T00:00:00Z',
    due_date: '2026-05-20T00:00:00Z',
    total_amount: 850,
    balance: 850,
    line_items: [],
    memo: 'Postpartum retainer',
  },
];

export const TEAM_MEMBERS = [
  {
    id: 'team-1',
    firstname: 'Nancy',
    lastname: 'Cowans',
    email: 'nancy@sokana.test',
    role: 'admin',
  },
  {
    id: 'team-2',
    firstname: 'Dana',
    lastname: 'Morrison',
    email: 'dana.morrison@sokana.test',
    role: 'doula',
  },
];

export const QUICKBOOKS_CUSTOMERS = [
  {
    Id: 'qb-1',
    DisplayName: 'Jordan Rivera',
    PrimaryEmailAddr: { Address: 'jordan.rivera@example.com' },
    PrimaryPhone: { FreeFormNumber: '+1 (312) 555-0142' },
    Balance: 0,
    Active: true,
  },
  {
    Id: 'qb-2',
    DisplayName: 'Sokana Collective LLC',
    PrimaryEmailAddr: { Address: 'billing@sokana.test' },
    Balance: 1200,
    Active: true,
  },
];
