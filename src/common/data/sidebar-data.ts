import {
  Calendar,
  FileText,
  Home,
  Inbox,
  LucideChartColumnIncreasing,
  LucideCircleDollarSign,
  LucideClock5,
  LucideCreditCard,
  LucideUsers,
  Search,
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
      { title: 'Inbox', url: '#', icon: Inbox },
      { title: 'Clients', url: '/clients', icon: Search },
      { title: 'Calendar', url: '#', icon: Calendar },
    ],
  },
  {
    label: 'Manage',
    items: [
      { title: 'Team', url: '#', icon: LucideUsers },
      { title: 'Contracts', url: '#', icon: FileText },
      { title: 'Hours', url: '/hours', icon: LucideClock5 },
      { title: 'Payments', url: '#', icon: LucideCreditCard },
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