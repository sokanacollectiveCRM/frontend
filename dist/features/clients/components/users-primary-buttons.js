import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { MailPlus, UserPlus } from 'lucide-react';
import { useUsers } from '../context/users-context';
export function UsersPrimaryButtons() {
    var setOpen = useUsers().setOpen;
    return (_jsxs("div", { className: 'flex gap-2', children: [_jsxs(Button, { variant: 'outline', className: 'space-x-1', onClick: function () { return setOpen('invite'); }, children: [_jsx("span", { children: "Invite User" }), " ", _jsx(MailPlus, { size: 18 })] }), _jsxs(Button, { className: 'space-x-1', onClick: function () { return setOpen('add'); }, children: [_jsx("span", { children: "Add User" }), " ", _jsx(UserPlus, { size: 18 })] })] }));
}
