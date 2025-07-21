import { Banknote, Shield, ShieldUser, Users } from 'lucide-react';

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
] as const;
