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
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { useUser } from '@/common/hooks/user/useUser';
var Container = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n"], ["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n"])));
var LoadingText = styled.p(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  font-size: 1rem;\n  color: ", ";\n"], ["\n  font-size: 1rem;\n  color: ", ";\n"])), function (props) { var _a; return ((_a = props.theme.colors) === null || _a === void 0 ? void 0 : _a.text) || '#000'; });
export default function AuthCallback() {
    var _this = this;
    var navigate = useNavigate();
    var checkAuth = useUser().checkAuth;
    useEffect(function () {
        var handleCallback = function () { return __awaiter(_this, void 0, void 0, function () {
            var hash, params, access_token, response, error, authSuccess, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        console.log('AuthCallback mounted');
                        hash = window.location.hash.substring(1);
                        params = new URLSearchParams(hash);
                        access_token = params.get('access_token');
                        console.log('Token status:', access_token ? 'present' : 'missing');
                        if (!access_token) {
                            throw new Error('No access token received');
                        }
                        return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_APP_BACKEND_URL, "/auth/callback"), {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ access_token: access_token }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        error = _a.sent();
                        throw new Error(error.error || 'Authentication failed');
                    case 3:
                        localStorage.setItem('authToken', access_token);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, checkAuth()];
                    case 5:
                        authSuccess = _a.sent();
                        if (authSuccess) {
                            navigate('/', { replace: true });
                        }
                        else {
                            throw new Error('Authentication verification failed');
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Auth callback error:', error_1);
                        navigate('/login', {
                            state: { error: error_1 instanceof Error ? error_1.message : error_1 },
                            replace: true,
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        handleCallback();
    }, [navigate, checkAuth]);
    return (_jsx(Container, { children: _jsx(LoadingOverlay, { isLoading: true }) }));
}
var templateObject_1, templateObject_2;
