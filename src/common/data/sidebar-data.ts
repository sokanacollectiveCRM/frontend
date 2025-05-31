import {
  FileText,
  Home,
  Inbox,
  LucideClock5,
  LucideCreditCard,
  LucideUsers,
  RectangleVertical,
  Search
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
      { title: 'Pipeline', url:'/pipeline', icon: RectangleVertical }
    ],
  },
  {
    label: 'Manage',
    items: [
      { title: 'Team', url: '/team', icon: LucideUsers },
      { title: 'Contracts', url: '/contracts', icon: FileText },
      { title: 'Hours', url: '/hours', icon: LucideClock5 },
      { title: 'Payments', url: '/payments', icon: LucideCreditCard },
    ],
  },
]