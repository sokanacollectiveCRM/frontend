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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Eye, EyeClosed } from 'lucide-react';
import * as React from 'react';
import { Button } from '../ui/button';
var PasswordInput = React.forwardRef(function (_a, ref) {
    var className = _a.className, disabled = _a.disabled, props = __rest(_a, ["className", "disabled"]);
    var _b = React.useState(false), showPassword = _b[0], setShowPassword = _b[1];
    return (_jsxs("div", { className: cn('relative rounded-md', className), children: [_jsx("input", __assign({ type: showPassword ? 'text' : 'password', className: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', ref: ref, disabled: disabled }, props)), _jsx(Button, { type: 'button', size: 'icon', variant: 'ghost', disabled: disabled, className: 'absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground', onClick: function () { return setShowPassword(function (prev) { return !prev; }); }, children: showPassword ? _jsx(Eye, { size: 18 }) : _jsx(EyeClosed, { size: 18 }) })] }));
});
PasswordInput.displayName = 'PasswordInput';
export { PasswordInput };
