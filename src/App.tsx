
import { BrowserRouter } from 'react-router-dom';

import { AppSidebar } from "@/common/components/ui/app-sidebar";
import { SidebarProvider } from "@/common/components/ui/sidebar";
import { UserProvider } from "@/common/contexts/UserContext.jsx";
import AppRoutes from "./Routes";

 

import '@/styles/App.css';

export default function App() {
  return (
  <SidebarProvider>
    <UserProvider>
      <BrowserRouter>
        <AppSidebar />
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  </SidebarProvider>
  );
}

