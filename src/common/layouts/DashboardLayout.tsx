import { AppSidebar } from "@/common/components/navigation/sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/common/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
`;

const MainContent = styled.main`
  width: 100%;
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <LayoutContainer>
        <AppSidebar />
        <SidebarTrigger />
        <MainContent>
            <Outlet />
        </MainContent>
      </LayoutContainer>
    </SidebarProvider>
  );
}