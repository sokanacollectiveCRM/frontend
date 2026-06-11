import {
  FileText,
  Home,
  Inbox,
  Clock3,
  LucideChartColumnIncreasing,
  LucideCreditCard,
  LucideLink,
  MessagesSquare,
  LucideUsers,
  Search,
  User,
  UserPlus,
  Scale,
} from 'lucide-react';
import React from 'react';

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  doulaOnly?: boolean;
  clientOnly?: boolean;
  billingOnly?: boolean;
  billingAccess?: boolean;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export const sidebarSections = [
  {
    label: 'General',
    items: [
      { title: 'Dashboard', url: '/', icon: Home },
      { title: 'Inbox', url: '/inbox', icon: Inbox, clientOnly: false },
      { title: 'Leads', url: '/clients', icon: Search, adminOnly: true },
      { title: 'Customers', url: '/clients/new', icon: UserPlus, adminOnly: true },
    ],
  },
  {
    label: 'Billing',
    items: [
      {
        title: 'Payment Schedules',
        url: '/billing/payment-schedules',
        icon: LucideCreditCard,
        billingAccess: true,
      },
      {
        title: 'Contracts',
        url: '/billing/contracts',
        icon: FileText,
        billingAccess: true,
      },
    ],
  },
  {
    label: 'Client Portal',
    items: [
      { title: 'Profile Information', url: '/profile', icon: User, clientOnly: true },
      {
        title: 'Billing Information',
        url: '/billing',
        icon: LucideCreditCard,
        clientOnly: true,
      },
    ],
  },
  {
    label: 'Manage',
    items: [
      { title: 'Team', url: '/team', icon: LucideUsers, adminOnly: true },
      { title: 'Doulas', url: '/hours', icon: LucideUsers, adminOnly: true },
      {
        title: 'Payments',
        url: '/payments',
        icon: LucideCreditCard,
        adminOnly: true,
      },
      {
        title: 'Reconciliation',
        url: '/payments/reconciliation',
        icon: Scale,
        adminOnly: true,
      },
      { title: 'Invoices', url: '/invoices', icon: FileText, adminOnly: true },
    ],
  },
  {
    label: 'Doula Dashboard',
    items: [
      {
        title: 'Profile',
        url: '/doula-dashboard/profile',
        icon: User,
        doulaOnly: true,
      },
      {
        title: 'Documents',
        url: '/doula-dashboard/documents',
        icon: FileText,
        doulaOnly: true,
      },
      {
        title: 'Clients',
        url: '/doula-dashboard/clients',
        icon: LucideUsers,
        doulaOnly: true,
      },
      {
        title: 'Hours',
        url: '/doula-dashboard/hours',
        icon: Clock3,
        doulaOnly: true,
      },
      {
        title: 'Activities',
        url: '/doula-dashboard/activities',
        icon: MessagesSquare,
        doulaOnly: true,
      },
    ],
  },
  {
    label: 'Integrations', // ⬅️  NEW SECTION
    items: [
      {
        title: 'QuickBooks',
        url: '/integrations/quickbooks',
        icon: LucideLink,
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { title: 'Demographics', url: '/demographics', icon: LucideChartColumnIncreasing, adminOnly: true },
    ],
  },
];

export function getVisibleSidebarSections({
  isAdmin,
  isDoula,
  isClient,
  isBillingOnly,
}: {
  isAdmin: boolean;
  isDoula: boolean;
  isClient: boolean;
  isBillingOnly: boolean;
}): SidebarSection[] {
  return sidebarSections
    .map((section) => {
      const filteredItems = section.items.filter((item: SidebarItem) => {
        if (item.billingAccess === true) {
          return isAdmin || isBillingOnly;
        }
        if (item.billingOnly === true) {
          return isBillingOnly;
        }
        if (isBillingOnly) {
          return false;
        }
        if (item.clientOnly === true) {
          return isClient;
        }
        if (item.adminOnly === true) {
          return isAdmin && !isClient;
        }
        if (item.doulaOnly === true) {
          return isDoula && !isClient;
        }
        if (item.adminOnly === false) {
          return !isAdmin && !isClient;
        }
        if (
          item.title === 'Invoices' ||
          item.title === 'Customers' ||
          item.title === 'Leads'
        ) {
          return isAdmin && !isClient;
        }
        return !isClient;
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0)
    .filter((section) => {
      if (isBillingOnly) {
        return section.label === 'Billing';
      }
      return section.label !== 'Integrations' || isAdmin;
    });
}
