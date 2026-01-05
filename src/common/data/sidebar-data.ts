import {
  FileText,
  Home,
  Inbox,
  LucideChartColumnIncreasing,
  LucideCircleDollarSign,
  LucideClock5,
  LucideCreditCard,
  LucideLink,
  LucideUsers,
  Search,
  UserPlus,
} from 'lucide-react';
import React from 'react';

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  doulaOnly?: boolean;
  clientOnly?: boolean;
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
    label: 'Client Portal',
    items: [
      { title: 'Dashboard', url: '/', icon: Home, clientOnly: true },
    ],
  },
  {
    label: 'Manage',
    items: [
      { title: 'Team', url: '/team', icon: LucideUsers, adminOnly: true },
      { title: 'Doulas', url: '/hours', icon: LucideUsers, adminOnly: true },
      {
        title: 'My Dashboard',
        url: '/doula-dashboard',
        icon: LucideUsers,
        doulaOnly: true,
      },
      {
        title: 'Payments',
        url: '/payments',
        icon: LucideCreditCard,
        adminOnly: true,
      },
      {
        title: 'Billing',
        url: '/billing',
        icon: LucideCreditCard,
        adminOnly: true,
      },
      { title: 'Invoices', url: '/invoices', icon: FileText, adminOnly: true },
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
      { title: 'Financial', url: '#', icon: LucideCircleDollarSign, adminOnly: true },
      { title: 'Demographics', url: '#', icon: LucideChartColumnIncreasing, adminOnly: true },
    ],
  },
];
