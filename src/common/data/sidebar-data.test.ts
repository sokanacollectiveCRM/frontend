import { getVisibleSidebarSections } from '@/common/data/sidebar-data';
import { describe, expect, it } from 'vitest';

function flattenTitles(labels: ReturnType<typeof getVisibleSidebarSections>): string[] {
  return labels.flatMap((section) => section.items.map((item) => item.title));
}

describe('getVisibleSidebarSections', () => {
  it('shows minimal billing navigation for billing-only users', () => {
    const sections = getVisibleSidebarSections({
      isAdmin: false,
      isDoula: false,
      isClient: false,
      isBillingOnly: true,
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]?.label).toBe('Billing');
    expect(flattenTitles(sections)).toEqual(['Payment Schedules', 'Contracts']);
  });

  it('keeps admin CRM navigation intact', () => {
    const titles = flattenTitles(
      getVisibleSidebarSections({
        isAdmin: true,
        isDoula: false,
        isClient: false,
        isBillingOnly: false,
      })
    );

    expect(titles).toContain('Dashboard');
    expect(titles).toContain('Leads');
    expect(titles).toContain('Customers');
    expect(titles).toContain('Team');
    expect(titles).toContain('Doulas');
    expect(titles).toContain('Payments');
    expect(titles).toContain('Invoices');
    expect(titles).toContain('Demographics');
    expect(titles).toContain('Payment Schedules');
    expect(titles).toContain('Contracts');
  });
});
