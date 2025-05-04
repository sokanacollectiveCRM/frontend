"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { useUser } from '@/common/hooks/user/useUser';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "../../ui/sidebar";
import UserAvatar from "../../user/UserAvatar";
//
// This is the user profile card at the footer of the sidebar
//
export function NavUser() {
    var _a, _b;
    var isMobile = useSidebar().isMobile;
    var _c = useUser(), user = _c.user, logout = _c.logout;
    if (!user)
        return null;
    var name = "".concat((_a = user.firstname) !== null && _a !== void 0 ? _a : "", " ").concat((_b = user.lastname) !== null && _b !== void 0 ? _b : "").trim();
    return (_jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(SidebarMenuButton, { size: "lg", className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", children: [_jsx(UserAvatar, { profile_picture: user.profile_picture, fullName: name, className: "h-8 w-8" }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-semibold", children: name }), _jsx("span", { className: "truncate text-xs", children: user.email })] }), _jsx(ChevronsUpDown, { className: "ml-auto size-4" })] }) }), _jsxs(DropdownMenuContent, { className: "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg", side: isMobile ? "bottom" : "right", align: "end", sideOffset: 4, children: [_jsx(DropdownMenuLabel, { className: "p-0 font-normal", children: _jsxs("div", { className: "flex items-center gap-2 px-1 py-1.5 text-left text-sm", children: [_jsx(UserAvatar, { profile_picture: user.profile_picture, fullName: name, className: "h-8 w-8" }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-semibold", children: name }), _jsx("span", { className: "truncate text-xs", children: user.email })] })] }) }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuGroup, { children: _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "my-account", children: [_jsx(User, {}), "Account"] }) }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: logout, children: [_jsx(LogOut, {}), "Log out"] })] })] }) }) }));
}
