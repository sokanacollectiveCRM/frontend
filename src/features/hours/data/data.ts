import {
  Banknote,
  Shield,
  ShieldUser,
  Users,
} from 'lucide-react'
import { UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['Completed', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['Active', 'bg-neutral-300/40 border-neutral-300'],
  ['In Progress', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
])

export const userTypes = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: Shield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: ShieldUser,
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: Users,
  },
  {
    label: 'Cashier',
    value: 'cashier',
    icon: Banknote,
  },
] as const
