import { cn } from '@/lib/utils';
import {
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Users,
  Clock3,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  {
    label: 'Profile',
    description: 'Manage your bio and personal details',
    to: '/doula-dashboard/profile',
    icon: LayoutDashboard,
  },
  {
    label: 'Documents',
    description: 'Upload and review required files',
    to: '/doula-dashboard/documents',
    icon: FileText,
  },
  {
    label: 'Clients',
    description: 'Review assigned clients',
    to: '/doula-dashboard/clients',
    icon: Users,
  },
  {
    label: 'Hours',
    description: 'Log and track your work hours',
    to: '/doula-dashboard/hours',
    icon: Clock3,
  },
  {
    label: 'Activities',
    description: 'View client notes and updates',
    to: '/doula-dashboard/activities',
    icon: MessagesSquare,
  },
] as const;

export function DoulaDashboardSidebar() {
  return (
    <>
      <div className='mb-5 lg:hidden'>
        <nav className='flex gap-2 overflow-x-auto pb-2'>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'border-teal-200 bg-teal-50 text-teal-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <aside className='hidden lg:block lg:w-72 lg:shrink-0 self-start'>
        <div className='sticky top-6 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur'>
          <div className='rounded-2xl bg-teal-950 px-4 py-4 text-white shadow-sm'>
            <p className='text-lg font-semibold'>Doula Dashboard</p>
            <p className='mt-1 text-sm text-teal-100'>
              Keep your profile, files, clients, and hours in one place.
            </p>
          </div>

          <nav className='mt-5 space-y-2'>
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-start gap-3 rounded-2xl border px-4 py-3 transition',
                      isActive
                        ? 'border-teal-200 bg-teal-50 text-teal-950 shadow-sm'
                        : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl',
                      'bg-slate-100 text-slate-600'
                    )}
                  >
                    <Icon className='h-4 w-4' />
                  </span>
                  <span className='min-w-0'>
                    <span className='block font-medium'>{item.label}</span>
                    <span className='mt-0.5 block text-xs leading-5 text-slate-500'>
                      {item.description}
                    </span>
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
