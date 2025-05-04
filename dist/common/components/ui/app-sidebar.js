import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, FileText, Home, Inbox, LucideChartColumnIncreasing, LucideCircleDollarSign, LucideClock5, LucideCreditCard, LucideUsers, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/common/components/ui/sidebar";
// import { UserCard } from "@/common/components/user/UserCard"
import { NavUser } from "../navigation/sidebar/NavUser";
var GeneralItems = [
    {
        title: "Dashboard",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Clients",
        url: "#",
        icon: Search,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    }
];
var ManageIcons = [
    {
        title: "Team",
        url: "#",
        icon: LucideUsers
    },
    {
        title: "Contracts",
        url: "#",
        icon: FileText
    },
    {
        title: "Hours",
        url: "/hours",
        icon: LucideClock5
    },
    {
        title: "Payments",
        url: "#",
        icon: LucideCreditCard
    }
];
var AnalyticsIcons = [
    {
        title: "Financial",
        url: "#",
        icon: LucideCircleDollarSign
    },
    {
        title: "Demographics",
        url: "#",
        icon: LucideChartColumnIncreasing
    }
];
export function AppSidebar() {
    return (_jsxs(Sidebar, { collapsible: "icon", children: [_jsxs(SidebarContent, { children: [_jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { className: "font-extrabold text-lg", children: "General" }), _jsx(SidebarGroupContent, { children: _jsx(SidebarMenu, { children: GeneralItems.map(function (item) { return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsxs(Link, { to: "/".concat(item.url), children: [_jsx(item.icon, {}), _jsx("span", { children: item.title })] }) }) }, item.title)); }) }) })] }), _jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { className: "font-extrabold text-lg", children: "Manage" }), _jsx(SidebarGroupContent, { children: _jsx(SidebarMenu, { children: ManageIcons.map(function (item) { return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsxs(Link, { to: "/".concat(item.url), children: [_jsx(item.icon, {}), _jsx("span", { children: item.title })] }) }) }, item.title)); }) }) })] }), _jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { className: "font-extrabold text-lg", children: "Analytics" }), _jsx(SidebarGroupContent, { children: _jsx(SidebarMenu, { children: AnalyticsIcons.map(function (item) { return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsxs(Link, { to: "/".concat(item.url), children: [_jsx(item.icon, {}), _jsx("span", { children: item.title })] }) }) }, item.title)); }) }) })] })] }), _jsx(SidebarFooter, { children: _jsx(NavUser, {}) })] }));
}
