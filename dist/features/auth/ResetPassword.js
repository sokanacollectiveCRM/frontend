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
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@/common/hooks/user/useUser';
var Container = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  max-width: 400px;\n  margin: 40px auto;\n  padding: 20px;\n"], ["\n  max-width: 400px;\n  margin: 40px auto;\n  padding: 20px;\n"])));
var Form = styled.form(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n"], ["\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n"])));
var Input = styled.input(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding: 10px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n"], ["\n  padding: 10px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n"])));
var Button = styled.button(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 10px;\n  background-color: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n\n  &:disabled {\n    background-color: #ccc;\n  }\n"], ["\n  padding: 10px;\n  background-color: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n\n  &:disabled {\n    background-color: #ccc;\n  }\n"])));
var ErrorMessage = styled.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  color: red;\n  margin-top: 10px;\n"], ["\n  color: red;\n  margin-top: 10px;\n"])));
var PasswordStrength = styled.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  height: 5px;\n  margin-top: 5px;\n  background-color: ", ";\n  width: ", ";\n  transition: all 0.3s ease;\n"], ["\n  height: 5px;\n  margin-top: 5px;\n  background-color: ", ";\n  width: ", ";\n  transition: all 0.3s ease;\n"])), function (_a) {
    var strength = _a.strength;
    switch (strength) {
        case 'weak':
            return '#ff4d4d';
        case 'medium':
            return '#ffd700';
        case 'strong':
            return '#32cd32';
        default:
            return '#ccc';
    }
}, function (_a) {
    var strength = _a.strength;
    switch (strength) {
        case 'weak':
            return '33%';
        case 'medium':
            return '66%';
        case 'strong':
            return '100%';
        default:
            return '0%';
    }
});
var PasswordRequirements = styled.ul(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  font-size: 0.8rem;\n  color: #666;\n  margin-top: 5px;\n  padding-left: 20px;\n"], ["\n  font-size: 0.8rem;\n  color: #666;\n  margin-top: 5px;\n  padding-left: 20px;\n"])));
var PasswordContainer = styled.div(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n"], ["\n  display: flex;\n  flex-direction: column;\n"])));
export default function ResetPassword() {
    var _this = this;
    var _a = useState(''), password = _a[0], setPassword = _a[1];
    var _b = useState(''), confirmPassword = _b[0], setConfirmPassword = _b[1];
    var _c = useState(''), error = _c[0], setError = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var updatePassword = useUser().updatePassword;
    var navigate = useNavigate();
    useEffect(function () {
        var hash = window.location.hash.substring(1);
        var hashParams = new URLSearchParams(hash);
        var access_token = hashParams.get('access_token');
        var type = hashParams.get('type');
        console.log('Hash parameters:', {
            hasAccessToken: !!access_token,
            type: type,
        });
        if (!access_token) {
            setError('No reset token found. Please request a new password reset link.');
        }
        else if (type !== 'recovery') {
            setError('Invalid reset link type. Please request a new password reset link.');
        }
    }, []);
    var checkPasswordStrength = function (password) {
        var hasUpperCase = /[A-Z]/.test(password);
        var hasLowerCase = /[a-z]/.test(password);
        var hasNumbers = /\d/.test(password);
        var hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        var strength = (hasUpperCase ? 1 : 0) +
            (hasLowerCase ? 1 : 0) +
            (hasNumbers ? 1 : 0) +
            (hasSpecialChar ? 1 : 0) +
            (password.length >= 8 ? 1 : 0);
        if (strength >= 4)
            return 'strong';
        if (strength >= 2)
            return 'medium';
        return 'weak';
    };
    var validatePassword = function (password) {
        var requirements = [];
        if (password.length < 8) {
            requirements.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            requirements.push('Include at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            requirements.push('Include at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            requirements.push('Include at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            requirements.push('Include at least one special character');
        }
        return requirements;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var hash, hashParams, access_token, requirements, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError('');
                    hash = window.location.hash.substring(1);
                    hashParams = new URLSearchParams(hash);
                    access_token = hashParams.get('access_token');
                    if (!access_token) {
                        setError('Reset token not found. Please request a new password reset link.');
                        return [2 /*return*/];
                    }
                    requirements = validatePassword(password);
                    if (requirements.length > 0) {
                        setError(requirements.join(', '));
                        return [2 /*return*/];
                    }
                    if (password !== confirmPassword) {
                        setError('Passwords do not match');
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    console.log('Attempting password reset with token');
                    return [4 /*yield*/, updatePassword(password, access_token)];
                case 2:
                    _a.sent();
                    navigate('/login', {
                        state: {
                            message: 'Password has been reset successfully. Please login with your new password.',
                        },
                        replace: true,
                    });
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Password reset error:', err_1);
                    setError(err_1.message || 'Failed to reset password. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs(Container, { children: [_jsx("h2", { children: "Set New Password" }), _jsxs(Form, { onSubmit: handleSubmit, children: [_jsxs(PasswordContainer, { children: [_jsx(Input, { type: 'password', placeholder: 'New Password', value: password, onChange: function (e) { return setPassword(e.target.value); }, required: true }), _jsx(PasswordStrength, { strength: checkPasswordStrength(password) }), password && (_jsx(PasswordRequirements, { children: validatePassword(password).map(function (req, index) { return (_jsx("li", { children: req }, index)); }) }))] }), _jsx(Input, { type: 'password', placeholder: 'Confirm New Password', value: confirmPassword, onChange: function (e) { return setConfirmPassword(e.target.value); }, required: true }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? 'Updating...' : 'Update Password' }), error && _jsx(ErrorMessage, { children: error })] })] }));
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
