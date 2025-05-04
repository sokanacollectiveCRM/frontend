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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { Controller, FormProvider, useFormContext, useFormState, } from "react-hook-form";
import { Label } from "@/common/components/ui/label";
import { cn } from "@/lib/utils";
var Form = FormProvider;
var FormFieldContext = React.createContext({});
var FormField = function (_a) {
    var props = __rest(_a, []);
    return (_jsx(FormFieldContext.Provider, { value: { name: props.name }, children: _jsx(Controller, __assign({}, props)) }));
};
var useFormField = function () {
    var fieldContext = React.useContext(FormFieldContext);
    var itemContext = React.useContext(FormItemContext);
    var getFieldState = useFormContext().getFieldState;
    var formState = useFormState({ name: fieldContext.name });
    var fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }
    var id = itemContext.id;
    return __assign({ id: id, name: fieldContext.name, formItemId: "".concat(id, "-form-item"), formDescriptionId: "".concat(id, "-form-item-description"), formMessageId: "".concat(id, "-form-item-message") }, fieldState);
};
var FormItemContext = React.createContext({});
function FormItem(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    var id = React.useId();
    return (_jsx(FormItemContext.Provider, { value: { id: id }, children: _jsx("div", __assign({ "data-slot": "form-item", className: cn("grid gap-2", className) }, props)) }));
}
function FormLabel(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    var _b = useFormField(), error = _b.error, formItemId = _b.formItemId;
    return (_jsx(Label, __assign({ "data-slot": "form-label", "data-error": !!error, className: cn("data-[error=true]:text-destructive-foreground", className), htmlFor: formItemId }, props)));
}
function FormControl(_a) {
    var props = __rest(_a, []);
    var _b = useFormField(), error = _b.error, formItemId = _b.formItemId, formDescriptionId = _b.formDescriptionId, formMessageId = _b.formMessageId;
    return (_jsx(Slot, __assign({ "data-slot": "form-control", id: formItemId, "aria-describedby": !error
            ? "".concat(formDescriptionId)
            : "".concat(formDescriptionId, " ").concat(formMessageId), "aria-invalid": !!error }, props)));
}
function FormDescription(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    var formDescriptionId = useFormField().formDescriptionId;
    return (_jsx("p", __assign({ "data-slot": "form-description", id: formDescriptionId, className: cn("text-muted-foreground text-sm", className) }, props)));
}
function FormMessage(_a) {
    var _b;
    var className = _a.className, props = __rest(_a, ["className"]);
    var _c = useFormField(), error = _c.error, formMessageId = _c.formMessageId;
    var body = error ? String((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : "") : props.children;
    if (!body) {
        return null;
    }
    return (_jsx("p", __assign({ "data-slot": "form-message", id: formMessageId, className: cn("text-destructive-foreground text-sm", className) }, props, { children: body })));
}
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };
