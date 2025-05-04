import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search } from '@/common/components/header/Search';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import useWorkLog from "@/common/hooks/hours/useWorkLog";
import { useUser } from "@/common/hooks/user/useUser";
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { useEffect } from "react";
import { columns } from './components/users-columns';
import { UsersDialogs } from './components/users-dialogs';
import { UsersPrimaryButtons } from './components/users-primary-buttons';
import { UsersTable } from './components/users-table';
import UsersProvider from './context/clients-context';
import { userListSchema } from './data/schema';
import { users } from './data/users';
export default function Hours() {
    // Parse user list
    //  CURRENTLY HAVE BACKEND WORKING FOR GETTING HOURS, useUser() gets the userID and calling useWorkLog() gets the information.
    // to do now is parsing the returned data type thing of useWorkLog and displaying that information based on if it's finished loading or not 
    // const [hoursData, setHoursData] = useState<any[]>();
    var userList = userListSchema.parse(users);
    var _a = useUser(), user = _a.user, userLoading = _a.isLoading;
    var _b = useWorkLog(user === null || user === void 0 ? void 0 : user.id), hours = _b.hours, hoursLoading = _b.isLoading;
    var transformedData = (hours === null || hours === void 0 ? void 0 : hours.map(function (session) { return ({
        id: session.id,
        // Client fields
        client: {
            firstName: session.client.firstname,
            lastName: session.client.lastname
        },
        // Doula fields
        doula: {
            firstName: session.doula.firstname,
            lastName: session.doula.lastname
        },
        // Time fields
        start_time: new Date(session.start_time).toLocaleString(),
        end_time: new Date(session.end_time).toLocaleString(),
        // Add any other fields your table might need
    }); })) || [];
    // Log directly when hours change
    useEffect(function () {
        if (hours) {
            console.log("Transformed hours data:", transformedData);
        }
    }, [transformedData]);
    return (_jsxs(UsersProvider, { children: [_jsxs(Header, { fixed: true, children: [_jsx(Search, {}), _jsx("div", { className: 'ml-auto flex items-center space-x-4', children: _jsx(ProfileDropdown, {}) })] }), _jsx(LoadingOverlay, { isLoading: userLoading || hoursLoading }), _jsxs(Main, { children: [_jsxs("div", { className: 'mb-2 flex flex-wrap items-center justify-between space-y-2', children: [_jsx("div", { children: _jsx("h2", { className: 'text-2xl font-bold tracking-tight', children: "Your Hours" }) }), _jsx(UsersPrimaryButtons, {})] }), _jsx("div", { className: '-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0', children: _jsx(UsersTable, { data: transformedData, columns: columns }) })] }), _jsx(UsersDialogs, {})] }));
}
