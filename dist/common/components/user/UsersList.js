var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
import { useEffect, useState } from 'react';
import styled from 'styled-components';
var UsersContainer = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  margin-top: 2rem;\n  width: 100%;\n  max-width: 800px;\n  margin-left: auto;\n  margin-right: auto;\n"], ["\n  margin-top: 2rem;\n  width: 100%;\n  max-width: 800px;\n  margin-left: auto;\n  margin-right: auto;\n"])));
var UserCard = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  padding: 1rem;\n  margin-bottom: 1rem;\n  border: 1px solid #e2e8f0;\n  border-radius: 0.5rem;\n  background-color: white;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n"], ["\n  padding: 1rem;\n  margin-bottom: 1rem;\n  border: 1px solid #e2e8f0;\n  border-radius: 0.5rem;\n  background-color: white;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n"])));
var UserInfo = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  display: flex;\n  gap: 1rem;\n  align-items: center;\n"], ["\n  display: flex;\n  gap: 1rem;\n  align-items: center;\n"])));
var UserName = styled.h3(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  margin: 0;\n  font-size: 1.1rem;\n  font-weight: 600;\n"], ["\n  margin: 0;\n  font-size: 1.1rem;\n  font-weight: 600;\n"])));
var UserEmail = styled.p(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  margin: 0;\n  color: #666;\n"], ["\n  margin: 0;\n  color: #666;\n"])));
var ErrorMessage = styled.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  color: #e53e3e;\n  padding: 1rem;\n  text-align: center;\n"], ["\n  color: #e53e3e;\n  padding: 1rem;\n  text-align: center;\n"])));
var LoadingMessage = styled.div(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  text-align: center;\n  padding: 1rem;\n"], ["\n  text-align: center;\n  padding: 1rem;\n"])));
export default function UsersList() {
    var _this = this;
    var _a = useState([]), users = _a[0], setUsers = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    useEffect(function () {
        var fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
            var token, response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        token = localStorage.getItem('authToken');
                        return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_APP_BACKEND_URL, "/auth/users"), {
                                credentials: 'include',
                                headers: {
                                    Authorization: "Bearer ".concat(token),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Failed to fetch users');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setUsers(data);
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error ? err_1.message : 'Error fetching users');
                        console.error('Error fetching users:', err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchUsers();
    }, []);
    if (loading) {
        return _jsx(LoadingMessage, { children: "Loading users..." });
    }
    if (error) {
        return _jsxs(ErrorMessage, { children: ["Error: ", error] });
    }
    return (_jsx(UsersContainer, { children: users.map(function (user) { return (_jsx(UserCard, { children: _jsx(UserInfo, { children: _jsxs("div", { children: [_jsxs(UserName, { children: [user.firstname, " ", user.lastname, " ("] }), _jsx(UserEmail, { children: user.email })] }) }) }, user.email)); }) }));
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
