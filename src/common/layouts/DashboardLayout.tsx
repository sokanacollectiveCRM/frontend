import { AppSidebar } from '@/common/components/navigation/sidebar/AppSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/common/components/ui/sidebar';
import { SearchProvider } from '@/common/contexts/SearchContext';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <SearchProvider>
      <SidebarProvider className='min-h-dvh min-w-0 overflow-x-hidden'>
        <AppSidebar />
        <SidebarInset className='min-w-0 overflow-x-hidden'>
          <header className='flex h-12 shrink-0 items-center gap-2 border-b px-3 pt-[env(safe-area-inset-top)] lg:hidden'>
            <SidebarTrigger className='min-h-11 min-w-11' />
            <span className='text-sm font-medium'>Sokana CRM</span>
          </header>
          <div className='min-w-0 flex-1 overflow-x-hidden pb-[env(safe-area-inset-bottom)]'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
