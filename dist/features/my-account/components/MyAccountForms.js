import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/common/components/ui/tabs";
import { Account } from './UpdateAccount';
import { Profile } from './UpdateProfile';
export default function MyAccount() {
    return (_jsxs(Tabs, { defaultValue: "profile", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "profile", children: "Profile" }), _jsx(TabsTrigger, { value: "account", children: "Account" })] }), _jsx(TabsContent, { value: "profile", children: _jsx(Profile, {}) }), _jsx(TabsContent, { value: "account", children: _jsx(Account, {}) })] }));
}
