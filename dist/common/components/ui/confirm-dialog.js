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
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/common/components/ui/alert-dialog';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/lib/utils';
export function ConfirmDialog(props) {
    var title = props.title, desc = props.desc, children = props.children, className = props.className, confirmText = props.confirmText, cancelBtnText = props.cancelBtnText, destructive = props.destructive, isLoading = props.isLoading, _a = props.disabled, disabled = _a === void 0 ? false : _a, handleConfirm = props.handleConfirm, actions = __rest(props, ["title", "desc", "children", "className", "confirmText", "cancelBtnText", "destructive", "isLoading", "disabled", "handleConfirm"]);
    return (_jsx(AlertDialog, __assign({}, actions, { children: _jsxs(AlertDialogContent, { className: cn(className && className), children: [_jsxs(AlertDialogHeader, { className: 'text-left', children: [_jsx(AlertDialogTitle, { children: title }), _jsx(AlertDialogDescription, { asChild: true, children: _jsx("div", { children: desc }) })] }), children, _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { disabled: isLoading, children: cancelBtnText !== null && cancelBtnText !== void 0 ? cancelBtnText : 'Cancel' }), _jsx(Button, { variant: destructive ? 'destructive' : 'default', onClick: handleConfirm, disabled: disabled || isLoading, children: confirmText !== null && confirmText !== void 0 ? confirmText : 'Continue' })] })] }) })));
}
