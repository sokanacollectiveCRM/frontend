import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search } from '@/common/components/header/Search';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { useClients } from '@/common/hooks/clients/useClients';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { useEffect, useState } from 'react';
import { columns } from './components/users-columns';
import { UsersDialogs } from './components/users-dialogs';
import { UsersPrimaryButtons } from './components/users-primary-buttons';
import { UsersTable } from './components/users-table';
import UsersProvider from './context/users-context';
import { userListSchema } from './data/schema';
export default function Users() {
    var _a = useClients(), clients = _a.clients, isLoading = _a.isLoading, getClients = _a.getClients;
    var _b = useState([]), userList = _b[0], setUserList = _b[1];
    // fetch clients
    useEffect(function () {
        getClients();
    }, []);
    // parse clients and summarize profile for view
    useEffect(function () {
        if (clients.length === 0)
            return;
        try {
            var parsed = userListSchema.parse(clients);
            setUserList(parsed);
        }
        catch (err) {
            console.error('Failed to parse client list with Zod:', err);
            setUserList([]);
        }
    }, [clients]);
    return (_jsxs(UsersProvider, { children: [_jsxs(Header, { fixed: true, children: [_jsx(Search, {}), _jsx("div", { className: 'ml-auto flex items-center space-x-4', children: _jsx(ProfileDropdown, {}) })] }), _jsx(LoadingOverlay, { isLoading: isLoading }), _jsxs(Main, { children: [_jsxs("div", { className: 'mb-2 flex flex-wrap items-center justify-between space-y-2', children: [_jsxs("div", { children: [_jsx("h2", { className: 'text-2xl font-bold tracking-tight', children: "Clients" }), _jsx("p", { className: 'text-muted-foreground', children: "Manage your clients and their status here." })] }), _jsx(UsersPrimaryButtons, {})] }), _jsx("div", { className: '-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0', children: _jsx(UsersTable, { data: userList, columns: columns }) })] }), _jsx(UsersDialogs, {})] }));
}
