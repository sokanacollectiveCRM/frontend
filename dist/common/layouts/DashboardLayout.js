import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppSidebar } from "@/common/components/navigation/sidebar/AppSidebar";
import { SidebarProvider } from "@/common/components/ui/sidebar";
import { SearchProvider } from '@/common/contexts/search-context';
import { Outlet } from "react-router-dom";
export default function DashboardLayout() {
    return (_jsx(SearchProvider, { children: _jsxs(SidebarProvider, { children: [_jsx(AppSidebar, {}), _jsx("main", { children: _jsx(Outlet, {}) })] }) }));
}
