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
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { Input } from '@/common/components/form/Input';
import { useUser } from '@/common/hooks/user/useUser';
import { RedSpan } from '@/common/components/form/styles';
import SubmitButton from '@/common/components/form/SubmitButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import GoogleButton from '@/features/auth/GoogleButton';
export default function SignUp() {
    var _this = this;
    var navigate = useNavigate();
    var _a = useState(''), error = _a[0], setError = _a[1];
    var _b = useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var googleAuth = useUser().googleAuth;
    var _c = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        username: '',
    }), formState = _c[0], setFormState = _c[1];
    var handleChangeFirstname = function (e) {
        setFormState(__assign(__assign({}, formState), { firstname: e.target.value }));
        setError('');
    };
    var handleChangeLastname = function (e) {
        setFormState(__assign(__assign({}, formState), { lastname: e.target.value }));
        setError('');
    };
    var handleChangeEmail = function (e) {
        setFormState(__assign(__assign({}, formState), { email: e.target.value }));
        setError('');
    };
    var handleChangePassword = function (e) {
        setFormState(__assign(__assign({}, formState), { password: e.target.value }));
        setError('');
    };
    var handleChangeUsername = function (e) {
        setFormState(__assign(__assign({}, formState), { username: e.target.value }));
        setError('');
    };
    var handleGoogleSignup = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, googleAuth()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setError(error_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_APP_BACKEND_URL, "/auth/signup"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: formState.email,
                                password: formState.password,
                                username: formState.username || undefined,
                                firstname: formState.firstname || undefined,
                                lastname: formState.lastname || undefined,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to create account');
                    }
                    alert('Account created successfully! Please check your email to verify your account.');
                    navigate('/login', {
                        state: {
                            message: 'Account created successfully! Please check your email to verify your account.',
                        },
                    });
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error('Signup error:', error_2);
                    setError(error_2.message || 'Failed to create account. Please try again.');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx("div", { className: "flex flex-col gap-6 max-w-md mx-auto", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl", children: "Sign Up" }), _jsx(CardDescription, { children: "Enter your details below to create your account" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-6", children: [error && _jsx(RedSpan, { children: error }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "firstname", children: "First Name" }), _jsx(Input, { id: "firstname", name: "firstname", placeholder: "First Name", value: formState.firstname, onChange: handleChangeFirstname })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "lastname", children: "Last Name" }), _jsx(Input, { id: "lastname", name: "lastname", placeholder: "Last Name", value: formState.lastname, onChange: handleChangeLastname })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", name: "email", placeholder: "j@example.com", value: formState.email, onChange: handleChangeEmail, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsx(Input, { id: "username", name: "username", placeholder: "johnsmith", value: formState.username, onChange: handleChangeUsername })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", name: "password", placeholder: "Password", value: formState.password, onChange: handleChangePassword, required: true })] }), _jsx(SubmitButton, { disabled: isLoading, className: "w-full", children: isLoading ? "Logging in..." : "Log In" }), _jsx(GoogleButton, { onClick: handleGoogleSignup, isLoading: isLoading, text: 'Sign up with Google' })] }), _jsxs("div", { className: "mt-4 text-center text-sm", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "underline underline-offset-4", children: "Login" })] })] })] }) }));
}
