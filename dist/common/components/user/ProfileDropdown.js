import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, } from '@/common/components/ui/dropdown-menu';
import UserAvatar from '@/common/components/user/UserAvatar';
import { useUser } from '@/common/hooks/user/useUser';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
export function ProfileDropdown() {
    var _a, _b;
    var _c = useUser(), user = _c.user, logout = _c.logout;
    if (!user)
        return null;
    var name = "".concat((_a = user.firstname) !== null && _a !== void 0 ? _a : "", " ").concat((_b = user.lastname) !== null && _b !== void 0 ? _b : "").trim();
    return (_jsxs(DropdownMenu, { modal: false, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', className: 'relative h-8 w-8 rounded-full', children: _jsx(UserAvatar, { profile_picture: user === null || user === void 0 ? void 0 : user.profile_picture, fullName: name, className: "h-8 w-8" }) }) }), _jsxs(DropdownMenuContent, { className: 'w-full', align: 'end', forceMount: true, children: [_jsx(DropdownMenuLabel, { className: 'font-normal', children: _jsxs("div", { className: 'flex flex-col space-y-1', children: [_jsx("p", { className: 'text-sm font-medium leading-none', children: name }), _jsx("p", { className: 'text-xs leading-none text-muted-foreground', children: user.email })] }) }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuGroup, { children: _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: '/my-account', children: ["Profile", _jsx(DropdownMenuShortcut, { children: "\u21E7\u2318P" })] }) }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: logout, children: [_jsx(LogOut, {}), "Log out", _jsx(DropdownMenuShortcut, { children: "\u21E7\u2318Q" })] })] })] }));
}
