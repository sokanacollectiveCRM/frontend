import { AppSidebar } from '@/common/components/navigation/sidebar/AppSidebar';
import { SidebarProvider } from '@/common/components/ui/sidebar';
import { SearchProvider } from '@/common/contexts/SearchContext';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <SearchProvider>
      <SidebarProvider>
        <div className='flex min-h-screen w-full overflow-x-hidden'>
          <aside className='w-64 shrink-0 border-r bg-muted p-4'>
            <AppSidebar />
          </aside>
          <main className='min-w-0 flex-1'>
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
