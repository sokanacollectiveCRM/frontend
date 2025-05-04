import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/common/components/ui/sidebar';
export function SidebarSection(_a) {
    var label = _a.label, items = _a.items;
    return (_jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { className: "font-extrabold text-lg", children: label }), _jsx(SidebarGroupContent, { children: _jsx(SidebarMenu, { children: items.map(function (item) { return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsxs("a", { href: item.url, children: [_jsx(item.icon, {}), _jsx("span", { children: item.title })] }) }) }, item.title)); }) }) })] }));
}
