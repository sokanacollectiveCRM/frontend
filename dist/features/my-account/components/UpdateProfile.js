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
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import { useUser } from '@/common/hooks/user/useUser';
import saveUser from '@/common/utils/saveUser';
import { useForm } from "react-hook-form";
import UserAvatar from "../../../common/components/user/UserAvatar";
export var Profile = function () {
    var _a = useUser(), user = _a.user, isLoading = _a.isLoading;
    var profileForm = useForm({
        defaultValues: {
            bio: "",
        },
    });
    var submitProfileForm = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var formData, savedUser, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    formData = new FormData();
                    formData.append('id', user.id);
                    formData.append('bio', (_a = values.bio) !== null && _a !== void 0 ? _a : '');
                    formData.append('profile_picture', (_b = values.profile_picture) !== null && _b !== void 0 ? _b : '');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, saveUser(formData)];
                case 2:
                    savedUser = _c.sent();
                    console.log("User saved successfully:", savedUser);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _c.sent();
                    console.error("User NOT saved successfully:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // might need to add an error check here if user context isn't working
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs(Card, { className: "min-h-96 py-5", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile" }), _jsx(CardDescription, { children: "This is how others see you" })] }), _jsxs(CardContent, { className: "flex flex-col flex-1", children: [_jsxs(Card, { children: [_jsx(CardContent, { children: _jsx(UserAvatar, { profile_picture: user === null || user === void 0 ? void 0 : user.profile_picture, fullName: "".concat((user === null || user === void 0 ? void 0 : user.firstname) || '', " ").concat((user === null || user === void 0 ? void 0 : user.lastname) || ''), className: 'h-35 w-35' }) }), _jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "".concat((user === null || user === void 0 ? void 0 : user.firstname) || '', " ").concat((user === null || user === void 0 ? void 0 : user.lastname) || '') }), _jsx(CardDescription, { children: (user === null || user === void 0 ? void 0 : user.email) || '' })] })] }), _jsx(Separator, {}), _jsx(Form, __assign({}, profileForm, { children: _jsxs("form", { onSubmit: profileForm.handleSubmit(submitProfileForm), className: "flex flex-col flex-1 py-5 space-y-4", children: [_jsx(FormField, { control: profileForm.control, name: "profile_picture", render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Profile Picture" }), _jsx(FormControl, { children: _jsx(Input, { type: "file", accept: "image/jpeg,image/png,image/webp", onChange: function (e) {
                                                            var _a;
                                                            var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                                                            field.onChange(file || undefined);
                                                        }, className: "cursor-pointer" }) }), _jsx(FormMessage, {})] }));
                                    } }), _jsx(FormField, { control: profileForm.control, name: "bio", render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "pb-1", children: "Bio" }), _jsx(FormControl, { children: _jsx(Textarea, __assign({ placeholder: "Current: ".concat((user === null || user === void 0 ? void 0 : user.bio) || '') }, field)) }), _jsx(FormMessage, {})] }));
                                    } }), _jsx(Button, { type: "submit", className: "cursor-pointer mt-10", children: "Save Changes" })] }) }))] })] }));
};
