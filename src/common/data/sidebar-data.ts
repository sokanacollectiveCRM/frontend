import {
  Calendar,
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
  UserPlus
} from 'lucide-react'

export interface SidebarItem {
  title: string
  url: string
  icon: React.ElementType
}

export interface SidebarSection {
  label: string
  items: SidebarItem[]
}

export const sidebarSections = [
  {
    label: 'General',
    items: [
      { title: 'Dashboard', url: '/', icon: Home },
      { title: 'Inbox', url: '/inbox', icon: Inbox },
      { title: 'Clients', url: '/clients', icon: Search },
      { title: 'New Client',url: '/clients/new',icon: UserPlus },  // ← our new link
      { title: 'Calendar', url: '#', icon: Calendar },
    ],
  },
  {
    label: 'Manage',
    items: [
      { title: 'Team', url: '/team', icon: LucideUsers },
      { title: 'Contracts', url: '/contracts', icon: FileText },
      { title: 'Hours', url: '/hours', icon: LucideClock5 },
      { title: 'Payments', url: '/payments', icon: LucideCreditCard },
      { title: 'Payments', url: '#', icon: LucideCreditCard },
      { title: 'Billing', url: '/billing', icon: LucideCreditCard },
      { title: 'Invoices', url: '/invoices', icon: FileText }, // ← Add here!
    ],
  },
  {
    label: 'Integrations',            // ⬅️  NEW SECTION
    items: [
      {
        title: 'QuickBooks',
        url:   '/integrations/quickbooks',
        icon:  LucideLink,
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { title: 'Financial', url: '#', icon: LucideCircleDollarSign },
      { title: 'Demographics', url: '#', icon: LucideChartColumnIncreasing },
    ],
  },
]