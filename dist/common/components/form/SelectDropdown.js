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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControl } from '@/common/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/common/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
export function SelectDropdown(_a) {
    var defaultValue = _a.defaultValue, onValueChange = _a.onValueChange, isPending = _a.isPending, items = _a.items, placeholder = _a.placeholder, disabled = _a.disabled, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.isControlled, isControlled = _c === void 0 ? false : _c;
    var defaultState = isControlled
        ? { value: defaultValue, onValueChange: onValueChange }
        : { defaultValue: defaultValue, onValueChange: onValueChange };
    return (_jsxs(Select, __assign({}, defaultState, { children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { disabled: disabled, className: cn(className), children: _jsx(SelectValue, { placeholder: placeholder !== null && placeholder !== void 0 ? placeholder : 'Select' }) }) }), _jsx(SelectContent, { children: isPending ? (_jsx(SelectItem, { disabled: true, value: 'loading', className: 'h-14', children: _jsxs("div", { className: 'flex items-center justify-center gap-2', children: [_jsx(Loader, { className: 'h-5 w-5 animate-spin' }), '  ', "Loading..."] }) })) : (items === null || items === void 0 ? void 0 : items.map(function (_a) {
                    var label = _a.label, value = _a.value;
                    return (_jsx(SelectItem, { value: value, children: label }, value));
                })) })] })));
}
