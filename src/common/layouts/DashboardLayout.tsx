import { AppSidebar } from "@/common/components/navigation/sidebar/AppSidebar";
import { SidebarProvider } from "@/common/components/ui/sidebar";
import { SearchProvider } from '@/common/contexts/search-context';
import { cn } from '@/lib/utils';
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {

  return (
    <SearchProvider>
      <SidebarProvider>
          <AppSidebar />
            <div
            id='content'
            className={cn(
              'ml-auto w-full max-w-full',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'transition-[width] duration-200 ease-in-out',
              'flex h-svh flex-col',
              'group-data-[scroll-locked=1]/body:h-full',
              'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
            )}
          >
            <Outlet />
          </div>
      </SidebarProvider>
    </SearchProvider>

  );
}