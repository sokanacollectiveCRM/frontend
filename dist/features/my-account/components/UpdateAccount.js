var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { useUser } from '@/common/hooks/user/useUser';
import { STATES } from "@/common/utils/50States";
import { useForm } from "react-hook-form";
import styled from 'styled-components';
import saveUser from '@/common/utils/saveUser';
var TwoInputs = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: row;\n  gap: 10px;  \n"], ["\n  display: flex;\n  flex-direction: row;\n  gap: 10px;  \n"])));
export var Account = function () {
    var _a = useUser(), user = _a.user, isLoading = _a.isLoading;
    var accountForm = useForm({
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            address: "",
            city: "",
            state: STATES[0].value,
        },
    });
    var submitAccountForm = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var userFormData, savedUser, err_1;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    userFormData = new FormData();
                    userFormData.append("id", user.id);
                    userFormData.append("firstname", (_a = values.firstname) !== null && _a !== void 0 ? _a : ''); // This just ensures that the value is '' if not filled in
                    userFormData.append("lastname", (_b = values.lastname) !== null && _b !== void 0 ? _b : '');
                    userFormData.append("email", (_c = values.email) !== null && _c !== void 0 ? _c : '');
                    userFormData.append("address", (_d = values.address) !== null && _d !== void 0 ? _d : '');
                    userFormData.append("city", (_e = values.city) !== null && _e !== void 0 ? _e : '');
                    userFormData.append("state", (_f = values.state) !== null && _f !== void 0 ? _f : '');
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, saveUser(userFormData)];
                case 2:
                    savedUser = _g.sent();
                    console.log("User saved successfully:", savedUser);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _g.sent();
                    console.error("User NOT saved successfully: ", err_1);
                    return [3 /*break*/, 4];
                case 4:
                    console.log("inside submitAccountForm, userFormData is", userFormData);
                    saveUser(userFormData)
                        .then(function (savedUser) {
                        console.log('User saved successfully:', savedUser);
                    })
                        .catch(function (error) {
                        console.log("user NOT saved successfully :(", error);
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs(Card, { className: "min-h-96 py-5", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Account" }), _jsx(CardDescription, { children: "Update your personal details" })] }), _jsxs(CardContent, { className: "flex flex-col flex-1", children: [_jsx(Separator, {}), _jsx(Form, __assign({}, accountForm, { children: _jsxs("form", { onSubmit: accountForm.handleSubmit(submitAccountForm), className: "flex flex-col flex-1 py-5 space-y-4", children: [_jsxs(TwoInputs, { children: [_jsx(FormField, { control: accountForm.control, name: "firstname", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { className: "flex-1", children: [_jsx(FormLabel, { children: "First Name" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: (user === null || user === void 0 ? void 0 : user.firstname) || '' }, field)) }), _jsx(FormMessage, {})] }));
                                            } }), _jsx(FormField, { control: accountForm.control, name: "lastname", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { className: "flex-1", children: [_jsx(FormLabel, { children: "Last Name" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: (user === null || user === void 0 ? void 0 : user.lastname) || '' }, field)) }), _jsx(FormMessage, {})] }));
                                            } })] }), _jsx(FormField, { control: accountForm.control, name: "email", render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: (user === null || user === void 0 ? void 0 : user.email) || '' }, field)) }), _jsx(FormMessage, {})] }));
                                    } }), _jsxs(TwoInputs, { children: [_jsx(FormField, { control: accountForm.control, name: "address", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { className: "flex-1", children: [_jsx(FormLabel, { children: "Address" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: (user === null || user === void 0 ? void 0 : user.address) || '' }, field)) }), _jsx(FormMessage, {})] }));
                                            } }), _jsx(FormField, { control: accountForm.control, name: "city", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { className: "flex-1", children: [_jsx(FormLabel, { children: "City" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: (user === null || user === void 0 ? void 0 : user.city) || '' }, field)) }), _jsx(FormMessage, {})] }));
                                            } })] }), _jsx(FormField, { control: accountForm.control, name: "state", render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "State" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: (user === null || user === void 0 ? void 0 : user.state) || '' }) }) }), _jsx(SelectContent, { children: STATES.map(function (state) { return (_jsx(SelectItem, { value: state.label, className: "cursor-pointer", children: state.value }, state.value)); }) })] }), _jsx(FormMessage, {})] }));
                                    } }), _jsx(Button, { type: "submit", className: 'cursor-pointer mt-10', children: "Save Changes" })] }) }))] })] }));
};
var templateObject_1;
