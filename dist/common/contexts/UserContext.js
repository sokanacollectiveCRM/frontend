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
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useEffect, useState } from 'react';
export var UserContext = createContext({
    user: null,
    setUser: function () { },
    isLoading: false,
    login: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
    logout: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    checkAuth: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
    googleAuth: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    requestPasswordReset: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
    updatePassword: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
});
;
export function UserProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = useState(null), user = _b[0], setUser = _b[1];
    var _c = useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var buildUrl = function (endpoint) {
        return "".concat(import.meta.env.VITE_APP_BACKEND_URL.replace(/\/$/, '')).concat(endpoint);
    };
    var checkAuth = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, response, userData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = localStorage.getItem('authToken');
                    console.log('Token from localStorage:', token);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch(buildUrl('/auth/me'), {
                            credentials: 'include',
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Auth check failed');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    userData = _a.sent();
                    console.log('User data:', userData);
                    setUser(userData);
                    return [2 /*return*/, true];
                case 4:
                    error_1 = _a.sent();
                    console.error('Auth check error:', error_1);
                    setUser(null);
                    return [2 /*return*/, false];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var login = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, token, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetch(buildUrl('/auth/login'), {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: email, password: password }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    throw new Error(data.error || 'Login failed');
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    token = (_a.sent()).token;
                    console.log('Token received:', token);
                    localStorage.setItem('authToken', token);
                    return [4 /*yield*/, checkAuth()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, true];
                case 6:
                    error_2 = _a.sent();
                    console.error('Login error:', error_2);
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var logout = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(buildUrl('/auth/logout'), {
                            method: 'POST',
                            credentials: 'include',
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Logout failed');
                    }
                    setUser(null);
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Logout error:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var googleAuth = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, url, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(buildUrl('/auth/google'), {
                            credentials: 'include',
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    url = (_a.sent()).url;
                    if (url) {
                        window.location.href = url;
                    }
                    else {
                        throw new Error('No authorization URL received');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Google auth error:', error_4);
                    throw new Error('Failed to initialize Google authentication');
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var requestPasswordReset = function (email) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(buildUrl('/auth/reset-password'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: email }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    console.log(data);
                    if (!response.ok) {
                        console.log(data);
                        throw new Error(data.error || 'Password reset request failed');
                    }
                    return [2 /*return*/, true];
                case 3:
                    error_5 = _a.sent();
                    console.error('Password reset request error:', error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var updatePassword = function (password, accessToken) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch(buildUrl('/auth/reset-password'), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(accessToken),
                            },
                            body: JSON.stringify({ password: password }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    throw new Error(data.error || 'Password update failed');
                case 3: return [2 /*return*/, true];
                case 4:
                    error_6 = _a.sent();
                    console.error('Password update error:', error_6);
                    throw error_6;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        checkAuth();
    }, []);
    var contextValue = {
        user: user,
        setUser: setUser,
        isLoading: isLoading,
        login: login,
        logout: logout,
        checkAuth: checkAuth,
        googleAuth: googleAuth,
        requestPasswordReset: requestPasswordReset,
        updatePassword: updatePassword,
    };
    return (_jsx(UserContext.Provider, { value: contextValue, children: children }));
}
