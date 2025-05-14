import { AppSidebar } from "@/common/components/navigation/sidebar/AppSidebar";
import { SidebarProvider } from "@/common/components/ui/sidebar";
import { SearchProvider } from '@/common/contexts/search-context';
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {

  return (
    <SearchProvider>
      <SidebarProvider>
          <AppSidebar />
          <main style={{width: '100%'}}>
            <Outlet />
          </main>
      </SidebarProvider>
    </SearchProvider>

  );
}