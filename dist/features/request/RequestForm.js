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
import { Calendar } from "@/common/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, } from "@/common/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { UserContext } from "@/common/contexts/UserContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { STATES } from "@/common/utils/50States";
import { DatePicker } from "@/common/components/form/DatePicker";
export default function RequestForm() {
    var _this = this;
    var user = useContext(UserContext).user;
    var _a = useState(0), step = _a[0], setStep = _a[1];
    var totalSteps = 4;
    var form = useForm();
    var handleSubmit = form.handleSubmit, control = form.control, reset = form.reset;
    var onSubmit = function (formData) { return __awaiter(_this, void 0, void 0, function () {
        var response, responseData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(step < totalSteps - 1)) return [3 /*break*/, 1];
                    setStep(step + 1);
                    return [3 /*break*/, 7];
                case 1:
                    console.log(formData);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch('http://localhost:5050/requestService/requestSubmission', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(formData),
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    responseData = _a.sent();
                    console.log("Service Response:", responseData);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 6];
                case 6:
                    setStep(0);
                    reset();
                    toast.success("Request Form Submitted");
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleBack = function () {
        if (step > 0) {
            setStep(step - 1);
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-center", children: Array.from({ length: totalSteps }).map(function (_, index) { return (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: cn("w-4 h-4 rounded-full transition-all duration-300 ease-in-out", index <= step ? "bg-primary" : "bg-primary/30", index < step && "bg-primary") }), index < totalSteps - 1 && (_jsx("div", { className: cn("w-8 h-0.5", index < step ? "bg-primary" : "bg-primary/30") }))] }, index)); }) }), _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Sokana Service Request Form" }), _jsxs(CardDescription, { children: ["Step ", step + 1, " of ", totalSteps] })] }), _jsxs(CardContent, { children: [step === 0 && (_jsx(Form, __assign({}, form, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "grid gap-y-4", children: [_jsx(FormField, { control: control, name: "first_name", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx("div", { className: "mb-5 font-semibold text-lg underline", children: "Personal Info" }), _jsx(FormLabel, { children: "First Name" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "", autoComplete: "off" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "last_name", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Last Name" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "", autoComplete: "off" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "email", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "", autoComplete: "off" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "phone_number", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Phone Number" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "", autoComplete: "off" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "pronouns", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Pronouns" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select Pronouns", type: "string" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "She/Her", children: "She/Her" }), _jsx(SelectItem, { value: "They/Them", children: "They/Them" }), _jsx(SelectItem, { value: "He/Him", children: "He/Him" }), _jsx(SelectItem, { value: "Ze/Hir/Zir", children: "Ze/Hir/Zir" }), _jsx(SelectItem, { value: "None", children: "None" })] })] }), _jsx(FormDescription, {})] }));
                                            } }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { type: "button", className: "font-medium", size: "sm", onClick: handleBack, disabled: step === 0, children: "Back" }), _jsx(Button, { type: "submit", size: "sm", className: "font-medium", children: step === 3 ? 'Submit' : 'Next' })] })] }) }))), step === 1 && (_jsx(Form, __assign({}, form, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "grid gap-y-4", children: [_jsx(FormField, { control: control, name: "health_history", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx("div", { className: "mb-5 font-semibold text-lg underline", children: "Health Info" }), _jsx(FormLabel, { children: "Health Issues" }), _jsx(FormControl, { children: _jsx(Textarea, __assign({}, field, { placeholder: "", className: "resize-none", rows: 5 })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "allergies", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Allergies" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "Please List any Allergies", autoComplete: "off" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "hospital", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Hospital" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "Name of Hospital", autoComplete: "off" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "due_date", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsx(DatePicker, { field: field, label: "Baby's Due/Birth Date", placeholder: "Select due date" }));
                                            } }), _jsx(FormField, { control: control, name: "baby_sex", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Baby's Sex" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select Baby's Sex", type: "string" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Male", children: "Male" }), _jsx(SelectItem, { value: "Female", children: "Female" })] })] }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "children_expected", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Number of Babies" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: "1", children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { defaultValue: "1", type: "string" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1", children: "1" }), _jsx(SelectItem, { value: "2", children: "2" }), _jsx(SelectItem, { value: "3", children: "3" }), _jsx(SelectItem, { value: "4", children: "4" }), _jsx(SelectItem, { value: "5", children: "5" }), _jsx(SelectItem, { value: "6", children: "6" })] })] }), _jsx(FormDescription, {})] }));
                                            } }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { type: "button", className: "font-medium", size: "sm", onClick: handleBack, disabled: step === 0, children: "Back" }), _jsx(Button, { type: "submit", size: "sm", className: "font-medium", children: step === 3 ? 'Submit' : 'Next' })] })] }) }))), step === 2 && (_jsx(Form, __assign({}, form, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "grid gap-y-4", children: [_jsx(FormField, { control: control, name: "address", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx("div", { className: "mb-5 font-semibold text-lg underline", children: "Home Details" }), _jsx(FormLabel, { children: "Address" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "Enter Your Address" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "city", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "City" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "Enter Your City" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "state", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "State" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "None" }) }) }), _jsx(SelectContent, { children: STATES.map(function (state) { return (_jsx(SelectItem, { value: state.value, children: state.label }, state.value)); }) })] }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "zip_code", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Zip Code" }), _jsx(FormControl, { children: _jsx(Input, __assign({}, field, { placeholder: "Enter Your Zip Code", maxLength: 5, inputMode: "numeric" })) }), _jsx(FormDescription, {})] }));
                                            } }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { type: "button", className: "font-medium", size: "sm", onClick: handleBack, disabled: step === 0, children: "Back" }), _jsx(Button, { type: "submit", size: "sm", className: "font-medium", children: step === 3 ? 'Submit' : 'Next' })] })] }) }))), step === 3 && (_jsx(Form, __assign({}, form, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "grid gap-y-4", children: [_jsx(FormField, { control: control, name: "annual_income", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx("div", { className: "mb-5 font-semibold text-lg underline", children: "Income Info" }), _jsx(FormLabel, { children: "Annual Income" }), _jsx(FormControl, { children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select", type: "string" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "$0-$24,999", children: "$0 - $24,999: Labor - $150 | Postpartum $150 for up to 30hrs of care" }), _jsx(SelectItem, { value: "$25,000-$44,999", children: "$25,000 - $44,999: Labor - $300 | Postpartum $12/hr daytime and $15/hr for overnight " }), _jsx(SelectItem, { value: "$45,000-$64,999", children: "$45,000 - $64,999: Labor - $700 | Postpartum $17/hr daytime and $20/hr for overnight" }), _jsx(SelectItem, { value: "$65,000-$84,999", children: "$65,000 - $84,999: Labor - $1,000 | Postpartum $27/hr daytime and $30/hr for overnight" }), _jsx(SelectItem, { value: "$85,000-$99,999", children: "$85,000 - $99,999: Labor - $1,350 | Postpartum $34/hr daytime and $37/hr for overnight" }), _jsx(SelectItem, { value: "100k and above", children: "$100,000 and above: Labor - $1,500 | Postpartum $37/hr daytime and $40/hr for overnight" })] })] }) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "service_needed", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "What Service Are you Interested In?" }), _jsx(FormControl, { children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Labor", children: "Labor Support" }), _jsx(SelectItem, { value: "1st Night", children: "1st Night Care" }), _jsx(SelectItem, { value: "Postpartum", children: "Postpartum Support" }), _jsx(SelectItem, { value: "Lactation", children: "Lactation Support" }), _jsx(SelectItem, { value: "Perinatal", children: "Perinatal Support" }), _jsx(SelectItem, { value: "Abortion", children: "Abortion Support" }), _jsx(SelectItem, { value: "Other", children: "Other" })] })] }) }), _jsx(FormDescription, {})] }));
                                            } }), _jsx(FormField, { control: control, name: "service_specifics", render: function (_a) {
                                                var field = _a.field;
                                                return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: " Service Specifics" }), _jsx(FormDescription, { children: "What does doula support look like for you? Be specific. How can a labor doula help? For postpartum do you want daytime, overnights and for how many weeks. If you selected Other for the previous question, please elaborate here." }), _jsx(FormControl, { children: _jsx(Textarea, __assign({}, field, { placeholder: "Please be detailed...", autoComplete: "off" })) })] }));
                                            } }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { type: "button", className: "font-medium", size: "sm", onClick: handleBack, disabled: step === 0, children: "Back" }), _jsx(Button, { type: "submit", size: "sm", className: "font-medium", children: step === 3 ? 'Submit' : 'Next' })] })] }) })))] })] })] }));
}
