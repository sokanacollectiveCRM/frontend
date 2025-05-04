var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BusinessCard } from '@/common/components/navigation/sidebar/BusinessCard';
import { NavUser } from '@/common/components/navigation/sidebar/NavUser';
import { SidebarSection } from '@/common/components/navigation/sidebar/SidebarSection';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/common/components/ui/sidebar";
import { sidebarSections } from '@/common/data/sidebar-data';
export function AppSidebar(_a) {
    var props = __rest(_a, []);
    return (_jsxs(Sidebar, __assign({ collapsible: 'icon', variant: 'floating' }, props, { children: [_jsx(SidebarHeader, { children: _jsx(BusinessCard, {}) }), _jsx(SidebarContent, { children: sidebarSections.map(function (section) { return (_jsx(SidebarSection, { label: section.label, items: section.items }, section.label)); }) }), _jsx(SidebarFooter, { children: _jsx(NavUser, {}) })] })));
}
