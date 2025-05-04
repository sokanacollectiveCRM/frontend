import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/common/components/ui/sidebar';
import { Building2 } from 'lucide-react';
export function BusinessCard() {
    return (_jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { size: "lg", className: "cursor-default", asChild: true, children: _jsxs("div", { className: "flex w-full items-center gap-3", children: [_jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground", children: _jsx(Building2, { className: "size-4" }) }), _jsxs("div", { className: "grid text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-semibold", children: "Sokana Collective" }), _jsx("span", { className: "truncate text-xs text-muted-foreground", children: "Personal Platform" })] })] }) }) }) }));
}
