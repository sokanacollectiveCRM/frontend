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
