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
import LongText from '@/common/components/ui/long-text';
import UserAvatar from '@/common/components/user/UserAvatar';
import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
export function UserCard(_a) {
    var user = _a.user, _b = _a.isOverlay, isOverlay = _b === void 0 ? false : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    var _d = useDraggable({
        id: user.id,
    }), attributes = _d.attributes, listeners = _d.listeners, setNodeRef = _d.setNodeRef, isDragging = _d.isDragging;
    var _e = useState(false), mounted = _e[0], setMounted = _e[1];
    useEffect(function () {
        if (isOverlay) {
            var timeout_1 = setTimeout(function () { return setMounted(true); }, 20); // let DOM mount first
            return function () { return clearTimeout(timeout_1); };
        }
    }, [isOverlay]);
    return (_jsx("div", __assign({ ref: setNodeRef }, listeners, attributes, { children: _jsx("div", { "data-shadow-target": true, className: clsx('w-full rounded-md border bg-white p-3 transition-all duration-200 ease-[cubic-bezier(0.18,0.67,0.6,1.22)]', isOverlay && (mounted ? 'scale-110 shadow-xl opacity-90' : 'scale-100 shadow'), !isOverlay && 'shadow', className), children: _jsxs("div", { className: "flex items-center gap-2 max-w-36 h-10", children: [_jsx(UserAvatar, { fullName: "".concat(user.firstname, " ").concat(user.lastname), className: 'h-10 w-10' }), _jsxs("div", { children: [_jsx(LongText, { className: 'max-w-36', children: "".concat(user.firstname, " ").concat(user.lastname) }), _jsx("div", { className: "text-sm text-muted-foreground", children: user.serviceNeeded })] })] }) }) })));
}
