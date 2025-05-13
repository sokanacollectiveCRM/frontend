import { AppSidebar } from "@/common/components/navigation/sidebar/AppSidebar";
import { SidebarProvider } from "@/common/components/ui/sidebar";
import { SearchProvider } from '@/common/contexts/search-context';
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {

  return (
    <SearchProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <aside className="w-64 shrink-0 border-r bg-muted p-4">
            <AppSidebar />
          </aside>
          <main className="flex-1 h-full w-full">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </SearchProvider>

  );
}