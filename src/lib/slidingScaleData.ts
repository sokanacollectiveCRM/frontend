/**
 * Sokana Collective sliding scale tiers (self-pay), aligned with public fee structure.
 * @see https://www.sokanacollective.com/services
 */

export const SELF_PAY_SLIDING_SUPPORT_TYPES = [
  'Labor support',
  'Postpartum support',
  'Both',
] as const;

export type SelfPaySlidingSupportType = (typeof SELF_PAY_SLIDING_SUPPORT_TYPES)[number];

export type SlidingScaleTierRow = {
  /** Stable id for form state / APIs */
  id: string;
  /** Household income bracket label shown to clients */
  incomeLabel: string;
  laborRate: string;
  postpartumRate: string;
};

export const SLIDING_SCALE_TIER_ROWS: SlidingScaleTierRow[] = [
  {
    id: '0-24999',
    incomeLabel: '$0 – $24,999',
    laborRate: '$150',
    postpartumRate: '$150 for up to 30 hours of care',
  },
  {
    id: '25000-44999',
    incomeLabel: '$25,000 – $44,999',
    laborRate: '$300',
    postpartumRate: '$12/hr daytime · $15/hr overnight',
  },
  {
    id: '45000-64999',
    incomeLabel: '$45,000 – $64,999',
    laborRate: '$700',
    postpartumRate: '$17/hr daytime · $20/hr overnight',
  },
  {
    id: '65000-84999',
    incomeLabel: '$65,000 – $84,999',
    laborRate: '$1,000',
    postpartumRate: '$27/hr daytime · $30/hr overnight',
  },
  {
    id: '85000-99999',
    incomeLabel: '$85,000 – $99,999',
    laborRate: '$1,350',
    postpartumRate: '$34/hr daytime · $37/hr overnight',
  },
  {
    id: '100000-plus',
    incomeLabel: '$100,000 and above',
    laborRate: '$1,500',
    postpartumRate: '$37/hr daytime · $40/hr overnight',
  },
];
