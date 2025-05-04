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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search } from '@/common/components/header/Search';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { useClients } from '@/common/hooks/clients/useClients';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import updateClientStatus from '@/common/utils/updateClientStatus';
import { UsersBoard } from '@/features/pipeline/components/UsersBoard';
import UsersProvider from '@/features/pipeline/context/users-context';
import { useEffect, useMemo, useState } from 'react';
import { USER_STATUSES, userListSchema } from './data/schema';
export default function Pipeline() {
    var _this = this;
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
    var groupedUsers = useMemo(function () {
        var groups = {
            'lead': [],
            'contacted': [],
            'matching': [],
            'interviewing': [],
            'follow up': [],
            'contract': [],
            'active': [],
            'complete': [],
        };
        for (var _i = 0, userList_1 = userList; _i < userList_1.length; _i++) {
            var user = userList_1[_i];
            if (USER_STATUSES.includes(user.status)) {
                groups[user.status].push(user);
            }
        }
        return groups;
    }, [userList]);
    return (_jsxs(UsersProvider, { children: [_jsxs(Header, { fixed: true, children: [_jsx(Search, {}), _jsx("div", { className: 'ml-auto flex items-center space-x-4', children: _jsx(ProfileDropdown, {}) })] }), _jsx(LoadingOverlay, { isLoading: isLoading }), _jsxs(Main, { children: [_jsx("div", { className: 'mb-2 flex flex-wrap items-center justify-between space-y-2', children: _jsxs("div", { children: [_jsx("h2", { className: 'text-2xl font-bold tracking-tight', children: "Pipeline" }), _jsx("p", { className: 'text-muted-foreground', children: "Drag and drop to manage your users here." })] }) }), _jsx("div", { className: '-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0', children: _jsx(UsersBoard, { usersByStatus: groupedUsers, onStatusChange: function (userId, newStatus) { return __awaiter(_this, void 0, void 0, function () {
                                var client, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            setUserList(function (prev) {
                                                return prev.map(function (u) { return (u.id === userId ? __assign(__assign({}, u), { status: newStatus }) : u); });
                                            });
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, updateClientStatus(userId, newStatus)];
                                        case 2:
                                            client = _a.sent();
                                            console.log('Client status updated successfully: ', client);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_1 = _a.sent();
                                            console.error('Failed to update user status:', error_1);
                                            setUserList(function (prev) {
                                                return prev.map(function (u) { return (u.id === userId ? __assign(__assign({}, u), { status: u.status }) : u); });
                                            });
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); } }) })] })] }));
}
