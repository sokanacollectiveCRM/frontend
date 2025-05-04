import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Search } from '@/common/components/header/Search';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import MyAccountForms from '@/features/my-account/components/MyAccountForms';
export default function MyAccount() {
    return (_jsxs(_Fragment, { children: [_jsxs(Header, { fixed: true, children: [_jsx(Search, {}), _jsx("div", { className: "ml-auto flex items-center space-x-4", children: _jsx(ProfileDropdown, {}) })] }), _jsxs(Main, { children: [_jsxs("div", { className: "mb-2 flex flex-col space-y-2", children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "My Account" }), _jsx("p", { className: "text-muted-foreground", children: "Manage your account and profile settings." })] }), _jsx("div", { className: "-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0", children: _jsx(MyAccountForms, {}) })] })] }));
}
