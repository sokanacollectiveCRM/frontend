import { AppSidebar } from "@/common/components/ui/app-sidebar";
import { SidebarProvider } from "@/common/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <SidebarProvider className="flex w-full">
      <AppSidebar />
      <main className="flex w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}