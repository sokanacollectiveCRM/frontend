import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route } from 'react-router-dom';
import AuthCallback from "./AuthCallback";
import Login from "./Login";
import RequestPasswordReset from "./RequestPasswordReset";
import ResetPassword from "./ResetPassword";
import SignUp from "./SignUp";
export var AuthPublicRoutes = function () { return (_jsxs(Route, { children: [_jsx(Route, { path: 'login', element: _jsx(Login, {}) }), _jsx(Route, { path: 'signup', element: _jsx(SignUp, {}) }), _jsx(Route, { path: 'forgot-password', element: _jsx(RequestPasswordReset, {}) })] })); };
export var AuthRoutes = function () { return (_jsxs(Route, { children: [_jsx(Route, { path: 'auth/callback', element: _jsx(AuthCallback, {}) }), _jsx(Route, { path: 'auth/reset-password', element: _jsx(ResetPassword, {}) })] })); };
