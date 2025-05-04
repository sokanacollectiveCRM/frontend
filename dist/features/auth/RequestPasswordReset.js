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
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@/common/hooks/user/useUser';
var Container = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  max-width: 400px;\n  margin: 40px auto;\n  padding: 20px;\n"], ["\n  max-width: 400px;\n  margin: 40px auto;\n  padding: 20px;\n"])));
var Form = styled.form(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n"], ["\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n"])));
var Input = styled.input(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding: 10px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n"], ["\n  padding: 10px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n"])));
var Button = styled.button(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 10px;\n  background-color: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.2s ease;\n\n  &:hover {\n    background-color: #0056b3;\n  }\n\n  &:disabled {\n    background-color: #ccc;\n    cursor: not-allowed;\n  }\n"], ["\n  padding: 10px;\n  background-color: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.2s ease;\n\n  &:hover {\n    background-color: #0056b3;\n  }\n\n  &:disabled {\n    background-color: #ccc;\n    cursor: not-allowed;\n  }\n"])));
var ErrorMessage = styled.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  color: red;\n  margin-top: 10px;\n  padding: 10px;\n  border-radius: 4px;\n  background-color: #ffe6e6;\n"], ["\n  color: red;\n  margin-top: 10px;\n  padding: 10px;\n  border-radius: 4px;\n  background-color: #ffe6e6;\n"])));
var SuccessMessage = styled.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  color: #2e7d32;\n  margin-top: 10px;\n  padding: 10px;\n  border-radius: 4px;\n  background-color: #edf7ed;\n"], ["\n  color: #2e7d32;\n  margin-top: 10px;\n  padding: 10px;\n  border-radius: 4px;\n  background-color: #edf7ed;\n"])));
var StyledLink = styled(Link)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  color: #007bff;\n  text-decoration: none;\n  text-align: center;\n  margin-top: 10px;\n\n  &:hover {\n    text-decoration: underline;\n  }\n"], ["\n  color: #007bff;\n  text-decoration: none;\n  text-align: center;\n  margin-top: 10px;\n\n  &:hover {\n    text-decoration: underline;\n  }\n"])));
var Title = styled.h2(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  text-align: center;\n  color: #333;\n  margin-bottom: 20px;\n"], ["\n  text-align: center;\n  color: #333;\n  margin-bottom: 20px;\n"])));
export default function RequestPasswordReset() {
    var _this = this;
    var _a = useState(''), email = _a[0], setEmail = _a[1];
    var _b = useState(''), error = _b[0], setError = _b[1];
    var _c = useState(false), success = _c[0], setSuccess = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var requestPasswordReset = useUser().requestPasswordReset;
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError('');
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, requestPasswordReset(email)];
                case 2:
                    _a.sent();
                    setSuccess(true);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs(Container, { children: [_jsx(Title, { children: "Reset Password" }), !success ? (_jsxs(Form, { onSubmit: handleSubmit, children: [_jsx(Input, { type: 'email', placeholder: 'Enter your email', value: email, onChange: function (e) { return setEmail(e.target.value); }, required: true, autoComplete: 'email' }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? 'Sending...' : 'Reset Password' }), error && _jsx(ErrorMessage, { children: error }), _jsx(StyledLink, { to: '/login', children: "Back to Login" })] })) : (_jsxs("div", { children: [_jsx(SuccessMessage, { children: "Password reset instructions have been sent to your email. Please check your inbox and follow the instructions to reset your password. If you don't receive the email within a few minutes, please check your spam folder." }), _jsx(StyledLink, { to: '/login', children: "Back to Login" })] }))] }));
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
